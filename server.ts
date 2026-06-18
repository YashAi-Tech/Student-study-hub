import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
// @ts-ignore
import pdf from "pdf-parse";
import mammoth from "mammoth";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

// AI analysis helper
async function analyzeContent(text: string) {
  const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following educational content and provide a structured JSON response.
    Content: ${text.substring(0, 15000)} // Truncate to avoid token limits for now

    The JSON response must include:
    - summaryShort: A 2-3 sentence summary.
    - summaryLong: A detailed summary in markdown format.
    - keyPoints: An array of 5-8 key takeaways.
    - concepts: An array of important terms or concepts.
    - difficulty: "Easy", "Medium", or "Hard".
    - readingTime: Estimated reading time (e.g., "5 mins").
    - quiz: An array of 5-10 multiple choice questions. Each question object: { question, options, answerIndex }.

    Return ONLY the valid JSON.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let jsonString = response.text().trim();
  
  // Clean up markdown block if present
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.replace(/^```json/, "").replace(/```$/, "");
  }

  return JSON.parse(jsonString);
}

app.use(express.json());

// API Routes
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractedText = "";
    const fileType = req.file.mimetype;

    if (fileType === "application/pdf") {
      const data = await pdf(req.file.buffer);
      extractedText = data.text;
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      extractedText = data.value;
    } else if (fileType === "text/plain") {
      extractedText = req.file.buffer.toString("utf-8");
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Could not extract text from file" });
    }

    const analysis = await analyzeContent(extractedText);
    res.json(analysis);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze document" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
