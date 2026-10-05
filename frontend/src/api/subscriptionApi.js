import apiClient from "./axios";
const subscriptionApi = {
  getSubscriptions: async (params) => {
    const res = await apiClient.get("/subscriptions", { params });
    return res.data;
  },
  getMySubscription: async () => {
    const res = await apiClient.get("/subscriptions/my");
    return res.data;
  },
  createRazorpayOrder: async (planId) => {
    const res = await apiClient.post("/subscriptions/razorpay/order", { planId });
    return res.data;
  },
  verifyRazorpayPayment: async (data) => {
    const res = await apiClient.post("/subscriptions/razorpay/verify", data);
    return res.data;
  },
  createSubscription: async (data) => {
    const res = await apiClient.post("/subscriptions", data);
    return res.data;
  },
  requestFreeze: async (id, data) => {
    const res = await apiClient.post(`/subscriptions/freeze/${id}`, data);
    return res.data;
  },
  handleFreezeDecision: async (id, action) => {
    const res = await apiClient.post(`/subscriptions/freeze/${id}/decision`, { action });
    return res.data;
  },
  unfreezeSubscription: async (id) => {
    const res = await apiClient.post(`/subscriptions/unfreeze/${id}`);
    return res.data;
  },
  renewSubscription: async (id) => {
    const res = await apiClient.post(`/subscriptions/renew/${id}`);
    return res.data;
  }
};
export {
  subscriptionApi
};
