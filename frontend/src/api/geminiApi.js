import apiClient from "./axios";
const geminiApi = {
  sendMessage: async (data) => {
    const res = await apiClient.post("/gemini/chat", data);
    return res.data;
  },
  getCoachRoles: async () => {
    const res = await apiClient.get("/gemini/roles");
    return res.data;
  }
};
export {
  geminiApi
};
