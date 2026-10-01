import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Dumbbell, Clock, Flame, Calendar, CheckCircle } from 'lucide-react';

const MemberWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await api.get('/workout-plans/my');
        setWorkouts(res.data.data);
      } catch (error) {
        toast.error('Failed to load workout plans');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Workout Plans</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading workouts...</p>
        ) : workouts.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center bg-white rounded-xl border border-gray-100">
            <Dumbbell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No workout plans assigned yet.</p>
            <p className="text-sm text-gray-400 mt-1">Book an appointment with a trainer to get started.</p>
          </div>
        ) : (
          workouts.map(plan => (
            <div key={plan._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    plan.difficultyLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                    plan.difficultyLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {plan.difficultyLevel.charAt(0).toUpperCase() + plan.difficultyLevel.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 text-primary-500" />
                    {plan.durationWeeks} Weeks
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Flame size={16} className="mr-2 text-orange-500" />
                    {plan.goal}
                  </div>
                </div>

                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                  <Dumbbell size={18} className="mr-2" /> Start Workout
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberWorkouts;
