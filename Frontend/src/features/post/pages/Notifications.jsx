import React, { useEffect, useState } from 'react'
import api from '../../../lib/api'
import { Heart, MessageCircle, UserPlus, UserCheck, Bell } from 'lucide-react'
import { useNavigate } from 'react-router'
import './notifications.scss'
import { NotificationSkeleton } from '../../../components/Skeletons'
import EmptyState from '../../../components/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const iconMap = {
    like: <Heart size={18} />,
    comment: <MessageCircle size={18} />,
    follow_request: <UserPlus size={18} />,
    follow_accepted: <UserCheck size={18} />,
}

const msgMap = {
    like: 'liked your post',
    comment: 'commented on your post',
    follow_request: 'sent you a follow request',
    follow_accepted: 'accepted your follow request',
}

const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

const Notifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/api/notifications')
                setNotifications(res.data.data || [])
            } catch {
                setNotifications([])
            }
            setLoading(false)
        }
        fetchNotifications()
    }, [])

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}`)
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            )
        } catch {}
    }

    return (
        <motion.main
            className="notifications-page"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
        >
            <div className="notifications-container">
                <h2>Notifications</h2>
                <div className="notifications-list">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            [1, 2, 3, 4].map((n) => (
                                <motion.div
                                    key={`skeleton-${n}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <NotificationSkeleton />
                                </motion.div>
                            ))
                        ) : notifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <EmptyState
                                    icon={Bell}
                                    title="No Notifications"
                                    message="You're all caught up! When friends interact with your posts or follow you, you'll see it here."
                                />
                            </motion.div>
                        ) : (
                            notifications.map((n, index) => (
                                <motion.div
                                    key={n._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
                                    className={`notification-item ${n.isRead ? '' : 'unread'}`}
                                    onClick={() => {
                                        if (!n.isRead) handleMarkAsRead(n._id);
                                        if (n.type === 'follow_request' || n.type === 'follow_accepted') {
                                            navigate(`/profile/${n.sender?.username}`);
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/profile/${n.sender?.username}`)}
                                    aria-label={`${n.sender?.username} ${msgMap[n.type] || n.type}`}
                                >
                                    <div className={`notif-icon ${n.type}`}>
                                        {iconMap[n.type] || <Bell size={18} />}
                                    </div>
                                    <img
                                        className="notif-avatar"
                                        src={n.sender?.profileImage || DEFAULT_AVATAR}
                                        alt={n.sender?.username || "user"}
                                        loading="lazy"
                                    />
                                    <div className="notif-content">
                                        <p>
                                            <strong>{n.sender?.username}</strong>{' '}
                                            {msgMap[n.type] || n.type}
                                        </p>
                                        <span className="notif-time">
                                            {timeAgo(n.createdAt)}
                                        </span>
                                    </div>
                                    {n.post?.imgUrl && (
                                        <img className="notif-post-thumb" src={n.post.imgUrl} alt="post thumbnail" loading="lazy" />
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.main>
    )
}

export default Notifications
