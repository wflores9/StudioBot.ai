import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VideoUpload from './pages/VideoUpload';
import VideoList from './pages/VideoList';
import VideoDetail from './pages/VideoDetail';
import ClipManager from './pages/ClipManager';
import ShortManager from './pages/ShortManager';
import PlatformManager from './pages/PlatformManager';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('studiobot_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('studiobot_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('studiobot_user');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading StudioBot.ai...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/upload" element={<VideoUpload user={user} />} />
          <Route path="/videos" element={<VideoList user={user} />} />
          <Route path="/videos/:id" element={<VideoDetail />} />
          <Route path="/clips" element={<ClipManager user={user} />} />
          <Route path="/shorts" element={<ShortManager />} />
          <Route path="/platforms" element={<PlatformManager />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
