import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { GeminiChatWidget } from "../components/chat/GeminiChatWidget";
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/ai-assistant")) return "FitSync AI Coach";
    if (path.includes("/dashboard")) return "Overview";
    if (path.includes("/memberships")) return "Membership Plans";
    if (path.includes("/subscriptions")) return "Subscriptions";
    if (path.includes("/attendance/qr")) return "Attendance QR Station";
    if (path.includes("/attendance")) return "Attendance";
    if (path.includes("/workouts")) return "Workout Management";
    if (path.includes("/workout-plans")) return "Workout Plans";
    if (path.includes("/workout-history")) return "Workout History";
    if (path.includes("/exercises")) return "Exercise Library";
    if (path.includes("/appointments")) return "Appointments";
    if (path.includes("/progress")) return "Progress & Metrics";
    if (path.includes("/goals")) return "Goals";
    if (path.includes("/reports")) return "Reports & Analytics";
    if (path.includes("/notifications")) return "Notifications";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/profile")) return "Profile";
    if (path.includes("/members")) return "Member Directory";
    if (path.includes("/trainers")) return "Trainer Roster";
    if (path.includes("/availability")) return "Availability Schedule";
    return "FitSync";
  };
  return <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#07080d] text-[#15131D] dark:text-slate-100 theme-transition flex">
      {
    /* Sidebar */
  }
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {
    /* Main Content Area */
  }
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} title={getPageTitle()} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {
    /* Global AI Coach Floating Chat Widget */
  }
      <GeminiChatWidget />
    </div>;
};
export {
  AppLayout
};
