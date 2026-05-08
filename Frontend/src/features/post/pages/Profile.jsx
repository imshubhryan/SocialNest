import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import api from '../../../lib/api'
import { useAuth } from '../../auth/hooks/useAuth'
import ProfileHeader from '../../user/components/ProfileHeader'
import EditProfileModal from '../../user/components/EditProfileModal'
import { ProfileSkeleton } from '../../../components/Skeletons'
import EmptyState from '../../../components/EmptyState'
import { Grid, Bookmark, Camera } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import '../style/profile.scss'

const Profile = () => {
    const { username } = useParams()
    const navigate = useNavigate()
    const { user: currentUser, handleGetMe } = useAuth()
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('posts')
    const [showEditModal, setShowEditModal] = useState(false)

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/api/users/profile/${username}`)
            setProfileData(res.data.data || res.data)
        } catch {
            setProfileData(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [username])

    const handleFollowToggle = async () => {
        if (!profileData || !profileData.user) return;
        const targetUser = profileData.user;
        try {
            // Optimistic update
            setProfileData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    isFollowing: !prev.user.isFollowing,
                    followersCount: prev.user.isFollowing 
                        ? Math.max(0, prev.user.followersCount - 1)
                        : prev.user.followersCount + 1
                }
            }));
            await api.post(`/api/users/follow/${targetUser._id}`);
        } catch {
            // Revert
            fetchProfile();
        }
    }

    const handleEditSave = async (formData) => {
        try {
            await api.patch('/api/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await handleGetMe();
            await fetchProfile();
        } catch (err) {
            throw err;
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <ProfileSkeleton />
            </div>
        )
    }

    if (!profileData || !profileData.user) {
        return (
            <main className="profile-page" style={{ padding: "40px 16px" }}>
                <EmptyState
                    icon={Camera}
                    title="User Not Found"
                    message="The user profile you are trying to view does not exist or has been made private."
                />
            </main>
        )
    }

    const { user, posts, stats } = profileData
    const isOwner = currentUser?._id === user._id || currentUser?.username === user.username

    return (
        <motion.main
            className="profile-page"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ paddingBottom: "80px" }}
        >
            <div className="profile-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
                <ProfileHeader
                    profile={{
                        ...user,
                        postsCount: stats?.postsCount || posts?.length || 0,
                    }}
                    isOwner={isOwner}
                    onEditClick={() => setShowEditModal(true)}
                    onSettingsClick={() => navigate('/settings')}
                    onFollowToggle={handleFollowToggle}
                />

                {/* Tabs */}
                <div className="profile-tabs">
                    <button
                        className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                        aria-label="View posts grid"
                    >
                        <Grid size={16} />
                        Posts
                    </button>
                    {isOwner && (
                        <button
                            className={`tab-item ${activeTab === 'saved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('saved')}
                            aria-label="View saved posts"
                        >
                            <Bookmark size={16} />
                            Saved
                        </button>
                    )}
                </div>

                {/* Grid */}
                <div className="post-grid">
                    <AnimatePresence mode="popLayout">
                        {posts?.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ gridColumn: "span 3" }}
                            >
                                <EmptyState
                                    icon={Camera}
                                    title="No Posts Yet"
                                    message={isOwner ? "Share your first photo to begin your SocialNest journey!" : `@${user.username} hasn't posted anything yet.`}
                                />
                            </motion.div>
                        ) : (
                            posts.map((post, idx) => (
                                <motion.div
                                    key={post._id}
                                    className="grid-item"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.25) }}
                                    onClick={() => navigate(`/post/${post._id}`)}
                                >
                                    <img className="grid-image" src={post.imgUrl} alt="Post thumbnail" loading="lazy" />
                                    <div className="grid-overlay">
                                        <div className="overlay-stats">
                                            <span className="stat">❤️ {post.likesCount || 0}</span>
                                            <span className="stat">💬 {post.commentsCount || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {showEditModal && (
                <EditProfileModal
                    user={currentUser}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleEditSave}
                />
            )}
        </motion.main>
    )
}

export default Profile
