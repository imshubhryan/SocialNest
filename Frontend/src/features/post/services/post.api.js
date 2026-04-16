import axios from 'axios'

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export const getFeed = async()=>{
    const response = await api.get('/api/posts/feed')
    return response.data
}


export const createPost = async(imageFile,caption)=>{

    const formData = new FormData()

    formData.append("image", imageFile)
    formData.append("caption", caption)

    const response = await api.post('/api/posts',formData)

    return response.data
}

export const likePost = async(postId)=>{
    const response = await api.post('/api/posts/like/'+postId)
    return response.data
}

export const unLikePost = async(postId)=>{
    const response = await api.post('/api/posts/unlike/'+postId)
    return response.data
}