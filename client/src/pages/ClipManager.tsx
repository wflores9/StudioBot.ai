import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors, Video, Play, Download, Film, Trash2,
  Filter, Search, Calendar, TrendingUp
} from 'lucide-react';
import { clipAPI } from '../api/client';
import './ClipManager.css';

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
  video?: {
    id: string;
    title: string;
  };
}

export default function ClipManager({ user }: any) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'duration'>('score');
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadClips();
  }, [user.id]);

  const loadClips = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clipAPI.getUserClips(user.id);
      setClips(Array.isArray(response.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load clips');
      setClips([]); // Ensure clips is always an array
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'neutral';
    if (sentiment.toLowerCase().includes('positive')) return 'positive';
    if (sentiment.toLowerCase().includes('negative')) return 'negative';
    return 'neutral';
  };

  const filteredAndSortedClips = clips
    .filter(clip => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          clip.video?.title.toLowerCase().includes(search) ||
          clip.transcript?.toLowerCase().includes(search) ||
          clip.key_moments?.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .filter(clip => {
      // Sentiment filter
      if (filterSentiment === 'all') return true;
      return getSentimentColor(clip.sentiment) === filterSentiment;
    })
    .sort((a, b) => {
      // Sort
      if (sortBy === 'score') {
        return b.score - a.score;
      } else if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        const durationA = a.end_time - a.start_time;
        const durationB = b.end_time - b.start_time;
        return durationB - durationA;
      }
    });

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading clips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <Scissors size={32} />
          Clip Manager
        </h1>
        <div className="stats-summary">
          <div className="stat">
            <span className="stat-value">{clips.length}</span>
            <span className="stat-label">Total Clips</span>
          </div>
          <div className="stat">
            <span className="stat-value">
              {clips.filter(c => c.score >= 0.7).length}
            </span>
            <span className="stat-label">High Quality</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search clips by video title, transcript, or key moments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>
              <TrendingUp size={16} />
              Sort by:
            </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="score">Score (High to Low)</option>
              <option value="date">Date (Newest First)</option>
              <option value="duration">Duration (Longest First)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <Filter size={16} />
              Sentiment:
            </label>
            <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value as any)}>
              <option value="all">All</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clips Grid */}
      {filteredAndSortedClips.length === 0 ? (
        <div className="empty-state">
          <Scissors size={64} />
          <h3>No clips found</h3>
          <p>
            {clips.length === 0
              ? 'Upload and analyze videos to create clips'
              : 'No clips match your search criteria'}
          </p>
          {clips.length === 0 && (
            <button className="btn-primary" onClick={() => navigate('/upload')}>
              Upload Video
            </button>
          )}
        </div>
      ) : (
        <div className="clips-list">
          {filteredAndSortedClips.map((clip) => (
            <div key={clip.id} className="clip-item">
              <div className="clip-preview-small">
                <Video size={28} />
                <div className="clip-duration-badge">
                  {formatDuration(clip.end_time - clip.start_time)}
                </div>
              </div>

              <div className="clip-content">
                <div className="clip-header">
                  <div className="clip-title-section">
                    <h3 className="clip-video-title">
                      {clip.video?.title || 'Unknown Video'}
                    </h3>
                    <div className="clip-time">
                      {formatDuration(clip.start_time)} - {formatDuration(clip.end_time)}
                    </div>
                  </div>

                  <div className="clip-metrics">
                    <div className="clip-score-inline">
                      <TrendingUp size={14} />
                      <span>{(clip.score * 100).toFixed(0)}%</span>
                    </div>

                    {clip.sentiment && (
                      <div className={`clip-sentiment-inline sentiment-${getSentimentColor(clip.sentiment)}`}>
                        {clip.sentiment}
                      </div>
                    )}

                    <div className="clip-date">
                      <Calendar size={14} />
                      {formatDate(clip.created_at)}
                    </div>
                  </div>
                </div>

                {(clip.transcript || clip.key_moments) && (
                  <div className="clip-details">
                    {clip.transcript && (
                      <p className="clip-transcript-inline">
                        <strong>Transcript:</strong> {clip.transcript}
                      </p>
                    )}
                    {clip.key_moments && (
                      <p className="clip-moments-inline">
                        <strong>Key Moments:</strong> {clip.key_moments}
                      </p>
                    )}
                  </div>
                )}

                <div className="clip-actions-inline">
                  <button
                    className="btn-sm btn-primary"
                    onClick={() => navigate(`/videos/${clip.video_id}`)}
                  >
                    <Video size={16} />
                    View Video
                  </button>
                  <button className="btn-sm btn-secondary">
                    <Play size={16} />
                    Preview
                  </button>
                  <button className="btn-sm btn-secondary">
                    <Download size={16} />
                    Export
                  </button>
                  <button className="btn-sm btn-secondary">
                    <Film size={16} />
                    Create Short
                  </button>
                  <button className="btn-sm btn-danger-outline">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
