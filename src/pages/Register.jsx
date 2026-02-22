import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Connection error. Run: npm run server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <Link to="/" className="auth-logo">themoive</Link>
        <div className="auth-card">
          <h1 className="auth-title">Sign Up</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                minLength={2}
                autoComplete="username"
              />
            </div>
            <div className="auth-field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
