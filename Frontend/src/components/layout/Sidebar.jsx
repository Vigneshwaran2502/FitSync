import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, UserSquare2, Dumbbell, 
  Calendar, CreditCard, Activity, Bell, Settings, X, LogOut,
  Target, ActivitySquare, QrCode
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'member';

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={20} /> },
    { name: 'Trainers', path: '/admin/trainers', icon: <UserSquare2 size={20} /> },
    { name: 'Membership Plans', path: '/admin/membership-plans', icon: <CreditCard size={20} /> },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: <Activity size={20} /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={20} /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <QrCode size={20} /> },
    { name: 'Progress', path: '/admin/progress', icon: <Target size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
  ];

  const trainerLinks = [
    { name: 'Dashboard', path: '/trainer/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Members', path: '/trainer/members', icon: <Users size={20} /> },
    { name: 'Availability', path: '/trainer/availability', icon: <Calendar size={20} /> },
    { name: 'Appointments', path: '/trainer/appointments', icon: <Calendar size={20} /> },
    { name: 'Workout Plans', path: '/trainer/workouts', icon: <Dumbbell size={20} /> },
    { name: 'Exercise Library', path: '/trainer/exercises', icon: <ActivitySquare size={20} /> },
    { name: 'Member Progress', path: '/trainer/progress', icon: <Target size={20} /> },
    { name: 'Attendance', path: '/trainer/attendance', icon: <QrCode size={20} /> },
    { name: 'Notifications', path: '/trainer/notifications', icon: <Bell size={20} /> },
  ];

  const memberLinks = [
    { name: 'Dashboard', path: '/member/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Membership', path: '/member/membership', icon: <CreditCard size={20} /> },
    { name: 'My Subscription', path: '/member/subscription', icon: <Activity size={20} /> },
    { name: 'Appointments', path: '/member/appointments', icon: <Calendar size={20} /> },
    { name: 'My Workouts', path: '/member/workouts', icon: <Dumbbell size={20} /> },
    { name: 'Attendance', path: '/member/attendance', icon: <QrCode size={20} /> },
    { name: 'Progress', path: '/member/progress', icon: <ActivitySquare size={20} /> },
    { name: 'Goals', path: '/member/goals', icon: <Target size={20} /> },
    { name: 'Notifications', path: '/member/notifications', icon: <Bell size={20} /> },
  ];

  const getLinks = () => {
    if (role === 'admin') return adminLinks;
    if (role === 'trainer') return trainerLinks;
    return memberLinks;
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600 text-white">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <ActivitySquare /> FitSync
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
                onClick={() => setSidebarOpen(false)} // close on mobile click
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
