import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Activity, Calendar, Award, Target } from 'lucide-react';

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

const MemberDashboard = () => {
  const [stats, setStats] = useState({
    appointmentsCount: 0,
    workoutPlansCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [apptRes, plansRes] = await Promise.all([
          api.get('/appointments/my').catch(() => ({ data: { data: [] } })),
          api.get('/workout-plans/my').catch(() => ({ data: { data: [] } }))
        ]);

        setStats({
          appointmentsCount: apptRes.data.data.length || 0,
          workoutPlansCount: plansRes.data.data.length || 0,
        });
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
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Fitness Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Active Plans" 
          value={stats.workoutPlansCount} 
          icon={<Activity size={24} />} 
          colorClass="text-blue-600" 
          bgColorClass="bg-blue-50" 
        />
        <DashboardCard 
          title="Upcoming Appointments" 
          value={stats.appointmentsCount} 
          icon={<Calendar size={24} />} 
          colorClass="text-indigo-600" 
          bgColorClass="bg-indigo-50" 
        />
        <DashboardCard 
          title="Current Goal" 
          value="Build Muscle" 
          icon={<Target size={24} />} 
          colorClass="text-emerald-600" 
          bgColorClass="bg-emerald-50" 
        />
        <DashboardCard 
          title="Fitness Score" 
          value="85" 
          icon={<Award size={24} />} 
          colorClass="text-purple-600" 
          bgColorClass="bg-purple-50" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center mt-8">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Today's Workout</h3>
          <p className="mt-1 text-sm text-gray-500">Your scheduled workout will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
