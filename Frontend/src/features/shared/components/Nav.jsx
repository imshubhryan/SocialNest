import React from 'react'
import '../nav.scss'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { Home, PlusSquare, Bell, Search, LogOut } from 'lucide-react'

const Nav = () => {
    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()

    return (
        <nav className='nav-bar'>
            <div className="nav-brand" onClick={() => navigate('/')}>
                <div className="nav-logo">
                    <Home size={18} />
                </div>
                <span className="nav-title">SocialNest</span>
            </div>
            <div className="nav-actions">
                <button className="nav-icon-btn" onClick={() => navigate('/search')} title="Search">
                    <Search size={18} />
                </button>
                <button className="nav-icon-btn" onClick={() => navigate('/create-post')} title="Create Post">
                    <PlusSquare size={18} />
                </button>
                <button className="nav-icon-btn" onClick={() => navigate('/notifications')} title="Notifications">
                    <Bell size={18} />
                    <span className="badge"></span>
                </button>
                {user ? (
                    <>
                        <img
                            className="nav-avatar"
                            src={user.profileImage || "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp"}
                            alt={user.username}
                            onClick={() => navigate('/profile/' + user.username)}
                        />
                        <button className="nav-icon-btn" onClick={handleLogout} title="Logout">
                            <LogOut size={16} />
                        </button>
                    </>
                ) : (
                    <button className="button primary-button" onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    )
}

export default Nav