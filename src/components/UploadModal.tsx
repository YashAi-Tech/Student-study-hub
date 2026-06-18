import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface UploadModalProps {
  userId: string;
  onClose: () => void;
  onAnalysisComplete: (analysis: any) => void;
}

export default function UploadModal({ userId, onClose, onAnalysisComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(selected.type)) {
        setFile(selected);
        setError('');
      } else {
        setError('Unsupported file type. Please use PDF, DOCX, or TXT.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);

      setStatus('analyzing');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'analyses'), {
        userId,
        fileName: file.name,
        fileType: file.type,
        summaryShort: data.summaryShort,
        summaryLong: data.summaryLong,
        keyPoints: data.keyPoints,
        concepts: data.concepts,
        difficulty: data.difficulty,
        readingTime: data.readingTime,
        quiz: data.quiz, // Added to analysis doc for easy access
        createdAt: serverTimestamp(),
      });

      setStatus('done');
      onAnalysisComplete({ id: docRef.id, ...data, fileName: file.name, userId });
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-8 overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <button onClick={onClose} className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Content Ingestion</h2>
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Upload Document</h3>
        </div>

        <div className="space-y-6">
          {status === 'idle' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all shadow-inner"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept=".pdf,.docx,.txt" />
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                {file ? file.name : 'Tap to select document'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">PDF, DOCX or TXT (Max 20MB)</p>
            </div>
          )}

          {(status === 'uploading' || status === 'analyzing') && (
            <div className="py-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-indigo-100 dark:border-slate-700 border-t-indigo-600 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
                {status === 'uploading' ? 'Sending Data...' : 'AI Processing...'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 animate-pulse">Establishing Contextual Mapping</p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Process Failed</h3>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-2 mb-8">{error}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="bg-slate-100 dark:bg-slate-700 px-8 py-3 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-widest"
              >
                Retry
              </button>
            </div>
          )}

          {status === 'idle' && file && (
            <button 
              onClick={handleUpload}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-transform"
            >
              Analyze with Intelligence
            </button>
          )}

          {error && status === 'idle' && (
            <p className="text-center text-[10px] text-red-500 font-bold uppercase tracking-widest">{error}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
