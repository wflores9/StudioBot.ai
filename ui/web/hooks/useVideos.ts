import { useCallback } from 'react';
import { apiClient } from '@/utils/api';
import { ApiResponse, Video } from '@/types';

const unwrapData = <T,>(value: ApiResponse<T> | T): T => {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as ApiResponse<T>).data;
  }
  return value as T;
};

export default function useVideos() {
  const listVideos = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<Video[]> | Video[]>('/videos');
      const data = unwrapData(res);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      try {
        const res = await apiClient.get<ApiResponse<Video[]> | Video[]>('/videos/user/me');
        const data = unwrapData(res);
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    }
  }, []);

  return { listVideos };
}
