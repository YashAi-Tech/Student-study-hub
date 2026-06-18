export interface UserProfile {
  uid: string;
  fullName: string;
  age: number;
  createdAt: any;
}

export interface Analysis {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  summaryShort: string;
  summaryLong: string;
  keyPoints: string[];
  concepts: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  readingTime: string;
  createdAt: any;
}

export interface Question {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface Quiz {
  id: string;
  analysisId: string;
  userId: string;
  questions: Question[];
  score: number;
  rating: number;
  performance: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt: any;
}

export type AppView = 'login' | 'signup' | 'dashboard' | 'history' | 'profile' | 'analysis' | 'quiz';
