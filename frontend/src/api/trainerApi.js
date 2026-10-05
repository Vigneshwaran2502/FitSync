import apiClient from "./axios";
const trainerApi = {
  getTrainers: async () => {
    const res = await apiClient.get("/trainers");
    return res.data;
  },
  getTrainerById: async (id) => {
    const res = await apiClient.get(`/trainers/${id}`);
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await apiClient.put("/trainers/profile", profileData);
    return res.data;
  },
  getAvailability: async (trainerId) => {
    const url = trainerId ? `/trainers/${trainerId}/availability` : "/trainers/availability";
    const res = await apiClient.get(url);
    return res.data;
  },
  setAvailability: async (slots, trainerId) => {
    const res = await apiClient.put("/trainers/availability", { slots, trainerId });
    return res.data;
  },
  getAssignedMembers: async (trainerId) => {
    const res = await apiClient.get("/trainers/members/assigned", { params: { trainerId } });
    return res.data;
  }
};
export {
  trainerApi
};
