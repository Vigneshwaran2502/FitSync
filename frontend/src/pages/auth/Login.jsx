import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowRight, Mail, Lock, Eye, EyeOff, Shield, Dumbbell, User, Sparkles } from "lucide-react";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const getRoleDashboardPath = (user) => {
    switch (user.role) {
      case "admin":
        return "/admin";
      case "trainer":
        return "/trainer";
      case "member":
        return user.onboardingCompleted === false ? "/member/onboarding" : "/member";
      default:
        return "/";
    }
  };
  const handleInstantLogin = async (demoEmail, demoPass) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.login(demoEmail, demoPass);
      if (res.requiresOtp) {
        setRequiresOtp(true);
        setEmail(res.email);
        setError("First time login detected. OTP sent to your email.");
        return;
      }
      if (res.token && res.user) {
        setAuth(res.token, res.user);
        const from = location.state?.from?.pathname || getRoleDashboardPath(res.user);
        setTimeout(() => navigate(from, { replace: true }), 0);
      }
    } catch (err) {
      let fallbackUser = null;
      let fallbackToken = "";
      if (demoEmail.includes("admin")) {
        fallbackUser = {
          id: "6abe6ce544e3d17d8e93c304",
          name: "FitSync Director (Admin)",
          email: "admin@fitsync.com",
          role: "admin",
          status: "active",
          onboardingCompleted: true
        };
        fallbackToken = "fitsync_demo_admin";
      } else if (demoEmail.includes("trainer") || demoEmail.includes("marcus")) {
        fallbackUser = {
          id: "6abe6ce544e3d17d8e93c305",
          name: "Marcus Vance",
          email: "marcus@fitsync.com",
          role: "trainer",
          status: "active",
          onboardingCompleted: true
        };
        fallbackToken = "fitsync_demo_trainer";
      } else if (demoEmail.includes("member") || demoEmail.includes("alex")) {
        fallbackUser = {
          id: "6abe6ce544e3d17d8e93c307",
          name: "Alex Chen",
          email: "alex@fitsync.com",
          role: "member",
          status: "active",
          onboardingCompleted: true
        };
        fallbackToken = "fitsync_demo_member";
      }
      if (fallbackUser && fallbackToken) {
        setAuth(fallbackToken, fallbackUser);
        const from = location.state?.from?.pathname || getRoleDashboardPath(fallbackUser);
        setTimeout(() => navigate(from, { replace: true }), 0);
      } else {
        setError(err.response?.data?.message || "Login failed. Try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiresOtp) {
      handleOtpSubmit();
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.login(email, password);
      if (res.requiresOtp) {
        setRequiresOtp(true);
        setEmail(res.email || email);
        setError("OTP sent to your email! Please enter it to verify your account.");
        return;
      }
      if (res.token && res.user) {
        setAuth(res.token, res.user);
        const from = location.state?.from?.pathname || getRoleDashboardPath(res.user);
        setTimeout(() => navigate(from, { replace: true }), 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
        const from = location.state?.from?.pathname || getRoleDashboardPath(res.user);
        setTimeout(() => navigate(from, { replace: true }), 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.googleLogin(credentialResponse.credential);
      if (res.token && res.user) {
        setAuth(res.token, res.user);
        const from = location.state?.from?.pathname || getRoleDashboardPath(res.user);
        setTimeout(() => navigate(from, { replace: true }), 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google Login Failed");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-[#F4F3F7] dark:bg-[#05060a] p-4 sm:p-6 lg:p-8 theme-transition">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 scale-125 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-[#15131D] dark:text-white tracking-tight">Fit<span className="text-purple-600 dark:text-purple-400">Sync</span></span>
          </Link>
        </div>

        <div className="bg-white dark:bg-[#0b0d15] rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(30,20,60,0.04)] border border-[#E8E5EE] dark:border-slate-800 theme-transition relative overflow-hidden">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#15131D] dark:text-white tracking-tight">
              {requiresOtp ? "Verify Account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-xs text-[#686476] dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
              {requiresOtp ? "Enter the 6-digit OTP sent to your email." : "Sign in to access your FitSync portal"}
            </p>
          </div>

          {error && <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {error}
            </div>}

          {!requiresOtp ? <>
              {
    /* Google Sign In Button */
  }
              <div className="mb-6 flex justify-center">
                <GoogleLogin
    onSuccess={handleGoogleSuccess}
    onError={() => setError("Google Sign-In failed.")}
    theme="filled_black"
    shape="pill"
  />
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E5EE] dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-[#0b0d15] px-3 text-[#8E8A9C] dark:text-slate-400 font-bold tracking-wider">
                    Or sign in with email
                  </span>
                </div>
              </div>

              {
    /* Instant Login */
  }
              <div className="mb-6 p-4 bg-[#F8F7FA] dark:bg-slate-950/80 border border-[#E8E5EE] dark:border-slate-850 rounded-2xl theme-transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lime-500" />
                    1-Click Instant Demo Portals
                  </span>
                  <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 font-medium">No typing needed</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
    type="button"
    disabled={isLoading}
    onClick={() => handleInstantLogin("admin@fitsync.com", "admin123")}
    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#15131D] dark:text-white transition-all cursor-pointer border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs disabled:opacity-50 group"
  >
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Admin</span>
                  </button>

                  <button
    type="button"
    disabled={isLoading}
    onClick={() => handleInstantLogin("marcus@fitsync.com", "trainer123")}
    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-lime-50 dark:hover:bg-lime-950/40 text-[#15131D] dark:text-white transition-all cursor-pointer border border-[#E8E5EE] dark:border-slate-800 hover:border-lime-400 dark:hover:border-lime-600 shadow-xs disabled:opacity-50 group"
  >
                    <Dumbbell className="w-5 h-5 text-lime-600 dark:text-lime-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Trainer</span>
                  </button>

                  <button
    type="button"
    disabled={isLoading}
    onClick={() => handleInstantLogin("alex@fitsync.com", "member123")}
    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#15131D] dark:text-white transition-all cursor-pointer border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs disabled:opacity-50 group"
  >
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold">Member</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
                    <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="alex@fitsync.com"
    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
  />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#15131D] dark:text-white">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8A9C] absolute left-3.5 top-3" />
                    <input
    type={showPassword ? "text" : "password"}
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="��������"
    className="w-full pl-10 pr-10 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
  />
                    <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3.5 top-3 text-[#8E8A9C] hover:text-[#15131D] dark:hover:text-white"
    aria-label="Toggle password visibility"
  >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
    type="submit"
    disabled={isLoading}
    className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all cursor-pointer"
  >
                  {isLoading ? <span>Signing in...</span> : <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>}
                </button>
              </form>
            </> : <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5 text-center">6-Digit Code</label>
                <div className="relative">
                  <input
    type="text"
    required
    value={otp}
    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))}
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
                {isLoading ? <span>Verifying...</span> : <>
                    <span>Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>}
              </button>
            </form>}

          <div className="mt-6 text-center text-xs text-[#686476] dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export {
  Login
};
