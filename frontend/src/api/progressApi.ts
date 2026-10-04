import apiClient from './axios';

export const progressApi = {
  getFitnessProfile: async (userId?: string) => {
    const url = userId ? `/progress/profile/${userId}` : '/progress/profile';
    const res = await apiClient.get(url);
    return res.data;
  },

  updateFitnessProfile: async (profileData: any) => {
    const res = await apiClient.put('/progress/profile', profileData);
    return res.data;
  },

  getMeasurements: async (userId?: string) => {
    const res = await apiClient.get('/progress/measurements', { params: { userId } });
    return res.data;
  },

  addMeasurement: async (measurementData: {
    weightKg: number;
    date?: string;
    chestCm?: number;
    waistCm?: number;
    hipsCm?: number;
    armsCm?: number;
    thighsCm?: number;
    bodyFatPercent?: number;
    notes?: string;
    userId?: string;
  }) => {
    const res = await apiClient.post('/progress/measurements', measurementData);
    return res.data;
  },

  getGoals: async (userId?: string) => {
    const res = await apiClient.get('/progress/goals', { params: { userId } });
    return res.data;
  },

  createGoal: async (goalData: {
    title: string;
    category?: string;
    targetValue: number;
    currentValue?: number;
    unit?: string;
    targetDate: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/progress/goals', goalData);
    return res.data;
  },

  updateGoal: async (id: string, goalData: any) => {
    const res = await apiClient.put(`/progress/goals/${id}`, goalData);
    return res.data;
  },

  deleteGoal: async (id: string) => {
    const res = await apiClient.delete(`/progress/goals/${id}`);
    return res.data;
  },

  getProgressDashboard: async (userId?: string) => {
    const res = await apiClient.get('/progress/dashboard', { params: { userId } });
    return res.data;
  },
};
