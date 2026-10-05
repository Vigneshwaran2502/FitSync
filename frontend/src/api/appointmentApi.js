import apiClient from "./axios";
const appointmentApi = {
  getAppointments: async (params) => {
    const res = await apiClient.get("/appointments", { params });
    return res.data;
  },
  createAppointment: async (data) => {
    const res = await apiClient.post("/appointments", data);
    return res.data;
  },
  updateStatus: async (id, status, rejectionReason) => {
    const res = await apiClient.put(`/appointments/${id}/status`, { status, rejectionReason });
    return res.data;
  },
  cancelAppointment: async (id) => {
    const res = await apiClient.delete(`/appointments/${id}`);
    return res.data;
  }
};
export {
  appointmentApi
};
