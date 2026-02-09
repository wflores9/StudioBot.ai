import { create } from 'zustand';
import { ApiResponse, AuthPayload, User } from '@/types';
import { apiClient } from '@/utils/api';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  getMe: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<User>>('/auth/register', {
        username,
        email,
        password,
      });

      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<ApiResponse<AuthPayload>>('/auth/login', {
        email,
        password,
      });

      if (response.data?.token) {
        apiClient.setToken(response.data.token);
      }

      set({
        user: response.data?.user || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  getMe: async () => {
    try {
      const currentUser = get().user;
      if (!currentUser?.id) {
        set({
          isAuthenticated: false,
          user: null,
        });
        return;
      }

      const response = await apiClient.get<ApiResponse<User>>(
        `/auth/profile/${currentUser.id}`
      );
      set({
        user: response.data,
        isAuthenticated: true,
      });
    } catch (error: any) {
      set({
        isAuthenticated: false,
        user: null,
      });
    }
  },

  logout: () => {
    apiClient.clearAuth();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
