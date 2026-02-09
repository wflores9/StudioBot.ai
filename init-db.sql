-- StudioBot Platform Database Schema for PostgreSQL
-- This schema supports the complete video analysis and distribution platform
-- This script runs automatically in the studiobot_db database created by POSTGRES_DB

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(255),
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    duration INTEGER,
    file_path TEXT,
    thumbnail_path TEXT,
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clips table (extracted from videos)
CREATE TABLE IF NOT EXISTS clips (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    start_time INTEGER,
    end_time INTEGER,
    duration INTEGER,
    file_path TEXT,
    thumbnail_path TEXT,
    file_size BIGINT,
    is_viral BOOLEAN DEFAULT FALSE,
    viral_score FLOAT DEFAULT 0,
    viral_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create shorts table (vertical format clips)
CREATE TABLE IF NOT EXISTS shorts (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    start_time INTEGER,
    end_time INTEGER,
    duration INTEGER,
    file_path TEXT,
    thumbnail_path TEXT,
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create thumbnails table
CREATE TABLE IF NOT EXISTS thumbnails (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    clip_id INTEGER REFERENCES clips(id) ON DELETE CASCADE,
    title VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create platform credentials table for third-party integrations
CREATE TABLE IF NOT EXISTS studiobot_platform_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL,
    credential_type VARCHAR(50),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    channel_id VARCHAR(255),
    channel_name VARCHAR(255),
    channel_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform)
);

-- Create distributions table for tracking multi-platform publishing
CREATE TABLE IF NOT EXISTS distributions (
    id SERIAL PRIMARY KEY,
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    clip_id INTEGER REFERENCES clips(id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    distributed_url TEXT,
    distributed_id VARCHAR(255),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    distributed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for query performance
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_created_at ON videos(created_at);
CREATE INDEX idx_clips_video_id ON clips(video_id);
CREATE INDEX idx_clips_is_viral ON clips(is_viral);
CREATE INDEX idx_clips_created_at ON clips(created_at);
CREATE INDEX idx_shorts_video_id ON shorts(video_id);
CREATE INDEX idx_thumbnails_video_id ON thumbnails(video_id);
CREATE INDEX idx_thumbnails_clip_id ON thumbnails(clip_id);
CREATE INDEX idx_platform_credentials_user_id ON studiobot_platform_credentials(user_id);
CREATE INDEX idx_platform_credentials_platform ON studiobot_platform_credentials(platform);
CREATE INDEX idx_distributions_video_id ON distributions(video_id);
CREATE INDEX idx_distributions_clip_id ON distributions(clip_id);
CREATE INDEX idx_distributions_platform ON distributions(platform);
CREATE INDEX idx_distributions_status ON distributions(status);

-- Grant permissions to studiobot user
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO studiobot;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO studiobot;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO studiobot;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO studiobot;
