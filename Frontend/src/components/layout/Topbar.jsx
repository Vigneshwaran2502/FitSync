import React, { useState, useEffect } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread count', error);
      }
    };
    if (user) {
      fetchUnread();
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
      <div className="flex items-center">
        <button 
          className="p-1 mr-4 text-gray-500 rounded-md lg:hidden hover:text-gray-700 hover:bg-gray-100"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 capitalize">
          {user?.role} Portal
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Link to={`/${user?.role}/notifications`} className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        <Link to={`/${user?.role}/profile`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-gray-700 leading-tight">{user?.name}</p>
            <p className="text-gray-500 text-xs leading-tight capitalize">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;
