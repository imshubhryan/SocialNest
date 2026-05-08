import React from "react";
import { Link, useLocation } from "react-router";
import { Home, Search, PlusSquare, Heart } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import "../features/shared/navbar.scss";

const DEFAULT_AVATAR = "https://ik.imagekit.io/uv5inemto/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp";

// Routes where bottom mobile navbar should be hidden
const HIDE_BOTTOM_NAV = ["/create-post", "/story/upload"];

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const hideBottom = HIDE_BOTTOM_NAV.includes(location.pathname);

  return (
    <nav className={`main-navbar ${hideBottom ? "hide-bottom" : ""}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" aria-label="SocialNest Home">
          <span className="logo-nest">SocialNest</span>
        </Link>

        <div className="nav-actions">
          <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`} aria-label="Home feed">
            <Home size={24} />
          </Link>
          
          <Link to="/search" className={`nav-link ${location.pathname === "/search" ? "active" : ""}`} aria-label="Search users">
            <Search size={24} />
          </Link>

          <Link to="/create-post" className={`nav-link ${location.pathname === "/create-post" ? "active" : ""}`} aria-label="Create new post">
            <PlusSquare size={24} />
          </Link>

          <Link to="/notifications" className={`nav-link ${location.pathname === "/notifications" ? "active" : ""}`} aria-label="Notifications">
            <Heart size={24} />
          </Link>

          <Link to={`/profile/${user.username}`} className={`nav-link profile-link ${location.pathname.startsWith("/profile") ? "active" : ""}`} aria-label="Your profile">
            <div className="profile-icon-wrapper">
              <img
                src={user.profileImage || DEFAULT_AVATAR}
                alt={user.username || "Profile"}
                className="nav-profile-image"
                loading="lazy"
              />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
