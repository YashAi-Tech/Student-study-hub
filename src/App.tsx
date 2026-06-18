import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { ThemeProvider } from './components/ThemeContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import QuizView from './components/QuizView';
import UploadModal from './components/UploadModal';
import { Analysis, AppView, UserProfile } from './types';
import { LogOut, Sun, Moon, User as UserIcon, Clock, Plus } from 'lucide-react';
import { useTheme } from './components/ThemeContext';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<AppView>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setProfile({ uid: u.uid, ...userDoc.data() } as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setView('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors flex flex-col">
      {/* Top Navigation */}
      <nav className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">S</div>
          <span className="text-xl font-black tracking-tighter text-slate-800 dark:text-white">StudyAI</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest">{profile?.fullName || user.displayName || 'Learner'}</p>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em]">Plus Account</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
            <button 
              onClick={() => toggleTheme()}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-600 hover:text-indigo-600 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-600 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && (
          <Dashboard 
            user={user} 
            profile={profile}
            onSelectAnalysis={(a) => {
              setCurrentAnalysis(a);
              setView('analysis');
            }}
            onStartUpload={() => setShowUpload(true)}
          />
        )}
        
        {view === 'analysis' && currentAnalysis && (
          <AnalysisView 
            analysis={currentAnalysis}
            onBack={() => setView('dashboard')}
            onStartQuiz={() => setView('quiz')}
          />
        )}

        {view === 'quiz' && currentAnalysis && (
          <QuizView 
            userId={user.uid}
            analysisId={currentAnalysis.id}
            questions={(currentAnalysis as any).quiz || []}
            onBack={() => setView('analysis')}
          />
        )}

        {(view === 'history' || view === 'profile') && (
          <div className="p-8 text-center text-slate-500">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Module Offline</h2>
            <p className="text-xl font-bold text-slate-800 dark:text-white mb-6">This feature is being polished</p>
            <button 
              onClick={() => setView('dashboard')} 
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
            >
              Return Home
            </button>
          </div>
        )}
      </main>

      {/* Floating Plus for Mobile */}
      <button 
        onClick={() => setShowUpload(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/40 flex items-center justify-center z-[60] active:scale-90 transition-transform"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </button>

      {/* Modals */}
      {showUpload && (
        <UploadModal 
          userId={user.uid}
          onClose={() => setShowUpload(false)}
          onAnalysisComplete={(a) => {
            setCurrentAnalysis(a);
            setShowUpload(false);
            setView('analysis');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
