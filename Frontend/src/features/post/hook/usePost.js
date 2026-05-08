import { getFeed, createPost, likePost, savePost, deletePost } from '../services/post.api'
import { addComment, deleteComment, getPostComments } from '../services/comment.api'
import { useContext } from 'react'
import { postContext } from '../post.context'

export const usePost = () => {
    const context = useContext(postContext)
    const { loading, setLoading, post, setPost, feed, setFeed } = context

    const handleGetFeed = async (sort = 'latest') => {
        setLoading(true)
        try {
            const data = await getFeed(sort)
            setFeed(data.data || data.posts || [])
        } catch (err) {
            setFeed([])
        }
        setLoading(false)
    }

    const handleCreatePost = async (imageFile, caption, tags) => {
        setLoading(true)
        try {
            const data = await createPost(imageFile, caption, tags)
            const newPost = data.data || data.post
            setFeed(prev => [newPost, ...(prev || [])])
            return data
        } catch (err) {
            throw err // Re-throw so CreatePost can handle the error state
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async (postId) => {
        // Optimistic update
        setFeed(prev =>
            prev.map(p =>
                p._id === postId
                    ? {
                        ...p,
                        isLiked: !p.isLiked,
                        likesCount: p.isLiked
                            ? Math.max(0, (p.likesCount || 1) - 1)
                            : (p.likesCount || 0) + 1
                    }
                    : p
            )
        )
        try {
            await likePost(postId)
        } catch (err) {
            // Revert on error
            setFeed(prev =>
                prev.map(p =>
                    p._id === postId
                        ? {
                            ...p,
                            isLiked: !p.isLiked,
                            likesCount: !p.isLiked
                                ? Math.max(0, (p.likesCount || 1) - 1)
                                : (p.likesCount || 0) + 1
                        }
                        : p
                )
            )
        }
    }

    const handleSave = async (postId) => {
        // Optimistic update
        setFeed(prev =>
            prev.map(p =>
                p._id === postId
                    ? { ...p, isSaved: !p.isSaved }
                    : p
            )
        )
        try {
            await savePost(postId)
        } catch (err) {
            // Revert
            setFeed(prev =>
                prev.map(p =>
                    p._id === postId
                        ? { ...p, isSaved: !p.isSaved }
                        : p
                )
            )
        }
    }

    const handleAddComment = async (postId, text) => {
        if (!text.trim()) return;
        try {
            const res = await addComment(postId, text);
            setFeed(prev => 
                prev.map(p => 
                    p._id === postId 
                        ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } 
                        : p
                )
            );
            return res.data;
        } catch (err) {
            throw err;
        }
    }

    const handleRemovePost = async (postId) => {
      try {
        await deletePost(postId);
        setFeed(prev => prev.filter(p => p._id !== postId));
      } catch (err) {
        // silently handle
      }
    };

    return { 
        loading, 
        feed, 
        post, 
        handleGetFeed, 
        handleCreatePost, 
        handleLike, 
        handleSave,
        handleAddComment,
        deletePost: handleRemovePost
    }
}