// User types
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

// Video types
export interface Video {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  source_url: string;
  local_path?: string;
  duration?: number;
  file_size?: number;
  status: 'pending' | 'downloading' | 'analyzing' | 'analyzed' | 'failed';
  analysis_data?: any;
  created_at: string;
  updated_at: string;
}

export interface VideoAnalysis {
  viralMoments: ViralMoment[];
  summary: string;
  estimatedLength: number;
  keyframes: KeyFrame[];
}

export interface ViralMoment {
  startTime: number;
  endTime: number;
  confidence: number;
  description: string;
  tags: string[];
}

export interface KeyFrame {
  timestamp: number;
  description: string;
  thumbnail_url?: string;
}

// Clip types
export interface Clip {
  id: string;
  video_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: number;
  end_time: number;
  duration: number;
  output_path?: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  approved: boolean;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
}

// Shorts types (vertical video)
export interface Short {
  id: string;
  clip_id: string;
  user_id: string;
  title: string;
  description?: string;
  output_path?: string;
  duration?: number;
  resolution: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  approved: boolean;
  created_at: string;
  updated_at: string;
}

// Thumbnail types
export interface Thumbnail {
  id: string;
  source_id: string;
  source_type: 'video' | 'clip' | 'short';
  output_path?: string;
  size: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
}

// Platform types
export type PlatformName = 'youtube' | 'twitch' | 'rumble';

export interface Platform {
  id: string;
  user_id: string;
  platform_name: PlatformName;
  access_token?: string;
  refresh_token?: string;
  channel_id?: string;
  credentials_encrypted?: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlatformConfig {
  name: PlatformName;
  apiUrl: string;
  maxVideoSize: number;
  maxVideoDuration: number;
  supportedFormats: string[];
  requiredCredentials: string[];
}

// Distribution types
export interface Distribution {
  id: string;
  content_id: string;
  content_type: 'clip' | 'short' | 'video';
  platform_name: PlatformName;
  platform_post_id?: string;
  status: 'pending' | 'publishing' | 'published' | 'failed';
  published_at?: string;
  url?: string;
  view_count: number;
  engagement_data?: any;
  created_at: string;
  updated_at: string;
}

// Request/Response types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page: number;
  limit: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
