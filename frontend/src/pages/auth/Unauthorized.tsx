import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    if (user?.role === 'admin') navigate('/admin/dashboard');
    else if (user?.role === 'trainer') navigate('/trainer/dashboard');
    else navigate('/member/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#07080d] text-[#15131D] dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden theme-transition">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full text-center bg-white dark:bg-[#0b0d14]/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl shadow-purple-500/5 relative z-10 theme-transition">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#15131D] dark:text-white tracking-tight">
          Access Restricted
        </h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-2 mb-6 leading-relaxed">
          You do not have administrative or authorized permissions to view this section of the FitSync platform.
        </p>
        <button
          onClick={handleReturn}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Your Dashboard
        </button>
      </div>
    </div>
  );
};

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#07080d] text-[#15131D] dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden theme-transition">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full text-center bg-white dark:bg-[#0b0d14]/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl shadow-purple-500/5 relative z-10 theme-transition">
        <p className="text-5xl font-black text-purple-600/40 dark:text-purple-400/40 font-mono tracking-tighter">
          404
        </p>
        <h1 className="text-xl sm:text-2xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1.5 mb-6">
          The requested page could not be located on the FitSync platform.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Return Home
        </button>
      </div>
    </div>
  );
};
