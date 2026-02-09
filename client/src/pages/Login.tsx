import { useState } from 'react';
import { authAPI } from '../api/client';
import './Login.css';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await authAPI.register(
          formData.username,
          formData.email,
          formData.password
        );
        onLogin(response.data.data);
      } else {
        const response = await authAPI.login(formData.email, formData.password);
        onLogin(response.data.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = () => {
    onLogin({
      id: 'demo-user-123',
      username: 'demo',
      email: 'demo@studiobot.ai',
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🎬 StudioBot.ai</h1>
          <p>AI-Powered Video Analysis & Distribution</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>

          {error && <div className="error-message">{error}</div>}

          {isRegister && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Loading...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>

          <button
            type="button"
            className="demo-btn"
            onClick={handleDemoLogin}
          >
            🚀 Try Demo
          </button>

          <p className="toggle-text">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </form>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <p>AI-Powered Analysis</p>
          </div>
          <div className="feature">
            <span className="feature-icon">✂️</span>
            <p>Auto Clip Generation</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📱</span>
            <p>Multi-Platform Publishing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
