import apiClient from "./axios";
const progressApi = {
  getFitnessProfile: async (userId) => {
    const url = userId ? `/progress/profile/${userId}` : "/progress/profile";
    const res = await apiClient.get(url);
    return res.data;
  },
  updateFitnessProfile: async (profileData) => {
    const res = await apiClient.put("/progress/profile", profileData);
    return res.data;
  },
  getMeasurements: async (userId) => {
    const res = await apiClient.get("/progress/measurements", { params: { userId } });
    return res.data;
  },
  addMeasurement: async (measurementData) => {
    const res = await apiClient.post("/progress/measurements", measurementData);
    return res.data;
  },
  getGoals: async (userId) => {
    const res = await apiClient.get("/progress/goals", { params: { userId } });
    return res.data;
  },
  createGoal: async (goalData) => {
    const res = await apiClient.post("/progress/goals", goalData);
    return res.data;
  },
  updateGoal: async (id, goalData) => {
    const res = await apiClient.put(`/progress/goals/${id}`, goalData);
    return res.data;
  },
  deleteGoal: async (id) => {
    const res = await apiClient.delete(`/progress/goals/${id}`);
    return res.data;
  },
  getProgressDashboard: async (userId) => {
    const res = await apiClient.get("/progress/dashboard", { params: { userId } });
    return res.data;
  }
};
export {
  progressApi
};
