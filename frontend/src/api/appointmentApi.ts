import apiClient from './axios';

export const appointmentApi = {
  getAppointments: async (params?: { status?: string; date?: string }) => {
    const res = await apiClient.get('/appointments', { params });
    return res.data;
  },

  createAppointment: async (data: {
    trainerId: string;
    memberId?: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string;
    notes?: string;
  }) => {
    const res = await apiClient.post('/appointments', data);
    return res.data;
  },

  updateStatus: async (id: string, status: string, rejectionReason?: string) => {
    const res = await apiClient.put(`/appointments/${id}/status`, { status, rejectionReason });
    return res.data;
  },

  cancelAppointment: async (id: string) => {
    const res = await apiClient.delete(`/appointments/${id}`);
    return res.data;
  },
};
