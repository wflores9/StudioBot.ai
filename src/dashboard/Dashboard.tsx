/**
 * StudioBot.ai React Dashboard
 * Main dashboard component with tabs for videos, clips, publishing, and analytics
 */

import React, { useState, useEffect } from 'react';

interface Video {
  id: string;
  title: string;
  sourceUrl: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface Clip {
  id: string;
  videoId: string;
  startTime: number;
  endTime: number;
  status: 'draft' | 'approved' | 'published';
}

interface Platform {
  id: string;
  name: 'youtube' | 'twitch' | 'rumble';
  isConnected: boolean;
  accessToken?: string;
  lastSynced?: string;
}

interface AnalyticsData {
  platform: string;
  views: number;
  engagement: number;
  engagementRate: number;
}

type TabType = 'videos' | 'clips' | 'publish' | 'analytics' | 'platforms';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data.data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClips = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clips');
      const data = await response.json();
      setClips(data.data || []);
    } catch (error) {
      console.error('Error fetching clips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/platforms');
      const data = await response.json();
      setPlatforms(data.data || []);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/distributions/analytics');
      const data = await response.json();
      setAnalytics(data.analytics || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (file: File, title: string) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      alert('Video uploaded successfully!');
      fetchVideos();
    } catch (error) {
      alert('Error uploading video: ' + (error as Error).message);
    }
  };

  const handlePublish = async (clipId: string, platforms: string[]) => {
    try {
      for (const platform of platforms) {
        await fetch(`/api/distributions/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId: clipId,
            contentType: 'clip',
            platformName: platform,
          }),
        });
      }
      alert('Content published successfully!');
      fetchClips();
    } catch (error) {
      alert('Error publishing: ' + (error as Error).message);
    }
  };

  const handleConnectPlatform = async (platform: 'youtube' | 'twitch' | 'rumble') => {
    try {
      const response = await fetch(`/api/platforms/connect/${platform}`, {
        method: 'POST',
      });
      const data = await response.json();
      // Redirect to OAuth URL
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      alert('Error connecting platform: ' + (error as Error).message);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎬 StudioBot.ai Dashboard</h1>
        <p>Video Analysis, Clipping, and Multi-Platform Distribution</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('videos');
            fetchVideos();
          }}
        >
          📹 Videos
        </button>
        <button
          className={`nav-btn ${activeTab === 'clips' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('clips');
            fetchClips();
          }}
        >
          ✂️ Clips
        </button>
        <button
          className={`nav-btn ${activeTab === 'publish' ? 'active' : ''}`}
          onClick={() => setActiveTab('publish')}
        >
          📤 Publish
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analytics');
            fetchAnalytics();
          }}
        >
          📊 Analytics
        </button>
        <button
          className={`nav-btn ${activeTab === 'platforms' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('platforms');
            fetchPlatforms();
          }}
        >
          🌐 Platforms
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'videos' && (
          <section className="tab-content">
            <h2>My Videos</h2>
            <div className="upload-area">
              <h3>Upload New Video</h3>
              <VideoUpload onUpload={handleUploadVideo} />
            </div>
            {loading ? (
              <p>Loading videos...</p>
            ) : (
              <div className="video-grid">
                {videos.map((video) => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumbnail">
                      <img src={`https://img.youtube.com/vi/${video.sourceUrl}/maxresdefault.jpg`} alt={video.title} />
                    </div>
                    <h3>{video.title}</h3>
                    <p className={`status status-${video.status}`}>{video.status}</p>
                    <p className="date">{new Date(video.createdAt).toLocaleDateString()}</p>
                    <button onClick={() => setSelectedVideo(video.id)}>Analyze</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'clips' && (
          <section className="tab-content">
            <h2>Clips & Shorts</h2>
            {loading ? (
              <p>Loading clips...</p>
            ) : (
              <div className="clips-list">
                {clips.map((clip) => (
                  <div key={clip.id} className="clip-item">
                    <div className="clip-info">
                      <h3>Clip from Video {clip.videoId}</h3>
                      <p>{Math.round(clip.endTime - clip.startTime)}s • {clip.startTime.toFixed(1)}s - {clip.endTime.toFixed(1)}s</p>
                      <span className={`badge ${clip.status}`}>{clip.status}</span>
                    </div>
                    {clip.status === 'approved' && (
                      <button onClick={() => setSelectedVideo(clip.id)}>Publish</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'publish' && (
          <section className="tab-content">
            <h2>Publish Content</h2>
            <PublishPanel selectedClip={selectedVideo} onPublish={handlePublish} />
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="tab-content">
            <h2>Analytics</h2>
            {loading ? (
              <p>Loading analytics...</p>
            ) : (
              <div className="analytics-grid">
                {analytics.map((metric, idx) => (
                  <div key={idx} className="analytics-card">
                    <h3>{metric.platform}</h3>
                    <div className="metric">
                      <span className="label">Views:</span>
                      <span className="value">{metric.views.toLocaleString()}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Engagement:</span>
                      <span className="value">{metric.engagement.toLocaleString()}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Engagement Rate:</span>
                      <span className="value">{metric.engagementRate.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'platforms' && (
          <section className="tab-content">
            <h2>Connected Platforms</h2>
            <div className="platform-grid">
              <PlatformCard
                name="YouTube"
                icon="▶️"
                connected={platforms.some((p) => p.name === 'youtube' && p.isConnected)}
                onConnect={() => handleConnectPlatform('youtube')}
              />
              <PlatformCard
                name="Twitch"
                icon="🎮"
                connected={platforms.some((p) => p.name === 'twitch' && p.isConnected)}
                onConnect={() => handleConnectPlatform('twitch')}
              />
              <PlatformCard
                name="Rumble"
                icon="🎯"
                connected={platforms.some((p) => p.name === 'rumble' && p.isConnected)}
                onConnect={() => handleConnectPlatform('rumble')}
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

/**
 * Video Upload Component
 */
interface VideoUploadProps {
  onUpload: (file: File, title: string) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload }) => {
  const [title, setTitle] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileInputRef.current?.files?.[0]) {
      onUpload(fileInputRef.current.files[0], title);
      setTitle('');
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <input
        type="text"
        placeholder="Video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input type="file" ref={fileInputRef} accept="video/*" required />
      <button type="submit">Upload</button>
    </form>
  );
};

/**
 * Publish Panel Component
 */
interface PublishPanelProps {
  selectedClip: string | null;
  onPublish: (clipId: string, platforms: string[]) => void;
}

const PublishPanel: React.FC<PublishPanelProps> = ({ selectedClip, onPublish }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  if (!selectedClip) {
    return <p>Select a clip to publish</p>;
  }

  return (
    <div className="publish-panel">
      <h3>Select Platforms</h3>
      <div className="platform-checkboxes">
        {['youtube', 'twitch', 'rumble'].map((platform) => (
          <label key={platform}>
            <input
              type="checkbox"
              checked={selectedPlatforms.includes(platform)}
              onChange={() => togglePlatform(platform)}
            />
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </label>
        ))}
      </div>
      <button
        onClick={() => onPublish(selectedClip, selectedPlatforms)}
        disabled={selectedPlatforms.length === 0}
      >
        Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
};

/**
 * Platform Card Component
 */
interface PlatformCardProps {
  name: string;
  icon: string;
  connected: boolean;
  onConnect: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ name, icon, connected, onConnect }) => {
  return (
    <div className={`platform-card ${connected ? 'connected' : ''}`}>
      <div className="platform-icon">{icon}</div>
      <h3>{name}</h3>
      <p className={`status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '✅ Connected' : '❌ Not Connected'}
      </p>
      {!connected && <button onClick={onConnect}>Connect</button>}
    </div>
  );
};

export default Dashboard;

/**
 * Styles (to be used with CSS-in-JS or separate CSS file)
 */
export const styles = `
  .dashboard {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
  }

  .dashboard-header {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    text-align: center;
    border-bottom: 3px solid #667eea;
  }

  .dashboard-header h1 {
    margin: 0;
    font-size: 2.5rem;
  }

  .dashboard-header p {
    margin: 0.5rem 0 0 0;
    color: #666;
  }

  .dashboard-nav {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    overflow-x: auto;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid #667eea;
    background: white;
    color: #667eea;
    cursor: pointer;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .nav-btn:hover {
    background: #667eea;
    color: white;
  }

  .nav-btn.active {
    background: #667eea;
    color: white;
  }

  .dashboard-content {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .tab-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .video-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .video-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }

  .video-thumbnail {
    width: 100%;
    padding-top: 56.25%;
    position: relative;
    background: #f0f0f0;
  }

  .video-thumbnail img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .analytics-card {
    border: 2px solid #667eea;
    border-radius: 8px;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .metric {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    font-weight: 600;
  }

  .platform-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .platform-card {
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
  }

  .platform-card.connected {
    border-color: #4caf50;
    background: #f1f8f4;
  }

  .platform-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s ease;
  }

  button:hover:not(:disabled) {
    background: #764ba2;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
