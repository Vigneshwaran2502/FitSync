import React from 'react';

const ComingSoon = ({ title }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
      <p className="text-gray-500 font-medium">{title} view coming soon...</p>
    </div>
  </div>
);

export const MemberMembership = () => <ComingSoon title="My Membership" />;
export const MemberAttendance = () => <ComingSoon title="My Attendance" />;
export const MemberProgress = () => <ComingSoon title="My Progress" />;
export const MemberGoals = () => <ComingSoon title="My Goals" />;
export const MemberAppointments = () => <ComingSoon title="My Appointments" />;
export const MemberProfile = () => <ComingSoon title="My Profile" />;
