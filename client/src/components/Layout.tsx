import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Upload, Video, Scissors, Film, Share2, BarChart3,
  LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  user: any;
  onLogout: () => void;
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Video' },
    { path: '/videos', icon: Video, label: 'Videos' },
    { path: '/clips', icon: Scissors, label: 'Clips' },
    { path: '/shorts', icon: Film, label: 'Shorts' },
    { path: '/platforms', icon: Share2, label: 'Platforms' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            {/* Replace with your actual logo */}
            <img
              src="/image (1).jpg"
              alt="StudioBot.ai"
              className="logo-image"
              onError={(e) => {
                // Fallback to text if image fails to load
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = 'none';
                const next = img.nextElementSibling as HTMLElement | null;
                if (next) next.style.display = 'block';
              }}
            />
            <span className="logo-text" style={{ display: 'none' }}>
              🎬 StudioBot.ai
            </span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <div className="user-name">{user?.username || 'User'}</div>
                <div className="user-email">{user?.email || ''}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
