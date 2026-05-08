import api from "../../../lib/api";

export const getFeed = async (sort = 'latest', page = 1) => {
    const response = await api.get(`/api/posts/feed?sort=${sort}&page=${page}`);
    return response.data;
};

export const createPost = async (imageFile, caption, tags) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("caption", caption);
    if (tags) formData.append("tags", tags);

    const response = await api.post('/api/posts', formData);
    return response.data;
};

export const likePost = async (postId) => {
    const response = await api.post('/api/posts/like/' + postId);
    return response.data;
};

export const savePost = async (postId) => {
    const response = await api.post('/api/posts/save/' + postId);
    return response.data;
};

export const unsavePost = async (postId) => {
    const response = await api.post('/api/posts/unsave/' + postId);
    return response.data;
};

export const deletePost = async (postId) => {
    const response = await api.delete('/api/posts/' + postId);
    return response.data;
};

export const getSavedPosts = async (page = 1) => {
    const response = await api.get(`/api/posts/saved?page=${page}`);
    return response.data;
};

export const getLikedPosts = async (page = 1) => {
    const response = await api.get(`/api/posts/liked?page=${page}`);
    return response.data;
};