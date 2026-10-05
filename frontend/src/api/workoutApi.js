import apiClient from "./axios";
const workoutApi = {
  getWorkoutPlans: async () => {
    const res = await apiClient.get("/workouts/plans");
    return res.data;
  },
  getWorkoutPlanById: async (id) => {
    const res = await apiClient.get(`/workouts/plans/${id}`);
    return res.data;
  },
  createWorkoutPlan: async (planData) => {
    const res = await apiClient.post("/workouts/plans", planData);
    return res.data;
  },
  updateWorkoutPlan: async (id, planData) => {
    const res = await apiClient.put(`/workouts/plans/${id}`, planData);
    return res.data;
  },
  deleteWorkoutPlan: async (id) => {
    const res = await apiClient.delete(`/workouts/plans/${id}`);
    return res.data;
  },
  getTodayWorkout: async (memberId) => {
    const res = await apiClient.get("/workouts/today", { params: { memberId } });
    return res.data;
  },
  logWorkout: async (logData) => {
    const res = await apiClient.post("/workouts/logs", logData);
    return res.data;
  },
  getWorkoutLogs: async (params) => {
    const res = await apiClient.get("/workouts/logs", { params });
    return res.data;
  }
};
export {
  workoutApi
};
