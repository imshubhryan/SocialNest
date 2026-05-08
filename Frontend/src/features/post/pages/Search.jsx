import React, { useState, useEffect } from 'react'
import { Search as SearchIcon, Users } from 'lucide-react'
import { useNavigate } from 'react-router'
import { searchUsers } from '../../user/services/user.api'
import './search.scss'
import { NotificationSkeleton } from '../../../components/Skeletons'
import EmptyState from '../../../components/EmptyState'
import { motion, AnimatePresence } from 'framer-motion'

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

const Search = () => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Debounced search — waits 300ms after user stops typing
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await searchUsers(query.trim());
                setResults(res.data || []);
            } catch {
                setResults([]);
            }
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <motion.main
            className="search-page"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
        >
            <div className="search-container">
                <div className="search-input-wrapper">
                    <SearchIcon size={18} className="search-icon" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search users, topics..."
                        autoFocus
                        aria-label="Search users"
                    />
                </div>

                <div className="search-results">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            [1, 2, 3].map((n) => (
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
                        ) : results.length === 0 && query.trim().length >= 2 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <EmptyState
                                    icon={Users}
                                    title="No Results Found"
                                    message={`We couldn't find any user profiles matching "${query}". Check spelling or try another term!`}
                                />
                            </motion.div>
                        ) : (
                            results.map((user, index) => (
                                <motion.div
                                    key={user._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
                                    className="search-result-item"
                                    onClick={() => navigate(`/profile/${user.username}`)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/profile/${user.username}`)}
                                    aria-label={`View profile of ${user.username}`}
                                >
                                    <img
                                        src={user.profileImage || DEFAULT_AVATAR}
                                        alt={user.username}
                                        loading="lazy"
                                    />
                                    <div className="result-info">
                                        <span className="result-username">{user.username}</span>
                                        <span className="result-bio">{user.bio || "SocialNest member"}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.main>
    )
}

export default Search
