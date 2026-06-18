import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Globe, Mail, Lock, User, Calendar } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // New user from Google
        await setDoc(doc(db, 'users', result.user.uid), {
          fullName: result.user.displayName,
          email: result.user.email,
          createdAt: new Date(),
          age: null // Need to ask later
        });
      }
      onAuthSuccess(result.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          fullName,
          age: parseInt(age),
          email,
          createdAt: new Date()
        });
        onAuthSuccess(result.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 border border-slate-200 dark:border-slate-700"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl shadow-xl shadow-indigo-600/30 mx-auto mb-6">S</div>
          <h1 className="text-3xl font-display font-black text-slate-800 dark:text-white uppercase tracking-tighter">StudyAI</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Intelligence for Learning</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-700 p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-slate-600 shadow-inner">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-500 shadow-md text-indigo-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-500 shadow-md text-indigo-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Join
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="FULL NAME"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs font-bold tracking-widest placeholder:text-slate-300"
                />
              </div>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="number" 
                  placeholder="AGE"
                  required
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs font-bold tracking-widest placeholder:text-slate-300"
                />
              </div>
            </>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs font-bold tracking-widest placeholder:text-slate-300"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="password" 
              placeholder="PASSWORD"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs font-bold tracking-widest placeholder:text-slate-300"
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading ? 'Processing...' : isLogin ? 'Access Account' : 'Initialize Profile'}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white dark:bg-slate-800 px-4 text-slate-400 font-bold uppercase tracking-widest">Unified Identity</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 dark:border-slate-700 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
        >
          <Globe className="w-4 h-4" />
          Continue with Google
        </button>
        </motion.div>
      </div>
    );
}
