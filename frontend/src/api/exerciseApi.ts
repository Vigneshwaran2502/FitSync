import apiClient from './axios';

export const exerciseApi = {
  getExercises: async (params?: { muscleGroup?: string; equipment?: string; difficulty?: string; search?: string }) => {
    const res = await apiClient.get('/exercises', { params });
    return res.data;
  },

  getExerciseById: async (id: string) => {
    const res = await apiClient.get(`/exercises/${id}`);
    return res.data;
  },

  createExercise: async (data: any) => {
    const res = await apiClient.post('/exercises', data);
    return res.data;
  },

  updateExercise: async (id: string, data: any) => {
    const res = await apiClient.put(`/exercises/${id}`, data);
    return res.data;
  },

  deleteExercise: async (id: string) => {
    const res = await apiClient.delete(`/exercises/${id}`);
    return res.data;
  },
};
