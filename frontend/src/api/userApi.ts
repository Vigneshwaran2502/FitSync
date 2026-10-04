import apiClient from './axios';

export const userApi = {
  getUsers: async (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (userData: any) => {
    const res = await apiClient.post('/users', userData);
    return res.data;
  },

  updateUser: async (id: string, userData: any) => {
    const res = await apiClient.put(`/users/${id}`, userData);
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },

  assignTrainer: async (memberId: string, trainerId: string | null) => {
    const res = await apiClient.put(`/users/${memberId}/assign-trainer`, { trainerId });
    return res.data;
  },
};
