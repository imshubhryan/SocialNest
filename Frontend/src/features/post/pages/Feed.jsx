import React, { useEffect, useState } from 'react'
import '../style/feed.scss'
import Post from '../components/Post'
import { usePost } from '../hook/usePost'
import StoryBar from '../../story/components/StoryBar'
import { PostSkeleton } from '../../../components/Skeletons'
import EmptyState from '../../../components/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'
import SuggestedCreators from '../../user/components/SuggestedCreators'
import ProfileCompletion from '../../user/components/ProfileCompletion'

const Feed = () => {
    const { feed, handleGetFeed, loading } = usePost()
    const [sort, setSort] = useState('latest')

    // Re-fetch feed when sort changes
    useEffect(() => {
        handleGetFeed(sort)
    }, [sort])

    return (
        <motion.main
            className='feed-page'
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
        >
            <StoryBar />

            <div className="feed">
                <div className="feed-tabs">
                    <button
                        className={`feed-tab ${sort === 'latest' ? 'active' : ''}`}
                        onClick={() => setSort('latest')}
                        aria-label="Sort by latest posts"
                    >
                        Latest
                    </button>
                    <button
                        className={`feed-tab ${sort === 'trending' ? 'active' : ''}`}
                        onClick={() => setSort('trending')}
                        aria-label="Sort by trending posts"
                    >
                        Trending
                    </button>
                </div>

                <div className="posts">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            // Render premium skeletons with shimmer
                            [1, 2, 3].map((n) => (
                                <motion.div
                                    key={`skeleton-${n}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <PostSkeleton />
                                </motion.div>
                            ))
                        ) : !feed || feed.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ width: "100%" }}
                            >
                                <ProfileCompletion />
                                <EmptyState
                                    icon={Flame}
                                    title="Your Feed is Empty"
                                    message="No posts found. Start by following people or create your very first post right now!"
                                    actionLabel="Create First Post"
                                    actionPath="/create-post"
                                />
                                <SuggestedCreators />
                            </motion.div>
                        ) : (
                            feed.map((post, index) => (
                                <motion.div
                                    key={post._id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
                                    viewport={{ once: true }}
                                >
                                    <Post user={post.user} post={post} />
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.main>
    )
}

export default Feed