import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Bell, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/my');
        setNotifications(res.data.data);
      } catch (error) {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Notifications</h1>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map(notif => (
              <li key={notif._id} className={`p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-primary-50/50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">{notif.message}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {format(new Date(notif.createdAt), 'MMM dd, yyyy hh:mm a')}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="ml-4 flex-shrink-0 text-primary-600 hover:text-primary-700 p-1"
                      title="Mark as read"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
