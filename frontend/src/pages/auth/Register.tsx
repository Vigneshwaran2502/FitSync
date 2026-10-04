import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight, Dumbbell, Check, X } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP State
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // Password Validations
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresOtp) {
      handleOtpSubmit();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!isPasswordValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const res = await authApi.register({ name, email, password, phone });
      
      if (res.requiresOtp) {
        setRequiresOtp(true);
        setError('Registration successful! Please check your email for the OTP.');
        return;
      }

      // Fallback if no OTP required (though our backend now requires it)
      if (res.token && res.user) {
        setAuth(res.token, res.user);
        navigate('/member');
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.verifyOtp(email, otp);
      if (res.token && res.user) {
        setAuth(res.token, res.user);
        navigate('/member', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ met, text }: { met: boolean, text: string }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${met ? 'text-lime-600 dark:text-lime-400 font-medium' : 'text-[#8E8A9C] dark:text-slate-500'}`}>
      {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3F7] dark:bg-[#05060a] p-4 sm:p-6 lg:p-8 theme-transition relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 dark:bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-lime-400/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Bar with Theme Toggle and Back Link */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <Link
          to="/"
          className="text-xs font-bold text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
        >
          <span>&larr; Return to FitSync</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md mt-10 sm:mt-0">
        <div className="text-center relative z-10 mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-lime-400 p-[1.5px] shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-[#0b0d14] rounded-[14px] flex items-center justify-center theme-transition">
                <Dumbbell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
            {requiresOtp ? 'Verify Your Account' : 'Create an Account'}
          </h1>
          <p className="mt-2 text-xs text-[#686476] dark:text-slate-400">
            {requiresOtp ? 'Enter the 6-digit OTP sent to your email.' : 'Join FitSync and start your journey today'}
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white dark:bg-[#0b0d15] py-8 px-6 sm:px-10 shadow-[0_20px_50px_rgba(30,20,60,0.06)] dark:shadow-2xl dark:shadow-purple-950/40 border border-[#E8E5EE] dark:border-slate-800 rounded-3xl theme-transition">
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {error}
              </div>
            )}

            {!requiresOtp ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Chen"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-10 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#8E8A9C] hover:text-[#15131D] dark:hover:text-white transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Checklist */}
                  {password.length > 0 && (
                    <div className="mt-3 p-3 bg-[#F8F7FA] dark:bg-slate-900 rounded-xl border border-[#E8E5EE] dark:border-slate-800 grid grid-cols-2 gap-2">
                      <ValidationItem met={hasLength} text="At least 8 characters" />
                      <ValidationItem met={hasUpper} text="One uppercase letter" />
                      <ValidationItem met={hasNumber} text="One number" />
                      <ValidationItem met={hasSpecial} text="One special character" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <span>Creating account...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5 text-center">6-Digit Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      placeholder="123456"
                      className="w-full text-center tracking-widest text-lg font-mono py-3 border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <span>Verify OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 text-center text-xs text-[#686476] dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
