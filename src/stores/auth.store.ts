import { create } from 'zustand';
import { AdminUserDto } from '@/types/auth.types';
import { tokenStorage } from '@/lib/auth/token-storage';

interface AuthState {
  user: AdminUserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AdminUserDto, accessToken: string, refreshToken: string) => void;
  updateUser: (user: AdminUserDto) => void;
  clearAuth: () => void;
  initialize: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: tokenStorage.getUser(),
  isAuthenticated: !!tokenStorage.getAccessToken(),
  isLoading: false,

  setAuth: (user, accessToken, refreshToken) => {
    tokenStorage.setTokens(accessToken, refreshToken, user);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  updateUser: (user) => {
    tokenStorage.setUser(user);
    set({ user });
  },

  clearAuth: () => {
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    const user = tokenStorage.getUser();
    const token = tokenStorage.getAccessToken();
    set({
      user,
      isAuthenticated: !!(token && user && user.role === 'ADMIN'),
      isLoading: false,
    });
  },

  checkAuth: () => {
    get().initialize();
  },
}));
