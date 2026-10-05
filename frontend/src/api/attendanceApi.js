import apiClient from "./axios";
const attendanceApi = {
  getActiveQRSession: async () => {
    const res = await apiClient.get("/attendance/qr/active");
    return res.data;
  },
  generateNewQRSession: async () => {
    const res = await apiClient.post("/attendance/qr/generate");
    return res.data;
  },
  checkIn: async (data) => {
    const res = await apiClient.post("/attendance/check-in", data);
    return res.data;
  },
  checkOut: async (memberId) => {
    const res = await apiClient.post("/attendance/check-out", { memberId });
    return res.data;
  },
  getHistory: async (params) => {
    const res = await apiClient.get("/attendance/history", { params });
    return res.data;
  },
  getTodayPresent: async () => {
    const res = await apiClient.get("/attendance/today");
    return res.data;
  }
};
export {
  attendanceApi
};
