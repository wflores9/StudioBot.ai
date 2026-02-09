import { BarChart3, TrendingUp, Eye, ThumbsUp, Share2, Clock, Video, Film } from 'lucide-react';
import './Analytics.css';

export default function Analytics() {
  // Mock data
  const stats = {
    totalViews: 145230,
    totalLikes: 8934,
    totalShares: 1245,
    avgWatchTime: 42,
    videosAnalyzed: 24,
    clipsCreated: 156,
    shortsPublished: 18,
  };

  const viewsData = [
    { day: 'Mon', views: 15420 },
    { day: 'Tue', views: 21340 },
    { day: 'Wed', views: 18230 },
    { day: 'Thu', views: 24150 },
    { day: 'Fri', views: 28940 },
    { day: 'Sat', views: 19870 },
    { day: 'Sun', views: 17280 },
  ];

  const topPerformers = [
    { id: '1', title: 'Product Launch Highlights', views: 45230, likes: 3421, engagement: 7.6 },
    { id: '2', title: 'Tutorial Best Moments', views: 32150, likes: 2189, engagement: 6.8 },
    { id: '3', title: 'Q&A Key Points', views: 28940, likes: 1876, engagement: 6.5 },
    { id: '4', title: 'Behind the Scenes', views: 19830, likes: 1334, engagement: 6.7 },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const maxViews = Math.max(...viewsData.map(d => d.views));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <BarChart3 size={32} />
          Analytics
        </h1>
        <div className="date-range">
          <select className="date-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#EEF2FF' }}>
            <Eye size={24} color="#6366F1" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Views</div>
            <div className="metric-value">{formatNumber(stats.totalViews)}</div>
            <div className="metric-change positive">+12.5% from last week</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#FEF3C7' }}>
            <ThumbsUp size={24} color="#F59E0B" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Likes</div>
            <div className="metric-value">{formatNumber(stats.totalLikes)}</div>
            <div className="metric-change positive">+8.3% from last week</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#D1FAE5' }}>
            <Share2 size={24} color="#10B981" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Shares</div>
            <div className="metric-value">{formatNumber(stats.totalShares)}</div>
            <div className="metric-change positive">+15.7% from last week</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ backgroundColor: '#FCE7F3' }}>
            <Clock size={24} color="#EC4899" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Avg Watch Time</div>
            <div className="metric-value">{stats.avgWatchTime}s</div>
            <div className="metric-change negative">-2.1% from last week</div>
          </div>
        </div>
      </div>

      {/* Views Chart */}
      <div className="chart-section">
        <h2>Views Over Time</h2>
        <div className="bar-chart">
          {viewsData.map((day) => (
            <div key={day.day} className="bar-item">
              <div
                className="bar"
                style={{ height: `${(day.views / maxViews) * 100}%` }}
                title={`${formatNumber(day.views)} views`}
              >
                <div className="bar-value">{formatNumber(day.views)}</div>
              </div>
              <div className="bar-label">{day.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-row">
        {/* Top Performers */}
        <div className="top-performers">
          <h2>
            <TrendingUp size={20} />
            Top Performing Shorts
          </h2>
          <div className="performers-list">
            {topPerformers.map((short, index) => (
              <div key={short.id} className="performer-item">
                <div className="performer-rank">#{index + 1}</div>
                <div className="performer-content">
                  <h4>{short.title}</h4>
                  <div className="performer-stats">
                    <span className="stat">
                      <Eye size={14} />
                      {formatNumber(short.views)}
                    </span>
                    <span className="stat">
                      <ThumbsUp size={14} />
                      {formatNumber(short.likes)}
                    </span>
                    <span className="stat engagement">
                      <TrendingUp size={14} />
                      {short.engagement}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Stats */}
        <div className="content-stats">
          <h2>Content Overview</h2>
          <div className="content-items">
            <div className="content-item">
              <div className="content-icon">
                <Video size={20} />
              </div>
              <div className="content-info">
                <div className="content-value">{stats.videosAnalyzed}</div>
                <div className="content-label">Videos Analyzed</div>
              </div>
            </div>

            <div className="content-item">
              <div className="content-icon">
                <BarChart3 size={20} />
              </div>
              <div className="content-info">
                <div className="content-value">{stats.clipsCreated}</div>
                <div className="content-label">Clips Created</div>
              </div>
            </div>

            <div className="content-item">
              <div className="content-icon">
                <Film size={20} />
              </div>
              <div className="content-info">
                <div className="content-value">{stats.shortsPublished}</div>
                <div className="content-label">Shorts Published</div>
              </div>
            </div>

            <div className="content-item">
              <div className="content-icon">
                <Share2 size={20} />
              </div>
              <div className="content-info">
                <div className="content-value">{(stats.clipsCreated / stats.videosAnalyzed).toFixed(1)}</div>
                <div className="content-label">Avg Clips/Video</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h2>AI Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon success">
              <TrendingUp size={20} />
            </div>
            <div className="insight-content">
              <h4>Peak Performance Time</h4>
              <p>Your shorts perform best when published between 6 PM - 9 PM on weekdays</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon info">
              <Video size={20} />
            </div>
            <div className="insight-content">
              <h4>Optimal Length</h4>
              <p>Shorts between 30-45 seconds get 23% more engagement than longer ones</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon warning">
              <Clock size={20} />
            </div>
            <div className="insight-content">
              <h4>Watch Time Drop-off</h4>
              <p>Viewers drop off after 35 seconds on average. Consider shorter content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
