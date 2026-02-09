import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Share2, Trash2, Video, Clock,
  Eye, Scissors, Film, Play, Calendar, AlertCircle
} from 'lucide-react';
import { videoAPI, clipAPI } from '../api/client';
import './VideoDetail.css';

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
}

interface Clip {
  id: string;
  video_id: string;
  start_time: number;
  end_time: number;
  score: number;
  transcript?: string;
  sentiment?: string;
  key_moments?: string;
  created_at: string;
}

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadVideoDetails();
    }
  }, [id]);

  const loadVideoDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [videoResponse, clipsResponse] = await Promise.all([
        videoAPI.getVideo(id!),
        clipAPI.getUserClips(id!),
      ]);

      setVideo(videoResponse.data);
      setClips(clipsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load video details');
    } finally {
      setLoading(false);
    }
  };

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

  const formatDuration = (seconds: number) => {
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
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'neutral';
    if (sentiment.toLowerCase().includes('positive')) return 'positive';
    if (sentiment.toLowerCase().includes('negative')) return 'negative';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading video details...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="page-container">
        <div className="error-state">
          <AlertCircle size={64} />
          <h2>Error Loading Video</h2>
          <p>{error || 'Video not found'}</p>
          <button className="btn-primary" onClick={() => navigate('/videos')}>
            Back to Videos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate('/videos')}>
          <ArrowLeft size={20} />
          Back to Videos
        </button>
        <div className="header-actions">
          <button className="btn-secondary">
            <Download size={20} />
            Download
          </button>
          <button className="btn-secondary">
            <Share2 size={20} />
            Share
          </button>
          <button className="btn-danger">
            <Trash2 size={20} />
            Delete
          </button>
        </div>
      </div>

      {/* Video Info Section */}
      <div className="video-section">
        <div className="video-player">
          <div className="player-placeholder">
            <Play size={64} />
            <p>Video Player</p>
            <small>(Player integration coming soon)</small>
          </div>
        </div>

        <div className="video-details">
          <div className="detail-header-info">
            <h1>{video.title}</h1>
            {getStatusBadge(video.status)}
          </div>

          {video.description && (
            <p className="video-description">{video.description}</p>
          )}

          <div className="video-metadata">
            <div className="metadata-item">
              <Clock size={18} />
              <div>
                <span className="metadata-label">Duration</span>
                <span className="metadata-value">
                  {video.duration ? formatDuration(video.duration) : 'Unknown'}
                </span>
              </div>
            </div>

            <div className="metadata-item">
              <Eye size={18} />
              <div>
                <span className="metadata-label">File Size</span>
                <span className="metadata-value">{formatFileSize(video.file_size)}</span>
              </div>
            </div>

            <div className="metadata-item">
              <Calendar size={18} />
              <div>
                <span className="metadata-label">Uploaded</span>
                <span className="metadata-value">{formatDate(video.created_at)}</span>
              </div>
            </div>

            {video.analyzed_at && (
              <div className="metadata-item">
                <Scissors size={18} />
                <div>
                  <span className="metadata-label">Analyzed</span>
                  <span className="metadata-value">{formatDate(video.analyzed_at)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clips Section */}
      <div className="clips-section">
        <div className="section-header">
          <h2>
            <Scissors size={24} />
            Clips ({clips.length})
          </h2>
          {clips.length > 0 && (
            <button className="btn-primary" onClick={() => navigate('/shorts')}>
              <Film size={20} />
              Create Short from Clips
            </button>
          )}
        </div>

        {clips.length === 0 ? (
          <div className="empty-clips">
            <Scissors size={48} />
            <h3>No clips yet</h3>
            <p>
              {video.status === 'analyzed'
                ? 'No clips were identified in this video'
                : 'Video needs to be analyzed to extract clips'}
            </p>
          </div>
        ) : (
          <div className="clips-grid">
            {clips.map((clip) => (
              <div key={clip.id} className="clip-card">
                <div className="clip-preview">
                  <Video size={32} />
                  <div className="clip-duration">
                    {formatDuration(clip.end_time - clip.start_time)}
                  </div>
                </div>

                <div className="clip-info">
                  <div className="clip-time">
                    {formatDuration(clip.start_time)} - {formatDuration(clip.end_time)}
                  </div>

                  <div className="clip-score">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${clip.score * 100}%` }}
                      ></div>
                    </div>
                    <span className="score-value">Score: {(clip.score * 100).toFixed(0)}%</span>
                  </div>

                  {clip.sentiment && (
                    <div className={`clip-sentiment sentiment-${getSentimentColor(clip.sentiment)}`}>
                      {clip.sentiment}
                    </div>
                  )}

                  {clip.transcript && (
                    <div className="clip-transcript">
                      <strong>Transcript:</strong>
                      <p>{clip.transcript}</p>
                    </div>
                  )}

                  {clip.key_moments && (
                    <div className="clip-moments">
                      <strong>Key Moments:</strong>
                      <p>{clip.key_moments}</p>
                    </div>
                  )}

                  <div className="clip-actions">
                    <button className="btn-sm btn-primary">
                      <Play size={16} />
                      Play
                    </button>
                    <button className="btn-sm btn-secondary">
                      <Download size={16} />
                      Export
                    </button>
                    <button className="btn-sm btn-secondary">
                      <Film size={16} />
                      Make Short
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
