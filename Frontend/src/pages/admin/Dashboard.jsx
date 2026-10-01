import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, Activity, CreditCard, Calendar, QrCode, TrendingUp, AlertTriangle, Snowflake 
} from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardCard = ({ title, value, icon, colorClass, bgColorClass }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-lg ${bgColorClass} ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Members" 
          value={stats?.totalMembers || 0} 
          icon={<Users size={24} />} 
          colorClass="text-blue-600" 
          bgColorClass="bg-blue-50" 
        />
        <DashboardCard 
          title="Active Subscriptions" 
          value={stats?.activeSubscriptions || 0} 
          icon={<Activity size={24} />} 
          colorClass="text-green-600" 
          bgColorClass="bg-green-50" 
        />
        <DashboardCard 
          title="Est. Monthly Revenue" 
          value={`$${stats?.totalRevenue || 0}`} 
          icon={<TrendingUp size={24} />} 
          colorClass="text-purple-600" 
          bgColorClass="bg-purple-50" 
        />
        <DashboardCard 
          title="Total Trainers" 
          value={stats?.totalTrainers || 0} 
          icon={<Users size={24} />} 
          colorClass="text-orange-600" 
          bgColorClass="bg-orange-50" 
        />
        
        <DashboardCard 
          title="Today's Appointments" 
          value={stats?.todaysAppointments || 0} 
          icon={<Calendar size={24} />} 
          colorClass="text-indigo-600" 
          bgColorClass="bg-indigo-50" 
        />
        <DashboardCard 
          title="Today's Attendance" 
          value={stats?.todaysAttendance || 0} 
          icon={<QrCode size={24} />} 
          colorClass="text-emerald-600" 
          bgColorClass="bg-emerald-50" 
        />
        <DashboardCard 
          title="Expiring Soon" 
          value={stats?.expiringSubscriptions || 0} 
          icon={<AlertTriangle size={24} />} 
          colorClass="text-amber-600" 
          bgColorClass="bg-amber-50" 
        />
        <DashboardCard 
          title="Frozen Subs" 
          value={stats?.frozenSubscriptions || 0} 
          icon={<Snowflake size={24} />} 
          colorClass="text-cyan-600" 
          bgColorClass="bg-cyan-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-gray-500 font-medium">Add charts (e.g., Recharts) here...</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
          <p className="text-gray-500 font-medium">Recent Activity Log (Placeholder)</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
