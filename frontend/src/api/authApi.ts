import apiClient from './axios';
import { safeStorage } from '../utils/storage';

async function requestWithFallback<T = any>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  data?: any
): Promise<T> {
  const res = await (method === 'POST'
    ? apiClient.post(path, data)
    : method === 'PUT'
    ? apiClient.put(path, data)
    : apiClient.get(path));
  return res.data;
}

export const authApi = {
  login: async (email: string, password?: string) => {
    // allow passing object or two arguments to support both old and new usage
    if (typeof email === 'object') {
      return requestWithFallback('POST', '/auth/login', email);
    }
    return requestWithFallback('POST', '/auth/login', { email, password });
  },

  verifyOtp: async (email: string, otp: string) => {
    return requestWithFallback('POST', '/auth/verify-otp', { email, otp });
  },

  googleLogin: async (credential: string) => {
    return requestWithFallback('POST', '/auth/google', { credential });
  },

  register: async (userData: { name: string; email: string; password: string; phone?: string }) => {
    return requestWithFallback('POST', '/auth/register', userData);
  },

  getMe: async () => {
    return requestWithFallback('GET', '/auth/me');
  },

  updateProfile: async (data: { name?: string; phone?: string; password?: string; currentPassword?: string }) => {
    return requestWithFallback('PUT', '/auth/profile', data);
  },

  forgotPassword: async (email: string) => {
    return requestWithFallback('POST', '/auth/forgot-password', { email });
  },

  resetPassword: async (data: { email: string; newPassword: string }) => {
    return requestWithFallback('POST', '/auth/reset-password', data);
  },
};
