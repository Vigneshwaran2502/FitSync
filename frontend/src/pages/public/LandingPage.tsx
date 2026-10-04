import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Dumbbell,
  Shield,
  Users,
  Activity,
  QrCode,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Star,
  MapPin,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Check,
  Building2,
  Bell,
  Award,
  Menu,
  X,
  Target,
  Flame,
  ArrowUpRight,
  TrendingDown,
  Lock,
  PauseCircle,
  FileSpreadsheet,
  AlertTriangle,
  Smartphone,
  BarChart3,
  UserCheck,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { apiClient } from '../../api/axios';

interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  features: string[];
  isActive?: boolean;
  tier?: string;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isDark } = useTheme();

  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Product Preview Tab state
  const [activeTab, setActiveTab] = useState<'admin' | 'member' | 'trainer'>('member');

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dynamic Membership Plans from backend
  const [plans, setPlans] = useState<MembershipPlan[]>([
    {
      _id: 'plan-basic',
      name: 'Basic Access',
      description: 'Affordable gym access for getting started with standard floor hours.',
      price: 999,
      durationMonths: 1,
      features: [
        'Gym floor & cardio equipment access',
        'Digital QR code attendance check-in',
        'Basic locker & shower facilities',
        'FitSync Member Mobile Web Dashboard',
      ],
      tier: 'basic',
    },
    {
      _id: 'plan-pro',
      name: 'Pro Performance',
      description: 'For members who want structured training, progress analytics, and coach guidance.',
      price: 1999,
      durationMonths: 1,
      features: [
        'Everything in Basic Access',
        'Custom workout plan tracking & history',
        'Biometric progress & weight analytics',
        '1 Monthly trainer consultation & session',
        'Personal fitness goals & PR tracking',
        'Sauna & recovery zone access',
      ],
      tier: 'standard',
    },
    {
      _id: 'plan-elite',
      name: 'Elite All-Access',
      description: 'A complete personalized fitness experience with priority 1-on-1 personal coaching.',
      price: 2999,
      durationMonths: 1,
      features: [
        'Everything in Pro Performance',
        '4 Monthly 1-on-1 personal training hours',
        'Priority appointment scheduling slots',
        'Advanced DEXA / body composition logs',
        'Personalized nutrition & periodization guidance',
        'Complimentary guest passes (2 per month)',
      ],
      tier: 'premium',
    },
  ]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);

  // Fetch real plans dynamically from backend API
  useEffect(() => {
    let isMounted = true;
    const loadPlans = async () => {
      try {
        setIsPlansLoading(true);
        const res = await apiClient.get('/memberships');
        if (isMounted && res.data?.plans && Array.isArray(res.data.plans) && res.data.plans.length > 0) {
          const backendPlans = res.data.plans.map((p: any) => ({
            ...p,
            price: p.price,
          }));
          setPlans(backendPlans);
        }
      } catch {
        // Fallback to defaults
      } finally {
        if (isMounted) setIsPlansLoading(false);
      }
    };
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  // Role-based route resolver
  const handleRoleRedirect = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.role === 'admin') navigate('/admin/dashboard');
    else if (currentUser.role === 'trainer') navigate('/trainer/dashboard');
    else navigate('/member/dashboard');
  };

  const handlePlanSelect = (plan: MembershipPlan) => {
    if (!currentUser) {
      navigate(`/register?plan=${encodeURIComponent(plan.name)}&tier=${encodeURIComponent(plan.tier || 'standard')}`);
      return;
    }
    if (currentUser.role === 'member') {
      navigate('/member/membership');
    } else {
      handleRoleRedirect();
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does the QR + GPS attendance check-in work?',
      a: 'Members open their FitSync digital pass on their phone, which generates a dynamic 60-second cryptographic QR code. When scanned at your reception desk or kiosk, FitSync validates the token and confirms the member is physically within the gym geofence (100m radius), preventing buddy check-ins and attendance fraud.',
    },
    {
      q: 'Can members freeze their memberships without losing days?',
      a: 'Yes. FitSync has a built-in subscription freeze workflow. When an athlete requests a pause (for travel or medical reasons), the countdown stops. Once reactivated, the exact remaining balance of paid days rolls over seamlessly without administrative paperwork or spreadsheet adjustments.',
    },
    {
      q: 'How does the Workout Plan Builder support trainers?',
      a: 'Trainers can choose from a library of compound and isolation movements, specify sets, target reps, rest periods, and weight recommendations. As athletes hit the gym floor and log completed sets, trainers see real-time updates and adherence metrics inside their coaching workspace.',
    },
    {
      q: 'Can trainers manage appointment bookings and availability?',
      a: 'Yes. Each trainer sets their weekly available consultation slots. Members can book 1-on-1 personal training hours directly from their portal, receiving automated notifications and calendar confirmations with zero back-and-forth messaging.',
    },
    {
      q: 'Is there a demo mode to test all three roles?',
      a: 'Yes! On the login page, you will find 1-Click Demo accounts for Admin, Trainer, and Member. You can instantly test each dedicated workflow, switch roles, and explore real telemetry without creating dummy accounts.',
    },
    {
      q: 'How is member health and payment data secured?',
      a: 'All passwords are encrypted with bcrypt, sensitive tokens use stateless signed JWTs, and all API interactions are safeguarded by HTTPS and strict role-based access control (RBAC). Data is never shared or exported to third parties.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#07080d] text-[#15131D] dark:text-slate-100 font-sans selection:bg-purple-600 selection:text-white antialiased overflow-x-hidden theme-transition">
      {/* ========================================================================= */}
      {/* 1. STICKY NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/90 dark:bg-[#07080d]/85 backdrop-blur-xl border-b border-[#E8E5EE] dark:border-slate-800/80 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-lime-400 p-[1.5px] shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white dark:bg-[#0b0d14] rounded-[14px] flex items-center justify-center theme-transition">
                <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-lime-500 dark:group-hover:text-lime-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#15131D] dark:text-white flex items-center gap-0.5">
                FitSync<span className="w-1.5 h-1.5 rounded-full bg-lime-500 dark:bg-lime-400 ml-0.5 inline-block"></span>
              </span>
              <span className="text-[10px] font-semibold text-[#8E8A9C] dark:text-slate-400 uppercase tracking-widest -mt-1">
                FITNESS PLATFORM
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-[#686476] dark:text-slate-300">
            <button onClick={() => scrollToSection('problem-solution')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
              Why FitSync
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => scrollToSection('roles')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
              Portals
            </button>
            <button onClick={() => scrollToSection('product-preview')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
              Product
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
              Pricing
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
              FAQ
            </button>
          </nav>

          {/* Right Action Buttons & Theme Toggle */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            {currentUser ? (
              <button
                onClick={handleRoleRedirect}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 rounded-xl shadow-md shadow-lime-400/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Dashboard</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-950/15 font-extrabold">{currentUser.role}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-[#686476] dark:text-slate-300 hover:text-[#15131D] dark:hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 text-[#15131D] dark:text-slate-300 hover:text-purple-600 dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#FAFAF8] dark:bg-[#0a0c14] border-b border-[#E8E5EE] dark:border-slate-800 px-5 pt-3 pb-6 space-y-3 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5EE] dark:border-slate-800">
              <span className="text-xs font-semibold text-[#686476] dark:text-slate-400">Appearance</span>
              <ThemeToggle showLabel={true} />
            </div>
            <div className="flex flex-col space-y-2.5 text-sm font-medium text-[#686476] dark:text-slate-300 pt-1">
              <button onClick={() => scrollToSection('problem-solution')} className="text-left py-1.5 hover:text-purple-600 dark:hover:text-purple-400">Why FitSync</button>
              <button onClick={() => scrollToSection('features')} className="text-left py-1.5 hover:text-purple-600 dark:hover:text-purple-400">Features</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left py-1.5 hover:text-purple-600 dark:hover:text-purple-400">How It Works</button>
              <button onClick={() => scrollToSection('roles')} className="text-left py-1.5 hover:text-purple-600 dark:hover:text-purple-400">Portals</button>
              <button onClick={() => scrollToSection('product-preview')} className="text-left py-1.5 hover:text-purple-600 dark:hover:text-purple-400">Product</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left py-1.5 hover:text-purple-600 dark:hover:text-purple-400">Pricing</button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-1.5 hover:text-purple-600 dark:hover:text-purple-400">FAQ</button>
            </div>
            <div className="pt-4 border-t border-[#E8E5EE] dark:border-slate-800 flex flex-col gap-2.5">
              {currentUser ? (
                <button
                  onClick={handleRoleRedirect}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-950 bg-lime-400 rounded-xl"
                >
                  Dashboard ({currentUser.role})
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full py-2 text-center text-xs font-semibold text-[#15131D] dark:text-slate-300 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-xl"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 text-center text-xs font-bold text-white bg-purple-600 rounded-xl shadow-md"
                  >
                    Get Started Free &rarr;
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-600/10 dark:bg-purple-600/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-lime-400/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-[11px] font-bold tracking-widest uppercase mb-6 shadow-xs theme-transition">
              <Sparkles className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
              <span>THE ALL-IN-ONE FITNESS OPERATING SYSTEM</span>
            </div>

            {/* Bold Outcome-Focused Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#15131D] dark:text-white tracking-tight leading-[1.08] theme-transition">
              Run your fitness center <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-violet-600 to-lime-600 dark:from-purple-400 dark:via-violet-300 dark:to-lime-400">
                on autopilot.
              </span>
            </h1>

            {/* Subheadline explaining the 3-role platform */}
            <p className="mt-6 text-base sm:text-lg text-[#686476] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal theme-transition">
              One connected platform for admins, trainers, and members — automated subscription renewals, fraud-free QR+GPS check-ins, custom workout plans, and measurable progress tracking.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-xl shadow-purple-600/30 hover:shadow-purple-600/40 transition-all flex items-center gap-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="px-6 py-3.5 text-sm font-semibold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-850 border border-[#E8E5EE] dark:border-slate-700/80 hover:border-purple-500/50 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer theme-transition"
              >
                <span>See how it works</span>
                <span className="w-2 h-2 rounded-full border border-slate-400 inline-block" />
              </button>
            </div>
          </div>

          {/* Large Hero Product Visual Mockup */}
          <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto">
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-[#E8E5EE] dark:border-slate-800/90 shadow-[0_20px_60px_rgba(30,20,60,0.08)] dark:shadow-2xl dark:shadow-purple-950/40 overflow-hidden backdrop-blur-md theme-transition">
              {/* Browser Chrome Header */}
              <div className="px-5 py-3.5 bg-[#F6F5F9] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800/80 flex items-center justify-between theme-transition">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-[11px] font-mono text-[#8E8A9C] dark:text-slate-400">fitsync.app/member/dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>

              {/* Dashboard Inner Workspace */}
              <div className="p-6 sm:p-8 bg-[#FAFAF8] dark:bg-[#0a0c13] space-y-6 theme-transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E5EE] dark:border-slate-800/70 theme-transition">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-base text-white shadow-md">
                      AC
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[#15131D] dark:text-white">Alex Chen</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 theme-transition">
                          PRO ATHLETE
                        </span>
                      </div>
                      <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">Assigned Coach: Marcus Vance · Member #FS-8492</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-xl text-xs flex items-center gap-2 theme-transition">
                      <span className="text-[#8E8A9C] dark:text-slate-400">Status:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE (89d)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Quick Telemetry Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800/90 rounded-2xl p-4 shadow-xs theme-transition">
                    <div className="flex items-center justify-between text-[#8E8A9C] dark:text-slate-400">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Attendance</span>
                      <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1.5">98%</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Verified GPS Check-ins</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800/90 rounded-2xl p-4 shadow-xs theme-transition">
                    <div className="flex items-center justify-between text-[#8E8A9C] dark:text-slate-400">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Workout Split</span>
                      <Activity className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                    </div>
                    <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1.5">4 / 5</p>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-1 font-medium">Upper Hypertrophy Day 2</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800/90 rounded-2xl p-4 shadow-xs theme-transition">
                    <div className="flex items-center justify-between text-[#8E8A9C] dark:text-slate-400">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Target Goal</span>
                      <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1.5">72 → 68 kg</p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-1 font-medium">−2.4 kg achieved (75%)</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800/90 rounded-2xl p-4 shadow-xs theme-transition">
                    <div className="flex items-center justify-between text-[#8E8A9C] dark:text-slate-400">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Next 1-on-1</span>
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm font-bold text-[#15131D] dark:text-white mt-2 truncate">Deadlift Form Wave</p>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">Tomorrow · 6:00 PM</p>
                  </div>
                </div>

                {/* Workout Execution & Kiosk Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800/90 rounded-2xl p-5 shadow-xs theme-transition">
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-xs font-bold text-[#15131D] dark:text-white uppercase tracking-wider">Current Training Protocol</h3>
                      </div>
                      <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400">Cycle 4 · Day 2</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-[#F8F7FA] dark:bg-slate-950/80 rounded-xl border border-[#E8E5EE] dark:border-slate-850 flex items-center justify-between theme-transition">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-xs">1</span>
                          <div>
                            <p className="font-semibold text-[#15131D] dark:text-white">Barbell Bench Press</p>
                            <p className="text-[11px] text-[#686476] dark:text-slate-400">Target: 3 sets × 10 reps @ 40 kg</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">COMPLETED</span>
                      </div>

                      <div className="p-3 bg-[#F8F7FA] dark:bg-slate-950/80 rounded-xl border border-[#E8E5EE] dark:border-slate-850 flex items-center justify-between theme-transition">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">2</span>
                          <div>
                            <p className="font-semibold text-[#15131D] dark:text-white">Barbell Back Squats</p>
                            <p className="text-[11px] text-[#686476] dark:text-slate-400">Target: 3 sets × 12 reps @ 50 kg</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">IN PROGRESS</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between shadow-xs theme-transition">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#15131D] dark:text-white mb-2">
                        <MapPin className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                        <span>Reception GPS Station</span>
                      </div>
                      <p className="text-[11px] text-[#686476] dark:text-slate-400 leading-relaxed">
                        Geofenced within 100 meters of facility desk. Token dynamically updates every 60s.
                      </p>
                      <div className="mt-4 p-3 bg-[#F8F7FA] dark:bg-slate-950 rounded-xl border border-[#E8E5EE] dark:border-slate-800 flex items-center gap-3 theme-transition">
                        <QrCode className="w-8 h-8 text-lime-600 dark:text-lime-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-[#15131D] dark:text-white">Digital Pass Active</p>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Verified · Distance: 38m</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E8E5EE] dark:border-slate-800/80 text-[11px] text-[#686476] dark:text-slate-400 flex justify-between">
                      <span>Last Check-in</span>
                      <span className="font-mono text-[#15131D] dark:text-slate-200 font-semibold">Today · 06:12 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Visual Accent Badges */}
            <div className="hidden lg:block absolute -top-6 -left-8 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-purple-200 dark:border-purple-500/40 rounded-2xl p-3.5 shadow-xl dark:shadow-2xl dark:shadow-purple-950/60 text-xs theme-transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-[#15131D] dark:text-white text-xs">12 workouts completed</p>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300">Streak: 18 consecutive days</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -bottom-6 -right-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-lime-300 dark:border-lime-500/40 rounded-2xl p-3.5 shadow-xl dark:shadow-2xl dark:shadow-lime-950/60 text-xs theme-transition">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime-100 dark:bg-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-[#15131D] dark:text-white text-xs">Goal progress +18%</p>
                  <p className="text-[10px] text-[#686476] dark:text-slate-400">Bodyweight 72 kg &rarr; 68 kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LOGOS / STATS BAR */}
      {/* ========================================================================= */}
      <section className="py-10 border-y border-[#E8E5EE] dark:border-slate-800/80 bg-[#F4F3F7]/70 dark:bg-slate-950/60 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xl sm:text-2xl font-black text-[#15131D] dark:text-white font-mono">500+</span>
              </div>
              <p className="text-xs text-[#686476] dark:text-slate-400 font-medium">Active Members Tracked</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <QrCode className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                <span className="text-xl sm:text-2xl font-black text-[#15131D] dark:text-white font-mono">98%</span>
              </div>
              <p className="text-xs text-[#686476] dark:text-slate-400 font-medium">QR+GPS Check-In Accuracy</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xl sm:text-2xl font-black text-[#15131D] dark:text-white font-mono">3 Portals</span>
              </div>
              <p className="text-xs text-[#686476] dark:text-slate-400 font-medium">Admin, Trainer, & Member</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Zap className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                <span className="text-xl sm:text-2xl font-black text-[#15131D] dark:text-white font-mono">Zero</span>
              </div>
              <p className="text-xs text-[#686476] dark:text-slate-400 font-medium">Manual Spreadsheets</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROBLEM → SOLUTION SECTION */}
      {/* ========================================================================= */}
      <section id="problem-solution" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              THE REALITY OF RUNNING A FITNESS CENTER
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight theme-transition">
              Old gym habits drain revenue. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-lime-600 dark:from-purple-400 dark:to-lime-300">
                FitSync fixes the disconnect.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#686476] dark:text-slate-400 max-w-xl mx-auto theme-transition">
              Compare the friction of disconnected tools with the clarity of an automated platform built for gym owners, trainers, and athletes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Pain Card */}
            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-8 space-y-6 theme-transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#15131D] dark:text-white">The Pain: Disconnected Systems</h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300">What holds traditional gyms back</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-rose-200/80 dark:border-rose-900/40">
                  <p className="font-bold text-[#15131D] dark:text-white flex items-center gap-2">
                    <span className="text-rose-500 font-mono text-base">✕</span> Paper sheets & buddy check-in fraud
                  </p>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                    Front-desk binders or static cards enable unchecked guest entry and inaccurate attendance logs.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-rose-200/80 dark:border-rose-900/40">
                  <p className="font-bold text-[#15131D] dark:text-white flex items-center gap-2">
                    <span className="text-rose-500 font-mono text-base">✕</span> Lost membership days & freeze disputes
                  </p>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                    Members travel or pause; tracking paused days manually leads to billing discrepancies and lost renewals.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-rose-200/80 dark:border-rose-900/40">
                  <p className="font-bold text-[#15131D] dark:text-white flex items-center gap-2">
                    <span className="text-rose-500 font-mono text-base">✕</span> Zero visibility into client disengagement
                  </p>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                    Trainers have no automated way to know who missed 2+ weeks until the member quietly cancels their plan.
                  </p>
                </div>
              </div>
            </div>

            {/* The Solution Card */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl p-8 space-y-6 theme-transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#15131D] dark:text-white">The FitSync Solution</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Automated, verified, connected</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40">
                  <p className="font-bold text-[#15131D] dark:text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Dynamic QR + GPS perimeter verification
                  </p>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                    Pass tokens auto-refresh every 60s and require members to be within 100m of the gym desk to check in.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40">
                  <p className="font-bold text-[#15131D] dark:text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Automated freeze rollover & renewal alerts
                  </p>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                    Pause requests pause countdown timers accurately, and automated notifications prevent accidental churn.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40">
                  <p className="font-bold text-[#15131D] dark:text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Real-time adherence telemetry & trainer flags
                  </p>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                    Coaches immediately spot athletes falling off track and can schedule 1-on-1 check-ins before dropouts happen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURE GRID (6 Feature Cards with Hover Lift) */}
      {/* ========================================================================= */}
      <section id="features" className="py-24 bg-[#F4F3F7]/70 dark:bg-[#05060b] border-y border-[#E8E5EE] dark:border-slate-850 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-widest">CORE CAPABILITIES</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight theme-transition">
              Engineered for precision fitness operations.
            </h2>
            <p className="mt-3 text-sm text-[#686476] dark:text-slate-400 theme-transition">
              Six modular features built into one unified codebase — no third-party plugin stitching required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,20,60,0.08)] hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-300 group theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#15131D] dark:text-white">Smart Check-In (QR+GPS)</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-2.5 leading-relaxed">
                  Cryptographic 60-second expiring digital QR passes verified against a 100m facility geofence to eliminate proxy check-ins.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5EE] dark:border-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span>Zero fraud verification</span> &rarr;
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,20,60,0.08)] hover:border-lime-400 dark:hover:border-lime-500/50 transition-all duration-300 group theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950/80 border border-lime-200 dark:border-lime-800/70 text-lime-600 dark:text-lime-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PauseCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#15131D] dark:text-white">Subscription Freeze & Rollover</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-2.5 leading-relaxed">
                  Members pause their active memberships with 1 click; days are paused and accurately extended upon resumption.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5EE] dark:border-slate-800 text-[11px] font-bold text-lime-600 dark:text-lime-400 flex items-center gap-1">
                <span>Fair billing workflows</span> &rarr;
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,20,60,0.08)] hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-300 group theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#15131D] dark:text-white">Role-Based Dashboards</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-2.5 leading-relaxed">
                  Purpose-built views for Admins (revenue, kiosk, plans), Trainers (clients, splits), and Members (sessions, records).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5EE] dark:border-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span>3 tailored experiences</span> &rarr;
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,20,60,0.08)] hover:border-lime-400 dark:hover:border-lime-500/50 transition-all duration-300 group theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950/80 border border-lime-200 dark:border-lime-800/70 text-lime-600 dark:text-lime-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#15131D] dark:text-white">Workout Plan Builder</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-2.5 leading-relaxed">
                  Design periodized multi-day splits with target sets, reps, and weights; athletes log workouts directly from mobile screens.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5EE] dark:border-slate-800 text-[11px] font-bold text-lime-600 dark:text-lime-400 flex items-center gap-1">
                <span>Interactive floor routines</span> &rarr;
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,20,60,0.08)] hover:border-purple-400 dark:hover:border-purple-500/50 transition-all duration-300 group theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#15131D] dark:text-white">Progress Tracking & Charts</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-2.5 leading-relaxed">
                  Visual bodyweight trajectory curves, BMI logs, and compound PR markers give members proof of their hard work.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5EE] dark:border-slate-800 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span>Clear telemetry curves</span> &rarr;
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-7 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(30,20,60,0.08)] hover:border-lime-400 dark:hover:border-lime-500/50 transition-all duration-300 group theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950/80 border border-lime-200 dark:border-lime-800/70 text-lime-600 dark:text-lime-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#15131D] dark:text-white">Smart Notifications</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-2.5 leading-relaxed">
                  Real-time signals for appointment reminders, newly assigned workouts, subscription expiration warnings, and check-ins.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E5EE] dark:border-slate-800 text-[11px] font-bold text-lime-600 dark:text-lime-400 flex items-center gap-1">
                <span>Never miss a signal</span> &rarr;
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS (Horizontal 4-Step Flow with Connecting Line) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">HOW IT WORKS</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight theme-transition">
              Simple. Frictionless. Immediate.
            </h2>
            <p className="mt-3 text-sm text-[#686476] dark:text-slate-400 theme-transition">
              From creating an account to tracking personal milestones in four clear steps.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line behind steps on desktop */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-purple-500 via-violet-400 to-lime-400 -translate-y-8 z-0 opacity-40" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between theme-transition">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-sm mb-4">
                    01
                  </div>
                  <h3 className="text-base font-bold text-[#15131D] dark:text-white">Sign Up</h3>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-2 leading-relaxed">
                    Create your profile in 60s and gain instant access to your dedicated portal.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#E8E5EE] dark:border-slate-800 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  Fast 1-click onboarding
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between theme-transition">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-lime-100 dark:bg-lime-950 border border-lime-200 dark:border-lime-800 text-lime-700 dark:text-lime-400 flex items-center justify-center font-bold text-sm mb-4">
                    02
                  </div>
                  <h3 className="text-base font-bold text-[#15131D] dark:text-white">Pick a Plan</h3>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-2 leading-relaxed">
                    Select Basic, Pro, or Elite to activate your digital contactless pass immediately.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#E8E5EE] dark:border-slate-800 text-[10px] text-lime-600 dark:text-lime-400 font-semibold">
                  Instant membership token
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between theme-transition">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-sm mb-4">
                    03
                  </div>
                  <h3 className="text-base font-bold text-[#15131D] dark:text-white">Check In & Train</h3>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-2 leading-relaxed">
                    Scan your dynamic QR at reception and follow your coach&apos;s daily routine.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#E8E5EE] dark:border-slate-800 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  GPS verified gym pass
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between theme-transition">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-lime-100 dark:bg-lime-950 border border-lime-200 dark:border-lime-800 text-lime-700 dark:text-lime-400 flex items-center justify-center font-bold text-sm mb-4">
                    04
                  </div>
                  <h3 className="text-base font-bold text-[#15131D] dark:text-white">Track Progress</h3>
                  <p className="text-xs text-[#686476] dark:text-slate-400 mt-2 leading-relaxed">
                    Record weights, log body composition, and review trajectory charts with your trainer.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#E8E5EE] dark:border-slate-800 text-[10px] text-lime-600 dark:text-lime-400 font-semibold">
                  Measurable fitness gains
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BUILT FOR EVERYONE (Three Columns: Admin, Trainer, Member) */}
      {/* ========================================================================= */}
      <section id="roles" className="py-24 bg-[#F4F3F7]/70 dark:bg-[#05060b] border-y border-[#E8E5EE] dark:border-slate-850 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-widest">ROLE-BASED ARCHITECTURE</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight theme-transition">
              Built for everyone on the gym floor.
            </h2>
            <p className="mt-3 text-sm text-[#686476] dark:text-slate-400 theme-transition">
              No shared confusing screens. Every user gets a purpose-built workspace designed for their daily tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Admin */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#15131D] dark:text-white">Admin Portal</h3>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1">
                  Run facility operations with total financial and roster clarity.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-[#686476] dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Real-time subscription billing, plan tiering, and revenue forecasting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Reception QR scanner kiosk management with live check-in audits.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Membership freeze approvals and facility-wide broadcast notices.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8E5EE] dark:border-slate-800">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Admin Experience</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Column 2: Trainer */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-lime-100 dark:bg-lime-950 border border-lime-200 dark:border-lime-800 text-lime-600 dark:text-lime-400 flex items-center justify-center mb-6">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#15131D] dark:text-white">Trainer Portal</h3>
                <p className="text-xs font-semibold text-lime-700 dark:text-lime-400 mt-1">
                  Coach with complete visibility over client consistency and logs.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-[#686476] dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-lime-600 dark:text-lime-400 shrink-0 mt-0.5" />
                    <span>Assigned client overview with weekly attendance and workout adherence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-lime-600 dark:text-lime-400 shrink-0 mt-0.5" />
                    <span>Custom periodized workout routine builder with movement notes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-lime-600 dark:text-lime-400 shrink-0 mt-0.5" />
                    <span>Availability slots configuration and direct appointment schedule.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8E5EE] dark:border-slate-800">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 text-xs font-bold text-lime-700 dark:text-lime-400 bg-lime-100/70 dark:bg-lime-950/60 hover:bg-lime-200 dark:hover:bg-lime-900/60 border border-lime-200 dark:border-lime-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Trainer Experience</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Column 3: Member */}
            <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#15131D] dark:text-white">Member Portal</h3>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1">
                  Manage memberships, follow plans, and track milestones in one place.
                </p>

                <ul className="mt-6 space-y-3 text-xs text-[#686476] dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Contactless QR gym check-in pass backed by real-time GPS geofence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Today&apos;s workout split view with set, rep, and weight logging.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>Bodyweight charts, personal record tracker, and 1-click subscription freezes.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8E5EE] dark:border-slate-800">
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Explore Member Experience</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PRODUCT PREVIEW (Interactive Tabbed Mockup) */}
      {/* ========================================================================= */}
      <section id="product-preview" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">PRODUCT PREVIEW</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight theme-transition">
              Experience the actual interface.
            </h2>
            <p className="mt-3 text-sm text-[#686476] dark:text-slate-400 theme-transition">
              Toggle between views to see how FitSync adapts across different operational contexts.
            </p>

            {/* Interactive Tabs Switcher */}
            <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 shadow-xs">
              <button
                onClick={() => setActiveTab('member')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'member'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white'
                }`}
              >
                Member Progress
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white'
                }`}
              >
                Admin Overview
              </button>
              <button
                onClick={() => setActiveTab('trainer')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'trainer'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white'
                }`}
              >
                Trainer Workspace
              </button>
            </div>
          </div>

          {/* Browser Chrome Container */}
          <div className="max-w-5xl mx-auto rounded-3xl bg-white dark:bg-slate-900/90 border border-[#E8E5EE] dark:border-slate-800/90 shadow-[0_20px_60px_rgba(30,20,60,0.08)] dark:shadow-2xl dark:shadow-purple-950/40 overflow-hidden theme-transition">
            {/* Window header */}
            <div className="px-5 py-3.5 bg-[#F6F5F9] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800/80 flex items-center justify-between theme-transition">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-[11px] font-mono text-[#8E8A9C] dark:text-slate-400">
                  fitsync.app/{activeTab}/dashboard
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400">
                ACTIVE VIEW: {activeTab.toUpperCase()}
              </span>
            </div>

            {/* Dynamic View Content */}
            <div className="p-6 sm:p-8 bg-[#FAFAF8] dark:bg-[#0a0c13] min-h-[380px] theme-transition">
              {activeTab === 'member' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Bodyweight Curve</p>
                      <p className="text-xl font-black text-[#15131D] dark:text-white mt-1">76.5 kg</p>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">−3.5 kg total lost</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Attendance Streak</p>
                      <p className="text-xl font-black text-lime-600 dark:text-lime-400 mt-1">18 Days</p>
                      <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">98% verified accuracy</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Plan Validity</p>
                      <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">89 Days</p>
                      <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">Renews automatically</p>
                    </div>
                  </div>

                  {/* SVG Line visualization */}
                  <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                    <div className="flex justify-between items-center text-xs font-bold text-[#15131D] dark:text-white mb-2">
                      <span>Weight Trajectory Over 8 Weeks</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">Pace: −0.44 kg/wk</span>
                    </div>
                    <svg viewBox="0 0 400 70" className="w-full h-20 overflow-visible">
                      <defs>
                        <linearGradient id="prevGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor={isDark ? '#a3e635' : '#65a30d'} />
                        </linearGradient>
                      </defs>
                      <path d="M 10,20 Q 100,28 200,45 T 390,62" fill="none" stroke="url(#prevGrad)" strokeWidth="3" />
                      <circle cx="10" cy="20" r="4" fill="#8b5cf6" />
                      <circle cx="200" cy="45" r="4" fill="#a855f7" />
                      <circle cx="390" cy="62" r="4" fill={isDark ? '#a3e635' : '#65a30d'} />
                    </svg>
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Monthly Revenue</p>
                      <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹4,82,000</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">+12% vs last month</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Active Members</p>
                      <p className="text-xl font-black text-[#15131D] dark:text-white mt-1">348</p>
                      <p className="text-[10px] text-purple-600 dark:text-purple-400">14 new this week</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Desk Scans Today</p>
                      <p className="text-xl font-black text-lime-600 dark:text-lime-400 mt-1">194</p>
                      <p className="text-[10px] text-[#686476] dark:text-slate-400">Peak hour: 6-8 PM</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Freeze Requests</p>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">2 Pending</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">Requires review</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#15131D] dark:text-white">Reception Desk Kiosk Active</p>
                      <p className="text-[11px] text-[#686476] dark:text-slate-400">Flagship Location · Geofence: 100m · Token Cycle: 60s</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold">ONLINE</span>
                  </div>
                </div>
              )}

              {activeTab === 'trainer' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Roster Size</p>
                      <p className="text-xl font-black text-[#15131D] dark:text-white mt-1">24 Athletes</p>
                      <p className="text-[11px] text-purple-600 dark:text-purple-400">18 active splits</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-bold">Appointments Today</p>
                      <p className="text-xl font-black text-lime-600 dark:text-lime-400 mt-1">7 Sessions</p>
                      <p className="text-[11px] text-[#686476] dark:text-slate-400">Next: 3:30 PM</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">Needs Follow-Up</p>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">3 Athletes</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">Missed 2+ consecutive splits</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900/60 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
                    <p className="text-xs font-bold text-[#15131D] dark:text-white">Upcoming 1-on-1 Session</p>
                    <div className="flex items-center justify-between text-xs text-[#686476] dark:text-slate-400">
                      <span>Alex Chen — Deadlift Wave 2</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">Today · 03:30 PM (60 min)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PRICING TEASER */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-24 bg-[#F4F3F7]/70 dark:bg-[#05060a] border-y border-[#E8E5EE] dark:border-slate-850 relative theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-widest">MEMBERSHIP TIERS</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight theme-transition">
              Transparent plans. Zero hidden fees.
            </h2>
            <p className="mt-3 text-sm text-[#686476] dark:text-slate-400 theme-transition">
              All plans include mobile QR check-in, equipment access, and progress telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => {
              const isPopular = idx === 1 || plan.name.toLowerCase().includes('pro');
              return (
                <div
                  key={plan._id || idx}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative theme-transition ${
                    isPopular
                      ? 'bg-white dark:bg-slate-900 border-2 border-purple-500 shadow-[0_20px_50px_rgba(139,92,246,0.15)] dark:shadow-2xl dark:shadow-purple-950/40'
                      : 'bg-white dark:bg-[#0a0c13] border border-[#E8E5EE] dark:border-slate-800 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none hover:border-purple-300 dark:hover:border-slate-700'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-lime-400 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-full shadow-sm">
                      MOST POPULAR
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-[#15131D] dark:text-white tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-[#686476] dark:text-slate-400 mt-2 min-h-[36px] leading-relaxed">{plan.description}</p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#15131D] dark:text-white font-mono">
                        ₹{plan.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#8E8A9C] dark:text-slate-400">
                        {plan.durationMonths > 1 ? `/ ${plan.durationMonths} mo` : '/ month'}
                      </span>
                    </div>

                    <ul className="mt-8 space-y-3 text-xs text-[#686476] dark:text-slate-300">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${isPopular ? 'text-lime-600 dark:text-lime-400' : 'text-purple-600 dark:text-purple-400'}`} />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-10 pt-6 border-t border-[#E8E5EE] dark:border-slate-800/80 theme-transition">
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-lime-400 text-slate-950 hover:bg-lime-300 shadow-lime-400/20'
                          : 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-600/20'
                      }`}
                    >
                      <span>Choose {plan.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FAQ ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">COMMON QUESTIONS</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#15131D] dark:text-white mt-3 tracking-tight theme-transition">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-[#686476] dark:text-slate-400 theme-transition">
              Everything you need to know about setting up and running FitSync.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs theme-transition"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                  >
                    <span className="text-sm font-bold text-[#15131D] dark:text-white">
                      {faq.q}
                    </span>
                    <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#686476] dark:text-slate-300 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#686476] dark:text-slate-300 leading-relaxed border-t border-[#E8E5EE]/60 dark:border-slate-800/60 animate-in fade-in-50 duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FINAL CTA SECTION (Full-Width High Contrast) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-[36px] bg-gradient-to-tr from-lime-400 via-lime-300 to-lime-400 p-8 sm:p-16 lg:p-20 text-center shadow-2xl shadow-lime-400/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
              Ready to run your gym on autopilot?
            </h2>

            <p className="text-sm sm:text-base text-slate-900/80 font-medium leading-relaxed max-w-xl mx-auto">
              Bring memberships, trainers, verified attendance, and progress into one seamless platform today.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-slate-950 text-white font-bold text-sm shadow-xl hover:bg-slate-900 transition-all flex items-center gap-2 group"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={() => scrollToSection('problem-solution')}
                className="px-8 py-4 rounded-2xl bg-lime-500/30 text-slate-950 font-bold text-sm border border-slate-950/20 hover:bg-lime-500/40 transition-colors cursor-pointer"
              >
                Learn More
              </button>
            </div>

            <p className="text-xs text-slate-800 font-medium pt-2">
              Free setup. Instant activation. No credit card required to explore.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#F0EEF5] dark:bg-[#050609] border-t border-[#E8E5EE] dark:border-slate-900 py-16 text-xs text-[#686476] dark:text-slate-400 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[#E8E5EE] dark:border-slate-900 theme-transition">
            {/* Brand Column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="text-base font-black text-[#15131D] dark:text-white tracking-tight">FitSync.</span>
              </div>
              <p className="text-xs text-[#686476] dark:text-slate-400 max-w-sm leading-relaxed">
                Role-based fitness management platform connecting members, trainers, and fitness center administrators.
              </p>
            </div>

            {/* PRODUCT */}
            <div className="space-y-2.5">
              <p className="font-bold text-[#15131D] dark:text-white uppercase text-[11px] tracking-wider">PRODUCT</p>
              <ul className="space-y-2 text-[#686476] dark:text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer">Features</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer">How It Works</button></li>
                <li><button onClick={() => scrollToSection('roles')} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer">Portals</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer">Pricing</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer">FAQ</button></li>
              </ul>
            </div>

            {/* COMPANY */}
            <div className="space-y-2.5">
              <p className="font-bold text-[#15131D] dark:text-white uppercase text-[11px] tracking-wider">COMPANY</p>
              <ul className="space-y-2 text-[#686476] dark:text-slate-400">
                <li><a href="#about" className="hover:text-purple-600 dark:hover:text-purple-400">About</a></li>
                <li><a href="#contact" className="hover:text-purple-600 dark:hover:text-purple-400">Contact</a></li>
                <li><a href="#careers" className="hover:text-purple-600 dark:hover:text-purple-400">Careers</a></li>
              </ul>
            </div>

            {/* PORTAL AUTH */}
            <div className="space-y-2.5">
              <p className="font-bold text-[#15131D] dark:text-white uppercase text-[11px] tracking-wider">PORTAL</p>
              <ul className="space-y-2 text-[#686476] dark:text-slate-400">
                <li><Link to="/login" className="hover:text-purple-600 dark:hover:text-purple-400">Log in</Link></li>
                <li><Link to="/register" className="hover:text-purple-600 dark:hover:text-purple-400">Sign up</Link></li>
                <li><Link to="/login" className="hover:text-lime-600 dark:hover:text-lime-400 font-semibold">1-Click Demo</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E8A9C] dark:text-slate-400">
            <p>&copy; 2026 FitSync. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-purple-600 dark:hover:text-purple-400">Privacy Policy</a>
              <a href="#terms" className="hover:text-purple-600 dark:hover:text-purple-400">Terms of Service</a>
              <a href="#security" className="hover:text-purple-600 dark:hover:text-purple-400">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Quick Theme Toggle */}
      <aside aria-label="Theme switcher" className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center shadow-xl rounded-2xl">
        <ThemeToggle className="!p-2.5 !rounded-2xl !shadow-lg border-2 !bg-white/90 dark:!bg-slate-900/90 !backdrop-blur-md" showLabel={true} />
      </aside>
    </div>
  );
};


