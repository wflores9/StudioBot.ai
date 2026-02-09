import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, Eye, Scissors, Film } from 'lucide-react';
import { videoAPI } from '../api/client';
import './VideoList.css';

interface Video {
  id: string;
  title: string;
  description: string;
  url?: string;
  local_path?: string;
  file_size?: number;
  duration?: number;
  status: string;
  created_at: string;
  analyzed_at?: string;
  clipCount?: number;
  shortCount?: number;
}

export default function VideoList({ user }: any) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'analyzed' | 'analyzing' | 'pending'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadVideos();
  }, [user.id]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await videoAPI.getUserVideos(user.id);
      setVideos(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load videos');
      setVideos([]); // Ensure videos is always an array
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    if (filter === 'all') return true;
    return video.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'status-pending' },
      analyzing: { label: 'Analyzing', className: 'status-analyzing' },
      analyzed: { label: 'Analyzed', className: 'status-analyzed' },
      error: { label: 'Error', className: 'status-error' },
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Videos</h1>
        <button className="btn-primary" onClick={() => navigate('/upload')}>
          <Video size={20} />
          Upload New Video
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Videos ({videos.length})
        </button>
        <button
          className={`filter-tab ${filter === 'analyzed' ? 'active' : ''}`}
          onClick={() => setFilter('analyzed')}
        >
          Analyzed ({videos.filter(v => v.status === 'analyzed').length})
        </button>
        <button
          className={`filter-tab ${filter === 'analyzing' ? 'active' : ''}`}
          onClick={() => setFilter('analyzing')}
        >
          Processing ({videos.filter(v => v.status === 'analyzing').length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({videos.filter(v => v.status === 'pending').length})
        </button>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="empty-state">
          <Video size={64} />
          <h3>No videos found</h3>
          <p>
            {filter === 'all'
              ? 'Upload your first video to get started'
              : `No ${filter} videos`}
          </p>
          {filter === 'all' && (
            <button className="btn-primary" onClick={() => navigate('/upload')}>
              Upload Video
            </button>
          )}
        </div>
      ) : (
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="video-card"
              onClick={() => navigate(`/videos/${video.id}`)}
            >
              <div className="video-thumbnail">
                <div className="thumbnail-placeholder">
                  <Video size={48} />
                </div>
                {getStatusBadge(video.status)}
              </div>

              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                {video.description && (
                  <p className="video-description">{video.description}</p>
                )}

                <div className="video-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  <div className="meta-item">
                    <Eye size={14} />
                    <span>{formatFileSize(video.file_size)}</span>
                  </div>
                </div>

                {video.status === 'analyzed' && (
                  <div className="video-stats">
                    <div className="stat-item">
                      <Scissors size={14} />
                      <span>{video.clipCount || 0} Clips</span>
                    </div>
                    <div className="stat-item">
                      <Film size={14} />
                      <span>{video.shortCount || 0} Shorts</span>
                    </div>
                  </div>
                )}

                <div className="video-date">
                  Uploaded {formatDate(video.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
