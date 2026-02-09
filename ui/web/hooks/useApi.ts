import { useState, useCallback } from 'react';
import { apiClient } from '@/utils/api';
import { Video, Clip, Short, Thumbnail, Distribution } from '@/types';

export function useVideo() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = useCallback(
    async (file: File, title: string, description?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        if (description) formData.append('description', description);

        const response = await apiClient.post<Video>('/videos/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setVideos((prev) => [...prev, response]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Upload failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchUserVideos = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ data: Video[] }>(`/videos/user/${userId}`);
      setVideos(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVideo = useCallback(async (videoId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Video>(`/videos/${videoId}`);
      return response;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch video');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeVideo = useCallback(async (videoId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/videos/${videoId}/analyze-ai`, {});
      return response;
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    videos,
    isLoading,
    error,
    uploadVideo,
    fetchUserVideos,
    getVideo,
    analyzeVideo,
  };
}

export function useClips() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClip = useCallback(
    async (videoId: string, userId: string, title: string, startTime: number, endTime: number, description?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<Clip>('/clips/create', {
          video_id: videoId,
          user_id: userId,
          title,
          description,
          start_time: startTime,
          end_time: endTime,
        });
        setClips((prev) => [...prev, response]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to create clip');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchUserClips = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ data: Clip[] }>(`/clips/user/${userId}`);
      setClips(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    clips,
    isLoading,
    error,
    createClip,
    fetchUserClips,
  };
}

export function useShorts() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShort = useCallback(
    async (clipId: string, userId: string, title: string, description?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<Short>('/shorts/create', {
          clip_id: clipId,
          user_id: userId,
          title,
          description,
        });
        setShorts((prev) => [...prev, response]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to create short');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchUserShorts = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ data: Short[] }>(`/shorts/user/${userId}`);
      setShorts(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shorts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    shorts,
    isLoading,
    error,
    createShort,
    fetchUserShorts,
  };
}

export function useThumbnails() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateThumbnail = useCallback(
    async (sourceId: string, sourceType: 'video' | 'clip' | 'short') => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<Thumbnail>('/thumbnails/generate', {
          source_id: sourceId,
          source_type: sourceType,
        });
        setThumbnails((prev) => [...prev, response]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to generate thumbnail');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchUserThumbnails = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Thumbnail[]>(`/thumbnails/user/${userId}`);
      setThumbnails(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch thumbnails');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    thumbnails,
    isLoading,
    error,
    generateThumbnail,
    fetchUserThumbnails,
  };
}

export function useDistributions() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publishContent = useCallback(
    async (contentId: string, contentType: string, platforms: string[]) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post('/distributions/publish', {
          contentId,
          contentType,
          platformNames: platforms,
        });
        return response;
      } catch (err: any) {
        setError(err.message || 'Publication failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchDistributions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ count: number; data: Distribution[] }>('/distributions');
      setDistributions(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch distributions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    distributions,
    isLoading,
    error,
    publishContent,
    fetchDistributions,
  };
}
