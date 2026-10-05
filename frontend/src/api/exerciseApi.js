import apiClient from "./axios";
const exerciseApi = {
  getExercises: async (params) => {
    const res = await apiClient.get("/exercises", { params });
    return res.data;
  },
  getExerciseById: async (id) => {
    const res = await apiClient.get(`/exercises/${id}`);
    return res.data;
  },
  createExercise: async (data) => {
    const res = await apiClient.post("/exercises", data);
    return res.data;
  },
  updateExercise: async (id, data) => {
    const res = await apiClient.put(`/exercises/${id}`, data);
    return res.data;
  },
  deleteExercise: async (id) => {
    const res = await apiClient.delete(`/exercises/${id}`);
    return res.data;
  }
};
export {
  exerciseApi
};
