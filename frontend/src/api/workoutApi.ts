import apiClient from './axios';

export const workoutApi = {
  getWorkoutPlans: async () => {
    const res = await apiClient.get('/workouts/plans');
    return res.data;
  },

  getWorkoutPlanById: async (id: string) => {
    const res = await apiClient.get(`/workouts/plans/${id}`);
    return res.data;
  },

  createWorkoutPlan: async (planData: any) => {
    const res = await apiClient.post('/workouts/plans', planData);
    return res.data;
  },

  updateWorkoutPlan: async (id: string, planData: any) => {
    const res = await apiClient.put(`/workouts/plans/${id}`, planData);
    return res.data;
  },

  deleteWorkoutPlan: async (id: string) => {
    const res = await apiClient.delete(`/workouts/plans/${id}`);
    return res.data;
  },

  getTodayWorkout: async (memberId?: string) => {
    const res = await apiClient.get('/workouts/today', { params: { memberId } });
    return res.data;
  },

  logWorkout: async (logData: {
    exerciseId: string;
    workoutPlanId?: string;
    date?: string;
    setsCompleted: number;
    repsCompleted: number;
    weightUsedKg?: number;
    difficultyRating?: number;
    notes?: string;
    durationMinutes?: number;
  }) => {
    const res = await apiClient.post('/workouts/logs', logData);
    return res.data;
  },

  getWorkoutLogs: async (params?: { memberId?: string; date?: string }) => {
    const res = await apiClient.get('/workouts/logs', { params });
    return res.data;
  },
};
