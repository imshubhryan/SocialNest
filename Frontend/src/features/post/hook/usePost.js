import {getFeed,createPost, likePost,unLikePost} from '../services/post.api'
import { useContext,useEffect } from 'react'
import { postContext } from '../post.context'

export const usePost = ()=>{

    const context = useContext(postContext)
    const {loading,setLoading,post,setPost,feed,setFeed} = context

    const handleGetFeed = async()=>{
        setLoading(true)
        const data = await getFeed()
        setFeed(data.posts)
        setLoading(false)
    }

    const handleCreatePost = async(imageFile,caption)=>{
        setLoading(true)
        const data = await createPost(imageFile,caption)
        setFeed([data.post,...feed])
        setLoading(false)
    }

    const handleLike = async(post)=>{
        
        const data = await likePost(post)
        setFeed(prev =>
        prev.map(p =>
            p._id === post
                ? { ...p, isLiked: true }
                : p
        )
    )
        

    }

    const handleUnLike = async(post)=>{
        
        const data = await unLikePost(post)
        setFeed(prev =>
        prev.map(p =>
            p._id === post
                ? { ...p, isLiked: false }
                : p
        )
    )
        

    }

    
    

    return {loading,feed,post,handleGetFeed,handleCreatePost, handleLike, handleUnLike}
}