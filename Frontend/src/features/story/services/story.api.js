import api from "../../../lib/api";

export const getFollowingStories = async () => {
  const response = await api.get("/api/stories/following");
  return response.data;
};

export const uploadStory = async (file) => {
  const formData = new FormData();
  formData.append("media", file);
  const response = await api.post("/api/stories/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const viewStory = async (id) => {
  const response = await api.post(`/api/stories/view/${id}`);
  return response.data;
};

export const deleteStory = async (id) => {
  const response = await api.delete(`/api/stories/${id}`);
  return response.data;
};
