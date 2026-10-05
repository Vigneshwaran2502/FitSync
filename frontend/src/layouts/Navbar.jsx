import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { useNavigate } from "react-router-dom";
const Navbar = ({ onToggleSidebar, title = "Portal" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const getProfilePath = () => {
    if (user?.role === "admin") return "/admin/settings";
    if (user?.role === "trainer") return "/trainer/profile";
    return "/member/profile";
  };
  return <header className="h-16 bg-white/90 dark:bg-[#07080d]/85 backdrop-blur-xl border-b border-[#E8E5EE] dark:border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between theme-transition">
      {
    /* Zone 1 & 2: Mobile toggle + Breadcrumb / Context */
  }
      <div className="flex items-center gap-3">
        <button
    onClick={onToggleSidebar}
    className="lg:hidden p-2 rounded-xl text-[#8E8A9C] hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    aria-label="Open sidebar"
  >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#8E8A9C] dark:text-slate-400">
          <span className="text-[#15131D] dark:text-white font-bold">{title}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
          <span className="capitalize text-purple-600 dark:text-purple-400">{user?.role}</span>
        </div>
      </div>

      {
    /* Zone 3: Actions */
  }
      <div className="flex items-center gap-2 sm:gap-3">
        {
    /* Global Theme Toggle */
  }
        <ThemeToggle />

        {
    /* Live Notification Dropdown */
  }
        <NotificationDropdown />

        {
    /* User profile shortcut */
  }
        <button
    onClick={() => navigate(getProfilePath())}
    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[#686476] dark:text-slate-300 hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors text-xs font-medium cursor-pointer"
    title="Account Profile"
  >
          <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline font-bold">{user?.name?.split(" ")[0]}</span>
        </button>

        {
    /* Logout */
  }
        <button
    onClick={handleLogout}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
    title="Sign out"
  >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>;
};
export {
  Navbar
};
