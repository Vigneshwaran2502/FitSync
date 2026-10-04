import apiClient from './axios';

export const notificationApi = {
  getNotifications: async (params?: { unread?: boolean }) => {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.put('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id: string) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  },

  broadcastAnnouncement: async (data: { title: string; message: string; audience: string }) => {
    const res = await apiClient.post('/notifications/broadcast', data);
    return res.data;
  },
};
