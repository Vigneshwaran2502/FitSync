import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  QrCode,
  Dumbbell,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Bell,
  Settings,
  Clock,
  User,
  History,
  ShieldCheck,
  BarChart3,
  X,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const adminNav = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "AI Coach", path: "/admin/ai-assistant", icon: Sparkles },
    { name: "Members", path: "/admin/members", icon: Users },
    { name: "Trainers", path: "/admin/trainers", icon: UserCheck },
    { name: "Membership Plans", path: "/admin/memberships", icon: CreditCard },
    { name: "Subscriptions", path: "/admin/subscriptions", icon: ShieldCheck },
    { name: "Attendance Records", path: "/admin/attendance", icon: CheckCircle2 },
    { name: "Attendance QR Display", path: "/admin/attendance/qr", icon: QrCode },
    { name: "Workout Oversight", path: "/admin/workouts", icon: Dumbbell },
    { name: "Appointments", path: "/admin/appointments", icon: Calendar },
    { name: "Reports & Analytics", path: "/admin/reports", icon: BarChart3 },
    { name: "Announcements", path: "/admin/notifications", icon: Bell },
    { name: "Gym Settings", path: "/admin/settings", icon: Settings }
  ];
  const trainerNav = [
    { name: "Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
    { name: "AI Coach", path: "/trainer/ai-assistant", icon: Sparkles },
    { name: "My Members", path: "/trainer/members", icon: Users },
    { name: "Workout Plans", path: "/trainer/workout-plans", icon: Dumbbell },
    { name: "Exercise Library", path: "/trainer/exercises", icon: BookOpen },
    { name: "Appointments", path: "/trainer/appointments", icon: Calendar },
    { name: "Member Attendance", path: "/trainer/attendance", icon: CheckCircle2 },
    { name: "Member Progress", path: "/trainer/progress", icon: TrendingUp },
    { name: "Notifications", path: "/trainer/notifications", icon: Bell },
    { name: "My Availability", path: "/trainer/availability", icon: Clock },
    { name: "Trainer Profile", path: "/trainer/profile", icon: User }
  ];
  const memberNav = [
    { name: "Dashboard", path: "/member/dashboard", icon: LayoutDashboard },
    { name: "AI Coach", path: "/member/ai-assistant", icon: Sparkles },
    { name: "My Profile", path: "/member/profile", icon: User },
    { name: "Membership Plan", path: "/member/membership", icon: CreditCard },
    { name: "My Workouts", path: "/member/workouts", icon: Dumbbell },
    { name: "Workout History", path: "/member/workout-history", icon: History },
    { name: "Attendance & Check-in", path: "/member/attendance", icon: QrCode },
    { name: "Progress & Goals", path: "/member/progress", icon: TrendingUp },
    { name: "Appointments", path: "/member/appointments", icon: Calendar },
    { name: "Notifications", path: "/member/notifications", icon: Bell },
    { name: "Account Settings", path: "/member/settings", icon: Settings }
  ];
  const navItems = user?.role === "admin" ? adminNav : user?.role === "trainer" ? trainerNav : memberNav;
  return <>
      {
    /* Mobile Backdrop */
  }
      {isOpen && <div
    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
    onClick={onClose}
    aria-hidden="true"
  />}

      {
    /* Sidebar Container */
  }
      <aside
    className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#0a0c13] border-r border-[#E8E5EE] dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 theme-transition ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
        {
    /* Brand Header with landing page logo treatment */
  }
        <div className="h-16 px-5 border-b border-[#E8E5EE] dark:border-slate-800/80 flex items-center justify-between shrink-0 theme-transition">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-500 to-lime-400 p-[1.5px] shadow-sm shadow-purple-600/25 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white dark:bg-[#0b0d14] rounded-[10px] flex items-center justify-center theme-transition">
                <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-[#15131D] dark:text-white flex items-center gap-0.5">
                FitSync<span className="w-1.5 h-1.5 rounded-full bg-lime-500 dark:bg-lime-400 ml-0.5 inline-block" />
              </span>
              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest -mt-0.5">
                {user?.role ? `${user.role.toUpperCase()} PORTAL` : "FITNESS PLATFORM"}
              </span>
            </div>
          </Link>
          <button
    onClick={onClose}
    className="lg:hidden p-1.5 rounded-xl text-[#8E8A9C] hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    aria-label="Close sidebar"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Navigation List */
  }
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
    const Icon = item.icon;
    return <NavLink
      key={item.path}
      to={item.path}
      onClick={() => onClose()}
      className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${isActive ? "bg-purple-100/90 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/90 dark:border-purple-800/80 shadow-xs" : "text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-900/60 font-medium"}`}
    >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>;
  })}
        </nav>

        {
    /* User Card in Footer */
  }
        <div className="p-3 border-t border-[#E8E5EE] dark:border-slate-800/80 bg-[#F8F7FA] dark:bg-[#07080d]/60 theme-transition">
          <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-black shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#15131D] dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>;
};
export {
  Sidebar
};
