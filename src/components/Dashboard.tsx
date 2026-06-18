import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Upload, FileText, Clock, ChevronRight, Plus, User as UserIcon, LogOut } from 'lucide-react';
import { Analysis, UserProfile } from '../types';

interface DashboardProps {
  user: any;
  profile: UserProfile | null;
  onSelectAnalysis: (analysis: Analysis) => void;
  onStartUpload: () => void;
}

export default function Dashboard({ user, profile, onSelectAnalysis, onStartUpload }: DashboardProps) {
  const [history, setHistory] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Analysis));
        setHistory(docs);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.uid]);

  const stats = [
    { label: 'Analyses', value: history.length > 0 ? history.length : '0', icon: FileText, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Avg Score', value: '84%', icon: Clock, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Welcome back,</h2>
          <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white">
            {profile?.fullName || user.displayName || 'Learner'}?
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stats and Welcome */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Account Stats</h2>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Top 5% Learner</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              You've analyzed {history.length} documents recently. Great consistency!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className={`p-2 w-8 h-8 rounded-lg mb-2 flex items-center justify-center ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Action Card */}
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={onStartUpload}
            className="w-full bg-indigo-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-indigo-600/20 group text-left"
          >
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">New Analysis</h3>
              <p className="text-indigo-100 text-[11px] opacity-90 mb-4">PDF, DOCX or TXT files up to 20MB</p>
              <div className="w-full py-4 border-2 border-dashed border-indigo-400 rounded-xl flex flex-col items-center justify-center bg-indigo-500/30 cursor-pointer">
                <Plus className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold uppercase tracking-wider">Tap to Analyze</span>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Analysis History</h3>
              <button className="text-xs font-bold text-indigo-600">View All</button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-50 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-600">
                    <Upload className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => onSelectAnalysis(item)}
                      className="flex items-center gap-4 group cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 border transition-colors ${
                        item.fileType.includes('pdf') ? 'bg-red-50 text-red-600 border-red-100' :
                        item.fileType.includes('word') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {item.fileType.includes('pdf') ? 'PDF' : item.fileType.includes('word') ? 'DOC' : 'TXT'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors truncate">{item.fileName}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                          {new Date(item.createdAt?.toDate()).toLocaleDateString()} • {item.difficulty}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
