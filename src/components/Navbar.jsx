import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="navbar__logo">themoive</Link>
      <nav className="navbar__links">
        <Link to="/" className="active">Home</Link>
        <a href="#">TV Shows</a>
        <a href="#">Movies</a>
        <a href="#">New & Popular</a>
        <a href="#">My List</a>
      </nav>
      <div className="navbar__actions">
        <button className="icon-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
        </button>
        {!user ? (
          <div className="navbar__auth">
            <Link to="/login" className="btn btn--auth">Sign In</Link>
            <Link to="/register" className="btn btn--auth btn--auth-primary">Sign Up</Link>
          </div>
        ) : (
          <div className="navbar__user">
            <button type="button" className="btn btn--auth btn--signout" onClick={logout}>Sign Out</button>
            <div className="avatar">
              <span className="avatar-fallback">{(user.username || user.email || 'U').charAt(0).toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}