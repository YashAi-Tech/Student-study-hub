import React from 'react';
import { motion } from 'motion/react';
import { FileText, List, Lightbulb, TrendingUp, Clock, Download, Copy, BrainCircuit, PlayCircle, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Analysis } from '../types';
import jsPDF from 'jspdf';

interface AnalysisViewProps {
  analysis: Analysis;
  onBack: () => void;
  onStartQuiz: () => void;
}

export default function AnalysisView({ analysis, onBack, onStartQuiz }: AnalysisViewProps) {
  const handleCopy = () => {
    const text = `${analysis.summaryShort}\n\nKey Points:\n${analysis.keyPoints.join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(analysis.fileName, 20, 20);
    doc.setFontSize(14);
    doc.text('AI Summary', 20, 35);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(analysis.summaryLong, 170);
    doc.text(splitText, 20, 45);
    doc.save(`${analysis.fileName}-summary.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{analysis.fileName}</h2>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Analysis Report • AI Generated</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
              Copy
            </button>
            <button onClick={downloadPDF} className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
        {/* Main Content Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Difficulty</p>
              <p className={`text-xl font-black ${analysis.difficulty === 'Hard' ? 'text-red-500' : analysis.difficulty === 'Medium' ? 'text-orange-500' : 'text-emerald-500'}`}>
                {analysis.difficulty}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Read Time</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{analysis.readingTime}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Topic</p>
              <p className="text-xl font-black text-slate-800 dark:text-white truncate">Education</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-slate-200 dark:border-slate-700 p-8">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
              Executive Summary
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic mb-8 border-l-4 border-indigo-100 dark:border-indigo-900/50 pl-6">
                {analysis.summaryShort}
              </p>
              <ReactMarkdown className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">{analysis.summaryLong}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              Key Takeaways
            </h3>
            <ul className="space-y-4">
              {analysis.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-4 group">
                  <div className="mt-1.5 w-2 h-2 rounded-full border-2 border-indigo-600 shrink-0 group-hover:bg-indigo-600 transition-colors" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-snug">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              Core Concepts
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.concepts.map((concept, i) => (
                <span key={i} className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-indigo-600 uppercase tracking-widest shadow-sm">
                  {concept}
                </span>
              ))}
            </div>
          </div>

          <button 
            onClick={onStartQuiz}
            className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <PlayCircle className="w-6 h-6" />
            Start Quiz Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
