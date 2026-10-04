import apiClient from './axios';

export const reportApi = {
  getAdminStats: async () => {
    const res = await apiClient.get('/reports/admin/stats');
    return res.data;
  },

  getTrainerStats: async () => {
    const res = await apiClient.get('/reports/trainer/stats');
    return res.data;
  },

  getAdminReports: async (reportType?: string) => {
    const res = await apiClient.get('/reports/admin/data', { params: { reportType } });
    return res.data;
  },
};
