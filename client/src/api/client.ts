import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  getProfile: (token: string) =>
    api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Video API
export const videoAPI = {
  uploadFile: (formData: FormData) =>
    api.post('/videos/upload-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadURL: (userId: string, url: string, title: string, description?: string) =>
    api.post('/videos/upload', { user_id: userId, source_url: url, title, description }),

  getVideo: (videoId: string) =>
    api.get(`/videos/${videoId}`),

  getUserVideos: (userId: string, page = 1, limit = 20) =>
    api.get(`/videos/user/${userId}`, { params: { page, limit } }),

  getAnalysis: (videoId: string) =>
    api.get(`/videos/${videoId}/analysis`),

  analyzeAI: (videoId: string, credentials: any) =>
    api.post(`/videos/${videoId}/analyze-ai`, credentials),

  getViralityScore: (videoId: string) =>
    api.get(`/videos/${videoId}/virality-score`),

  getRecommendations: (videoId: string) =>
    api.get(`/videos/${videoId}/recommendations`),

  deleteVideo: (videoId: string) =>
    api.delete(`/videos/${videoId}`),
};

// Clip API
export const clipAPI = {
  createClip: (data: {
    video_id: string;
    user_id: string;
    title: string;
    description?: string;
    start_time: number;
    end_time: number;
  }) => api.post('/clips/create', data),

  getClip: (clipId: string) =>
    api.get(`/clips/${clipId}`),

  getUserClips: (userId: string, page = 1, limit = 20) =>
    api.get(`/clips/user/${userId}`, { params: { page, limit } }),

  approveClip: (clipId: string, approved: boolean, notes?: string) =>
    api.patch(`/clips/${clipId}/approve`, { approved, approval_notes: notes }),

  deleteClip: (clipId: string) =>
    api.delete(`/clips/${clipId}`),
};

// Short API
export const shortAPI = {
  createFromClip: (clipId: string, userId: string, title: string, description?: string) =>
    api.post('/shorts/create', {
      clip_id: clipId,
      user_id: userId,
      title,
      description,
    }),

  getShort: (shortId: string) =>
    api.get(`/shorts/${shortId}`),

  getUserShorts: (userId: string, page = 1, limit = 20) =>
    api.get(`/shorts/user/${userId}`, { params: { page, limit } }),

  approveShort: (shortId: string, approved: boolean) =>
    api.patch(`/shorts/${shortId}/approve`, { approved }),

  deleteShort: (shortId: string) =>
    api.delete(`/shorts/${shortId}`),
};

// Thumbnail API
export const thumbnailAPI = {
  generate: (sourceId: string, sourceType: 'video' | 'clip' | 'short', timestamp?: number) =>
    api.post('/thumbnails/generate', { source_id: sourceId, source_type: sourceType, timestamp }),

  getThumbnail: (thumbnailId: string) =>
    api.get(`/thumbnails/${thumbnailId}`),

  download: (thumbnailId: string) =>
    api.get(`/thumbnails/${thumbnailId}/download`, { responseType: 'blob' }),

  deleteThumbnail: (thumbnailId: string) =>
    api.delete(`/thumbnails/${thumbnailId}`),
};

// Platform API
export const platformAPI = {
  connect: (userId: string, platform: string, credentials: any) =>
    api.post(`/platforms/${platform}/connect`, { user_id: userId, credentials }),

  getUserPlatforms: (userId: string) =>
    api.get(`/platforms/user/${userId}`),

  publish: (userId: string, platform: string, contentId: string, contentType: string, metadata: any) =>
    api.post(`/platforms/${platform}/publish`, {
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      metadata,
    }),

  getDistributions: (contentId: string) =>
    api.get(`/platforms/distributions/${contentId}`),

  getAnalytics: (userId: string, platform: string) =>
    api.get(`/platforms/${platform}/analytics/${userId}`),

  disconnect: (platformId: string) =>
    api.delete(`/platforms/${platformId}`),
};

export default api;
