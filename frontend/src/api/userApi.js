import apiClient from "./axios";
const userApi = {
  getUsers: async (params) => {
    const res = await apiClient.get("/users", { params });
    return res.data;
  },
  getUserById: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },
  createUser: async (userData) => {
    const res = await apiClient.post("/users", userData);
    return res.data;
  },
  updateUser: async (id, userData) => {
    const res = await apiClient.put(`/users/${id}`, userData);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },
  assignTrainer: async (memberId, trainerId) => {
    const res = await apiClient.put(`/users/${memberId}/assign-trainer`, { trainerId });
    return res.data;
  }
};
export {
  userApi
};
