/**
 * StudioBot.ai TypeScript SDK
 * Client library for interacting with StudioBot API
 */

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  source_url: string;
  local_path?: string;
  duration?: number;
  status: 'pending' | 'downloading' | 'analyzing' | 'analyzed' | 'failed';
  analysis_data?: string;
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

export interface AuthResponse {
  user: User;
  token: string;
}

export class StudioBotAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000/api', token?: string) {
    this.baseUrl = baseUrl;
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return response.json();
  }

  // Auth Methods
  async register(username: string, email: string, password: string): Promise<User> {
    const res = await this.request<User>('POST', '/auth/register', {
      username,
      email,
      password,
    });
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('POST', '/auth/login', {
      email,
      password,
    });
    if (res.status === 'error') throw new Error(res.message);
    const { token } = res.data!;
    this.setToken(token);
    return res.data!;
  }

  async getProfile(userId: string): Promise<User> {
    const res = await this.request<User>('GET', `/auth/profile/${userId}`);
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  // Video Methods
  async uploadVideo(
    userId: string,
    sourceUrl: string,
    title: string,
    description?: string
  ): Promise<Video> {
    const res = await this.request<Video>('POST', '/videos/upload', {
      user_id: userId,
      source_url: sourceUrl,
      title,
      description,
    });
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async getVideo(videoId: string): Promise<Video> {
    const res = await this.request<Video>('GET', `/videos/${videoId}`);
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async getUserVideos(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Video[]; page: number; limit: number }> {
    const res = await this.request<any>('GET', `/videos/user/${userId}?page=${page}&limit=${limit}`);
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async getVideoAnalysis(videoId: string): Promise<any> {
    const res = await this.request<any>('GET', `/videos/${videoId}/analysis`);
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  // Clip Methods
  async createClip(
    videoId: string,
    userId: string,
    title: string,
    startTime: number,
    endTime: number,
    description?: string
  ): Promise<Clip> {
    const res = await this.request<Clip>('POST', '/clips/create', {
      video_id: videoId,
      user_id: userId,
      title,
      description,
      start_time: startTime,
      end_time: endTime,
    });
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async getClip(clipId: string): Promise<Clip> {
    const res = await this.request<Clip>('GET', `/clips/${clipId}`);
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async getVideoClips(
    videoId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Clip[]; page: number; limit: number }> {
    const res = await this.request<any>(`GET`, `/clips/video/${videoId}?page=${page}&limit=${limit}`);
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async approveClip(clipId: string, approved: boolean, notes?: string): Promise<Clip> {
    const res = await this.request<Clip>('PATCH', `/clips/${clipId}/approve`, {
      approved,
      approval_notes: notes,
    });
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async deleteClip(clipId: string): Promise<void> {
    const res = await this.request<void>('DELETE', `/clips/${clipId}`);
    if (res.status === 'error') throw new Error(res.message);
  }

  // Platform Methods
  async connectPlatform(
    userId: string,
    platformName: string,
    credentials: any
  ): Promise<any> {
    const res = await this.request<any>(`POST`, `/platforms/${platformName}/connect`, {
      user_id: userId,
      credentials,
    });
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async publishContent(
    userId: string,
    platformName: string,
    contentId: string,
    contentType: 'clip' | 'short' | 'video',
    metadata?: any
  ): Promise<any> {
    const res = await this.request<any>(`POST`, `/platforms/${platformName}/publish`, {
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      metadata,
    });
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async getUserPlatforms(userId: string): Promise<any[]> {
    const res = await this.request<any[]>('GET', `/platforms/user/${userId}`);
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }

  async generateThumbnail(sourceId: string, sourceType: 'video' | 'clip' | 'short'): Promise<any> {
    const res = await this.request<any>('POST', '/thumbnails/generate', {
      source_id: sourceId,
      source_type: sourceType,
    });
    if (res.status === 'error') throw new Error(res.message);
    return res.data!;
  }
}

export default StudioBotAPI;
