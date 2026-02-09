import { useState } from 'react';
import { Film, Plus, Video, Calendar, Eye, ThumbsUp, Share2, Download, Trash2, Edit } from 'lucide-react';
import './ShortManager.css';

interface Short {
  id: string;
  title: string;
  clips: number;
  duration: number;
  status: 'draft' | 'processing' | 'ready' | 'published';
  views: number;
  likes: number;
  created_at: string;
  platform?: string;
}

// Mock data
const mockShorts: Short[] = [
  {
    id: '1',
    title: 'Top 5 Moments - Product Launch',
    clips: 5,
    duration: 58,
    status: 'ready',
    views: 12453,
    likes: 892,
    created_at: '2024-02-07T10:30:00Z',
    platform: 'YouTube Shorts'
  },
  {
    id: '2',
    title: 'Best Highlights Compilation',
    clips: 8,
    duration: 45,
    status: 'processing',
    views: 0,
    likes: 0,
    created_at: '2024-02-06T15:20:00Z',
  },
  {
    id: '3',
    title: 'Tutorial Key Takeaways',
    clips: 3,
    duration: 30,
    status: 'draft',
    views: 0,
    likes: 0,
    created_at: '2024-02-05T09:15:00Z',
  }
];

export default function ShortManager() {
  const [shorts] = useState<Short[]>(mockShorts);
  const [filter, setFilter] = useState<'all' | 'draft' | 'processing' | 'ready' | 'published'>('all');

  const filteredShorts = shorts.filter(short => {
    if (filter === 'all') return true;
    return short.status === filter;
  });

  const formatDuration = (seconds: number) => {
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'status-draft' },
      processing: { label: 'Processing', className: 'status-processing' },
      ready: { label: 'Ready', className: 'status-ready' },
      published: { label: 'Published', className: 'status-published' },
    };
    const badge = badges[status] || badges.draft;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <Film size={32} />
          Short Manager
        </h1>
        <button className="btn-primary">
          <Plus size={20} />
          Create New Short
        </button>
      </div>

      {/* Stats */}
      <div className="shorts-stats">
        <div className="stat-card">
          <Film size={24} />
          <div>
            <div className="stat-number">{shorts.length}</div>
            <div className="stat-label">Total Shorts</div>
          </div>
        </div>
        <div className="stat-card">
          <Eye size={24} />
          <div>
            <div className="stat-number">
              {formatNumber(shorts.reduce((sum, s) => sum + s.views, 0))}
            </div>
            <div className="stat-label">Total Views</div>
          </div>
        </div>
        <div className="stat-card">
          <ThumbsUp size={24} />
          <div>
            <div className="stat-number">
              {formatNumber(shorts.reduce((sum, s) => sum + s.likes, 0))}
            </div>
            <div className="stat-label">Total Likes</div>
          </div>
        </div>
        <div className="stat-card">
          <Share2 size={24} />
          <div>
            <div className="stat-number">
              {shorts.filter(s => s.status === 'published').length}
            </div>
            <div className="stat-label">Published</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({shorts.length})
        </button>
        <button
          className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Drafts ({shorts.filter(s => s.status === 'draft').length})
        </button>
        <button
          className={`filter-tab ${filter === 'processing' ? 'active' : ''}`}
          onClick={() => setFilter('processing')}
        >
          Processing ({shorts.filter(s => s.status === 'processing').length})
        </button>
        <button
          className={`filter-tab ${filter === 'ready' ? 'active' : ''}`}
          onClick={() => setFilter('ready')}
        >
          Ready ({shorts.filter(s => s.status === 'ready').length})
        </button>
        <button
          className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
          onClick={() => setFilter('published')}
        >
          Published ({shorts.filter(s => s.status === 'published').length})
        </button>
      </div>

      {/* Shorts Grid */}
      {filteredShorts.length === 0 ? (
        <div className="empty-state">
          <Film size={64} />
          <h3>No shorts found</h3>
          <p>Create your first short from video clips</p>
          <button className="btn-primary">
            <Plus size={20} />
            Create Short
          </button>
        </div>
      ) : (
        <div className="shorts-grid">
          {filteredShorts.map((short) => (
            <div key={short.id} className="short-card">
              <div className="short-preview">
                <Video size={48} />
                <div className="short-duration">{formatDuration(short.duration)}</div>
                {getStatusBadge(short.status)}
              </div>

              <div className="short-info">
                <h3 className="short-title">{short.title}</h3>

                <div className="short-meta">
                  <div className="meta-item">
                    <Film size={14} />
                    <span>{short.clips} clips</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(short.created_at)}</span>
                  </div>
                </div>

                {short.platform && (
                  <div className="short-platform">
                    <Share2 size={14} />
                    <span>{short.platform}</span>
                  </div>
                )}

                {short.status === 'published' && (
                  <div className="short-stats">
                    <div className="stat-item">
                      <Eye size={14} />
                      <span>{formatNumber(short.views)}</span>
                    </div>
                    <div className="stat-item">
                      <ThumbsUp size={14} />
                      <span>{formatNumber(short.likes)}</span>
                    </div>
                  </div>
                )}

                <div className="short-actions">
                  {short.status === 'draft' && (
                    <button className="btn-sm btn-primary">
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                  {short.status === 'ready' && (
                    <>
                      <button className="btn-sm btn-primary">
                        <Share2 size={16} />
                        Publish
                      </button>
                      <button className="btn-sm btn-secondary">
                        <Download size={16} />
                        Download
                      </button>
                    </>
                  )}
                  {short.status === 'published' && (
                    <>
                      <button className="btn-sm btn-secondary">
                        <Eye size={16} />
                        View
                      </button>
                      <button className="btn-sm btn-secondary">
                        <Share2 size={16} />
                        Share
                      </button>
                    </>
                  )}
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
