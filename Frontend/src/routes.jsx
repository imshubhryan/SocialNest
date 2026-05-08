import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import CheckEmail from './features/auth/pages/CheckEmail'
import VerifyEmail from './features/auth/pages/VerifyEmail'
import ForgotPassword from './features/auth/pages/ForgotPassword'
import ResetPassword from './features/auth/pages/ResetPassword'
import Onboarding from './features/auth/pages/Onboarding'
import Feed from './features/post/pages/Feed'
import CreatePost from './features/post/pages/CreatePost'
import Search from './features/post/pages/Search'
import Notifications from './features/post/pages/Notifications'
import Profile from './features/user/pages/Profile'
import { useAuth } from './features/auth/hooks/useAuth'
import Navbar from './components/Navbar'

const ProtectedLayout = ({ children }) => (
    <>
        <Navbar />
        <div className="app-content">
            {children}
        </div>
    </>
);

const AppRoutes = () => {
    const { user, isAppLoading } = useAuth()

    if (isAppLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <span>SocialNest is loading...</span>
            </div>
        )
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
            <Route path="/reset-password/:token" element={user ? <Navigate to="/" /> : <ResetPassword />} />

            {/* Protected routes */}
            <Route path="/" element={
                 !user ? <Navigate to="/login" /> : 
                 !user.isOnboarded ? <Navigate to="/onboarding" /> : 
                 <ProtectedLayout><Feed /></ProtectedLayout>
            } />
            
            <Route path="/onboarding" element={
                 !user ? <Navigate to="/login" /> : 
                 user.isOnboarded ? <Navigate to="/" /> : 
                 <Onboarding />
            } />

            <Route path="/create-post" element={!user ? <Navigate to="/login" /> : <ProtectedLayout><CreatePost /></ProtectedLayout>} />
            <Route path="/search" element={!user ? <Navigate to="/login" /> : <ProtectedLayout><Search /></ProtectedLayout>} />
            <Route path="/notifications" element={!user ? <Navigate to="/login" /> : <ProtectedLayout><Notifications /></ProtectedLayout>} />
            <Route path="/profile/:username" element={!user ? <Navigate to="/login" /> : <ProtectedLayout><Profile /></ProtectedLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    )
}

export default AppRoutes