import apiClient from "./axios";
async function requestWithFallback(method, path, data) {
  const res = await (method === "POST" ? apiClient.post(path, data) : method === "PUT" ? apiClient.put(path, data) : apiClient.get(path));
  return res.data;
}
const authApi = {
  login: async (email, password) => {
    if (typeof email === "object") {
      return requestWithFallback("POST", "/auth/login", email);
    }
    return requestWithFallback("POST", "/auth/login", { email, password });
  },
  verifyOtp: async (email, otp) => {
    return requestWithFallback("POST", "/auth/verify-otp", { email, otp });
  },
  googleLogin: async (credential) => {
    return requestWithFallback("POST", "/auth/google", { credential });
  },
  register: async (userData) => {
    return requestWithFallback("POST", "/auth/register", userData);
  },
  getMe: async () => {
    return requestWithFallback("GET", "/auth/me");
  },
  updateProfile: async (data) => {
    return requestWithFallback("PUT", "/auth/profile", data);
  },
  forgotPassword: async (email) => {
    return requestWithFallback("POST", "/auth/forgot-password", { email });
  },
  resetPassword: async (data) => {
    return requestWithFallback("POST", "/auth/reset-password", data);
  }
};
export {
  authApi
};
