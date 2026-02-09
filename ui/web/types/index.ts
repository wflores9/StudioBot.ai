export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_path: string;
  duration: number;
  width: number;
  height: number;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Clip {
  id: string;
  video_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: number;
  end_time: number;
  duration: number;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Short {
  id: string;
  clip_id: string;
  user_id: string;
  title: string;
  description?: string;
  duration: number;
  resolution: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface Thumbnail {
  id: string;
  source_id: string;
  source_type: 'video' | 'clip' | 'short';
  size: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  output_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Distribution {
  id: string;
  content_id: string;
  content_type: string;
  platform_name: string;
  status: string;
  view_count?: number;
  engagement_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  platform: string;
  views: number;
  engagement: number;
  engagementRate: number;
  contentCount: number;
}

export interface AuthResponse {
  status: string;
  data: AuthPayload;
  message: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  error?: string;
}
