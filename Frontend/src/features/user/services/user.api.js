import api from "../../../lib/api";

export const getUserProfile = async (username) => {
  const response = await api.get(`/api/users/profile/${username}`);
  return response.data;
};

export const updateProfile = async (formData) => {
  const response = await api.patch("/api/users/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const followUser = async (username) => {
  const response = await api.post(`/api/users/follow/${username}`);
  return response.data;
};

export const unfollowUser = async (username) => {
  const response = await api.post(`/api/users/unfollow/${username}`);
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
  return response.data;
};
