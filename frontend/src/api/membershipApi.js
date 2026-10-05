import apiClient from "./axios";
const membershipApi = {
  getPlans: async () => {
    const res = await apiClient.get("/memberships");
    return res.data;
  },
  getPlanById: async (id) => {
    const res = await apiClient.get(`/memberships/${id}`);
    return res.data;
  },
  createPlan: async (planData) => {
    const res = await apiClient.post("/memberships", planData);
    return res.data;
  },
  updatePlan: async (id, planData) => {
    const res = await apiClient.put(`/memberships/${id}`, planData);
    return res.data;
  },
  deletePlan: async (id) => {
    const res = await apiClient.delete(`/memberships/${id}`);
    return res.data;
  }
};
export {
  membershipApi
};
