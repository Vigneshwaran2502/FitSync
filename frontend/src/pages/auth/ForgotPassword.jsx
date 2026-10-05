import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Dumbbell } from "lucide-react";
import { authApi } from "../../api/authApi";
import { ThemeToggle } from "../../components/common/ThemeToggle";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send password reset request.");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#07080d] text-[#15131D] dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 theme-transition relative overflow-hidden">
      {
    /* Ambient background glows */
  }
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/10 dark:bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-lime-400/10 blur-[100px] pointer-events-none rounded-full" />

      {
    /* Top Bar */
  }
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link
    to="/login"
    className="text-xs font-bold text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
  >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to login</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 pt-8 sm:pt-0">
        <Link to="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-lime-400 p-[1.5px] shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-[#0b0d14] rounded-[14px] flex items-center justify-center theme-transition">
              <Dumbbell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-left">
            <span className="text-xl font-black tracking-tight text-[#15131D] dark:text-white block leading-none">
              Fit<span className="text-purple-600 dark:text-purple-400">Sync</span>
            </span>
            <span className="text-[10px] font-semibold text-[#686476] dark:text-slate-400 uppercase tracking-widest">
              Recovery Portal
            </span>
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
          Reset Password
        </h2>
        <p className="mt-1.5 text-xs text-[#686476] dark:text-slate-400">
          Enter your registered email address to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white dark:bg-[#0b0d14]/90 backdrop-blur-xl py-8 px-6 sm:px-8 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-xl shadow-purple-500/5 theme-transition">
          {message ? <div className="text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-[#15131D] dark:text-white">Check Your Inbox</p>
              <p className="text-xs text-[#686476] dark:text-slate-400 mt-1 mb-6 leading-relaxed">
                {message}
              </p>
              <Link
    to="/login"
    className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/25 transition-all"
  >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            </div> : <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>}
              <div>
                <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#686476] dark:text-slate-400 absolute left-3.5 top-3.5" />
                  <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="you@example.com"
    className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
  />
                </div>
              </div>

              <button
    type="submit"
    disabled={isLoading}
    className="w-full py-3 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
  >
                {isLoading ? <span>Sending instructions...</span> : <span>Send Reset Link</span>}
              </button>

              <div className="text-center pt-2">
                <Link
    to="/login"
    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
  >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to login
                </Link>
              </div>
            </form>}
        </div>
      </div>
    </div>;
};
export {
  ForgotPassword
};
