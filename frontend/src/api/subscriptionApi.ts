import apiClient from './axios';

export const subscriptionApi = {
  getSubscriptions: async (params?: { status?: string; search?: string }) => {
    const res = await apiClient.get('/subscriptions', { params });
    return res.data;
  },

  getMySubscription: async () => {
    const res = await apiClient.get('/subscriptions/my');
    return res.data;
  },

  createRazorpayOrder: async (planId: string) => {
    const res = await apiClient.post('/subscriptions/razorpay/order', { planId });
    return res.data;
  },

  verifyRazorpayPayment: async (data: any) => {
    const res = await apiClient.post('/subscriptions/razorpay/verify', data);
    return res.data;
  },

  createSubscription: async (data: { planId: string; userId?: string; startDate?: string }) => {
    const res = await apiClient.post('/subscriptions', data);
    return res.data;
  },

  requestFreeze: async (id: string, data: { reason?: string; freezeStartDate?: string; freezeEndDate?: string }) => {
    const res = await apiClient.post(`/subscriptions/freeze/${id}`, data);
    return res.data;
  },

  handleFreezeDecision: async (id: string, action: 'approve' | 'reject') => {
    const res = await apiClient.post(`/subscriptions/freeze/${id}/decision`, { action });
    return res.data;
  },

  unfreezeSubscription: async (id: string) => {
    const res = await apiClient.post(`/subscriptions/unfreeze/${id}`);
    return res.data;
  },

  renewSubscription: async (id: string) => {
    const res = await apiClient.post(`/subscriptions/renew/${id}`);
    return res.data;
  },
};
