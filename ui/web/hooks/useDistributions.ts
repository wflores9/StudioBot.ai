import { useCallback } from 'react';
import { apiClient } from '@/utils/api';
import { ApiResponse, Analytics, Distribution } from '@/types';

const unwrapData = <T,>(value: ApiResponse<T> | T): T => {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as ApiResponse<T>).data;
  }
  return value as T;
};

export default function useDistributions() {
  const listPlatforms = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<Distribution[]> | Distribution[]>(
        '/distributions/platforms'
      );
      const data = unwrapData(res);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      try {
        const res = await apiClient.get<ApiResponse<Distribution[]> | Distribution[]>(
          '/platforms'
        );
        const data = unwrapData(res);
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    }
  }, []);

  const publish = useCallback(async (payload: any) => {
    const res = await apiClient.post('/distributions/publish', payload);
    return res;
  }, []);

  const getAnalytics = useCallback(async () => {
    try {
      const res = await apiClient.get<ApiResponse<Analytics[]> | Analytics[]>(
        '/distributions/analytics'
      );
      const data = unwrapData(res);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }, []);

  const listDistributions = useCallback(async () => {
    const res = await apiClient.get<ApiResponse<Distribution[]> | Distribution[]>(
      '/distributions'
    );
    const data = unwrapData(res);
    return Array.isArray(data) ? data : [];
  }, []);

  return { listPlatforms, publish, getAnalytics, listDistributions };
}
