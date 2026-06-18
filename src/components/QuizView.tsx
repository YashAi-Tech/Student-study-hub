import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ArrowLeft, RotateCcw, Award, Trophy, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface QuizViewProps {
  userId: string;
  analysisId: string;
  questions: Question[];
  onBack: () => void;
}

export default function QuizView({ userId, analysisId, questions, onBack }: QuizViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;

  const handleSelect = (idx: number) => {
    if (isAnswering) return;
    setSelectedIdx(idx);
    setIsAnswering(true);

    const isCorrect = idx === currentQuestion.answerIndex;
    setAnswers([...answers, isCorrect]);

    setTimeout(() => {
      if (isLastQuestion) {
        finishQuiz([...answers, isCorrect]);
      } else {
        setCurrentIdx(currentIdx + 1);
        setSelectedIdx(null);
        setIsAnswering(false);
      }
    }, 1200);
  };

  const finishQuiz = async (finalAnswers: boolean[]) => {
    const score = (finalAnswers.filter(a => a).length / questions.length) * 100;
    
    // Save to Firebase
    let performance: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' = 'Beginner';
    if (score === 100) performance = 'Expert';
    else if (score >= 80) performance = 'Advanced';
    else if (score >= 60) performance = 'Intermediate';

    await addDoc(collection(db, 'quizzes'), {
      userId,
      analysisId,
      score,
      performance,
      createdAt: serverTimestamp(),
    });

    setShowResults(true);
    if (score >= 80) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswers([]);
    setShowResults(false);
    setIsAnswering(false);
  };

  if (showResults) {
    const score = (answers.filter(a => a).length / questions.length) * 100;
    const rating = Math.round(score / 10);
    let level = 'Beginner';
    if (score === 100) level = 'Expert';
    else if (score >= 80) level = 'Advanced';
    else if (score >= 60) level = 'Intermediate';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl p-10 text-center"
        >
          <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-amber-50 dark:ring-amber-900/10">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-2">Results</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">Performance Scorecard</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
              <p className="text-3xl font-black text-slate-800 dark:text-white">{Math.round(score)}%</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Quiz Score</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner">
              <p className="text-3xl font-black text-slate-800 dark:text-white">{rating}/10</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Rating</p>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-8 flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm shrink-0">
              {level.substring(0, 3)}
            </div>
            <div>
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Level Reached</p>
              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-wider">{level} Level</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {score >= 80 ? "Mastery achieved! You've grasped all core concepts." : 
                 score >= 60 ? "Solid understanding. Re-read concepts to go expert." : 
                 "Foundation building. Keep practicing with new documents!"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={onBack}
              className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
            >
              Finish Challenge
            </button>
            <button 
              onClick={resetQuiz}
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 font-bold uppercase tracking-widest text-[10px] mx-auto py-2 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Retake Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col">
        {/* Header with Title and Progress */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Knowledge Check</h3>
              <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Analysis: Assessment</p>
            </div>
            <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest">
              Question {currentIdx + 1} of {questions.length}
            </p>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              className="h-full bg-indigo-600"
            />
          </div>
        </div>

        <div className="p-10 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1"
            >
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-10 leading-relaxed text-center">
                {currentQuestion.question}
              </h2>

              <div className="flex flex-col gap-4">
                {currentQuestion.options.map((option, i) => {
                  const isCorrect = i === currentQuestion.answerIndex;
                  const isSelected = selectedIdx === i;
                  
                  let stateStyle = 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-900 text-slate-600 dark:text-slate-300';
                  if (isAnswering) {
                    if (isCorrect) stateStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 ring-2 ring-indigo-600/10';
                    else if (isSelected) stateStyle = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 ring-2 ring-red-500/10';
                  } else if (isSelected) {
                    stateStyle = 'border-indigo-600 ring-2 ring-indigo-600/10';
                  }

                  return (
                    <motion.button 
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(i)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all text-sm font-bold tracking-tight flex items-center justify-between group ${stateStyle}`}
                    >
                      <span>{option}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isAnswering && isCorrect ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/20' : 
                        isAnswering && isSelected && !isCorrect ? 'bg-red-500 border-red-500' : 
                        'border-slate-200 dark:border-slate-600 group-hover:border-indigo-300'
                      }`}>
                        {(isAnswering && isCorrect) && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                        {(isAnswering && isSelected && !isCorrect) && <X className="w-3 h-3 text-white" strokeWidth={4} />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <button onClick={onBack} className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-slate-600 transition-colors">
        <ArrowLeft className="w-3 h-3" />
        Discard Quiz
      </button>
    </div>
  );
}
