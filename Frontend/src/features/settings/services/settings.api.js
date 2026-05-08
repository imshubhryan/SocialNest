import api from "../../../lib/api";

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.patch("/api/users/change-password", { currentPassword, newPassword });
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await api.delete("/api/users/delete-account", { data: { password } });
  return response.data;
};

export const getFollowersList = async (username) => {
  const response = await api.get(`/api/users/${username}/followers`);
  return response.data;
};

export const getFollowingList = async (username) => {
  const response = await api.get(`/api/users/${username}/following`);
  return response.data;
};

export const getSavedPosts = async () => {
  const response = await api.get("/api/posts/saved");
  return response.data;
};

export const getLikedPosts = async () => {
  const response = await api.get("/api/posts/liked");
  return response.data;
};
