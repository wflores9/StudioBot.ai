import { useState } from 'react';
import { Share2, Check, X, Settings, Youtube, Instagram, Facebook, Twitter, Music, Link2 } from 'lucide-react';
import './PlatformManager.css';

interface Platform {
  id: string;
  name: string;
  icon: any;
  connected: boolean;
  username?: string;
  followers?: number;
  lastSync?: string;
  color: string;
}

export default function PlatformManager() {
  const [platforms, setPlatforms] = useState<Platform[]>([
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      connected: true,
      username: '@studiobot',
      followers: 15420,
      lastSync: '2024-02-08T10:30:00Z',
      color: '#FF0000'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Music,
      connected: true,
      username: '@studiobot_ai',
      followers: 8932,
      lastSync: '2024-02-08T09:15:00Z',
      color: '#000000'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      connected: false,
      color: '#E4405F'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      connected: false,
      color: '#1877F2'
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: Twitter,
      connected: false,
      color: '#1DA1F2'
    }
  ]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} hours ago`;
    } else {
      return `${Math.floor(diffMins / 1440)} days ago`;
    }
  };

  const handleConnect = (platformId: string) => {
    alert(`Connecting to ${platformId}... (OAuth flow would go here)`);
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms(platforms.map(p =>
      p.id === platformId ? { ...p, connected: false, username: undefined, followers: undefined, lastSync: undefined } : p
    ));
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <Share2 size={32} />
          Platform Manager
        </h1>
        <div className="connection-summary">
          <span className="connected-count">{connectedCount}</span> / {platforms.length} connected
        </div>
      </div>

      {/* Stats */}
      <div className="platform-stats">
        <div className="stat-card">
          <Link2 size={24} />
          <div>
            <div className="stat-number">{connectedCount}</div>
            <div className="stat-label">Connected Platforms</div>
          </div>
        </div>
        <div className="stat-card">
          <Share2 size={24} />
          <div>
            <div className="stat-number">
              {platforms.filter(p => p.connected).reduce((sum, p) => sum + (p.followers || 0), 0) > 0
                ? formatNumber(platforms.filter(p => p.connected).reduce((sum, p) => sum + (p.followers || 0), 0))
                : '0'}
            </div>
            <div className="stat-label">Total Reach</div>
          </div>
        </div>
      </div>

      {/* Platforms Grid */}
      <div className="platforms-grid">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.id} className={`platform-card ${platform.connected ? 'connected' : ''}`}>
              <div className="platform-header">
                <div className="platform-icon" style={{ backgroundColor: platform.color }}>
                  <Icon size={32} color="white" />
                </div>
                <div className="platform-info">
                  <h3 className="platform-name">{platform.name}</h3>
                  {platform.connected && platform.username && (
                    <div className="platform-username">{platform.username}</div>
                  )}
                </div>
                <div className={`connection-status ${platform.connected ? 'status-connected' : 'status-disconnected'}`}>
                  {platform.connected ? <Check size={20} /> : <X size={20} />}
                </div>
              </div>

              {platform.connected ? (
                <>
                  <div className="platform-metrics">
                    {platform.followers && (
                      <div className="metric">
                        <span className="metric-label">Followers</span>
                        <span className="metric-value">{formatNumber(platform.followers)}</span>
                      </div>
                    )}
                    {platform.lastSync && (
                      <div className="metric">
                        <span className="metric-label">Last Synced</span>
                        <span className="metric-value">{formatDate(platform.lastSync)}</span>
                      </div>
                    )}
                  </div>

                  <div className="platform-actions">
                    <button className="btn-secondary btn-full">
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      className="btn-danger-outline btn-full"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      <X size={16} />
                      Disconnect
                    </button>
                  </div>
                </>
              ) : (
                <div className="platform-actions">
                  <button
                    className="btn-primary btn-full"
                    onClick={() => handleConnect(platform.id)}
                  >
                    <Link2 size={16} />
                    Connect {platform.name}
                  </button>
                  <p className="connect-description">
                    Connect your {platform.name} account to publish shorts directly
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Publishing Features */}
      <div className="features-section">
        <h2>Publishing Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h4>Auto-Publishing</h4>
            <p>Schedule and automatically publish shorts to connected platforms</p>
          </div>
          <div className="feature-card">
            <h4>Cross-Platform</h4>
            <p>Publish the same short to multiple platforms simultaneously</p>
          </div>
          <div className="feature-card">
            <h4>Analytics Sync</h4>
            <p>Track performance metrics across all connected platforms</p>
          </div>
          <div className="feature-card">
            <h4>Custom Captions</h4>
            <p>Customize titles and descriptions for each platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
