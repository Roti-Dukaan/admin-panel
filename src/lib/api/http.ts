import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
});

const getStoredTokens = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('admin-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (state?.accessToken) {
      return {
        accessToken: state.accessToken as string,
        refreshToken: state.refreshToken as string | null,
      };
    }
  } catch {
    // ignore
  }
  return null;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
const refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers.length = 0;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/admin-auth/refresh'
    ) {
      const tokens = getStoredTokens();
      const refreshToken = tokens?.refreshToken;

      if (!refreshToken) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin-auth');
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newAccessToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post('/admin-auth/refresh', { refreshToken });
        const newAccessToken = data.data?.accessToken || data.accessToken;
        const newRefreshToken = data.data?.refreshToken || data.refreshToken;

        const raw = localStorage.getItem('admin-auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.state = {
            ...parsed.state,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
          localStorage.setItem('admin-auth', JSON.stringify(parsed));
        }

        onTokenRefreshed(newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin-auth');
          window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
