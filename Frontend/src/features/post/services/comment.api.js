import api from "../../../lib/api";

export const addComment = async (postId, content) => {
    const response = await api.post(`/api/comments/${postId}`, { content });
    return response.data;
};

export const getPostComments = async (postId, page = 1) => {
    const response = await api.get(`/api/comments/post/${postId}?page=${page}`);
    return response.data;
};

export const deleteComment = async (commentId) => {
    const response = await api.delete(`/api/comments/${commentId}`);
    return response.data;
};
