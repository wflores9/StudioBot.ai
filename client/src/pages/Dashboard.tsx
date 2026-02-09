import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Scissors, Film, Share2, TrendingUp, Clock } from 'lucide-react';
import { videoAPI, clipAPI, shortAPI } from '../api/client';
import './Dashboard.css';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState({
    videos: 0,
    clips: 0,
    shorts: 0,
    analyzing: 0,
  });
  const [recentVideos, setRecentVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user.id]);

  const loadDashboardData = async () => {
    try {
      const [videosRes, clipsRes, shortsRes] = await Promise.all([
        videoAPI.getUserVideos(user.id, 1, 5),
        clipAPI.getUserClips(user.id, 1, 5),
        shortAPI.getUserShorts(user.id, 1, 5),
      ]);

      const videos = Array.isArray(videosRes.data) ? videosRes.data : (videosRes.data.data?.data || []);
      const clips = Array.isArray(clipsRes.data) ? clipsRes.data : (clipsRes.data.data?.data || []);
      const shorts = Array.isArray(shortsRes.data) ? shortsRes.data : (shortsRes.data.data?.data || []);

      const analyzing = Array.isArray(videos) ? videos.filter((v: any) => v.status === 'analyzing' || v.status === 'pending').length : 0;

      setStats({
        videos: Array.isArray(videos) ? videos.length : 0,
        clips: Array.isArray(clips) ? clips.length : 0,
        shorts: Array.isArray(shorts) ? shorts.length : 0,
        analyzing,
      });

      setRecentVideos(Array.isArray(videos) ? videos : []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setRecentVideos([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user.username}! 👋</h1>
          <p>Here's what's happening with your content</p>
        </div>
        <Link to="/upload" className="primary-btn">
          <Video size={20} />
          Upload Video
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon video-icon">
            <Video size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.videos}</h3>
            <p>Total Videos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon clip-icon">
            <Scissors size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.clips}</h3>
            <p>Clips Created</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon short-icon">
            <Film size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.shorts}</h3>
            <p>Shorts Generated</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon analyzing-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.analyzing}</h3>
            <p>Analyzing</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/upload" className="action-card">
            <Video size={32} />
            <h3>Upload Video</h3>
            <p>Upload a new video for AI analysis</p>
          </Link>

          <Link to="/videos" className="action-card">
            <Film size={32} />
            <h3>My Videos</h3>
            <p>View and manage your videos</p>
          </Link>

          <Link to="/clips" className="action-card">
            <Scissors size={32} />
            <h3>Create Clips</h3>
            <p>Extract viral moments from videos</p>
          </Link>

          <Link to="/platforms" className="action-card">
            <Share2 size={32} />
            <h3>Publish</h3>
            <p>Distribute to social platforms</p>
          </Link>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Videos</h2>
          <Link to="/videos" className="view-all-link">View All →</Link>
        </div>

        {recentVideos.length === 0 ? (
          <div className="empty-state">
            <Video size={48} />
            <h3>No videos yet</h3>
            <p>Upload your first video to get started</p>
            <Link to="/upload" className="primary-btn">
              Upload Video
            </Link>
          </div>
        ) : (
          <div className="video-list">
            {recentVideos.map((video) => (
              <Link to={`/videos/${video.id}`} key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <Video size={32} />
                </div>
                <div className="video-info">
                  <h3>{video.title}</h3>
                  <p className="video-description">{video.description || 'No description'}</p>
                  <div className="video-meta">
                    <span className={`status-badge ${video.status}`}>
                      {video.status}
                    </span>
                    <span className="video-date">
                      <Clock size={14} />
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
