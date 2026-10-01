import React from 'react';

const ComingSoon = ({ title }) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
      <p className="text-gray-500 font-medium">{title} view coming soon...</p>
    </div>
  </div>
);

export const TrainerWorkoutsList = () => <ComingSoon title="Workout Plans" />;
export const TrainerExercisesList = () => <ComingSoon title="Exercises Library" />;
export const TrainerAppointmentsList = () => <ComingSoon title="My Appointments" />;
export const TrainerAvailability = () => <ComingSoon title="My Availability" />;
export const TrainerProgressList = () => <ComingSoon title="Member Progress" />;
export const TrainerProfile = () => <ComingSoon title="My Profile" />;
