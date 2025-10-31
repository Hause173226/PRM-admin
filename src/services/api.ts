import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Cấu hình base URL từ environment variable hoặc mặc định
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Tạo instance axios
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Biến để tránh race condition khi refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - xử lý lỗi và refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu request đến endpoint refresh-token bị 401, logout ngay
      if (originalRequest.url?.includes('/api/auth/refresh-token')) {
        console.error('Refresh token expired or invalid');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Nếu đang refresh, thêm request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('Attempting to refresh token...');

        // Gọi API refresh token
        const response = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        console.log('Refresh token response:', response.data);

        // Xử lý nhiều format response khác nhau
        let accessToken: string;
        let newRefreshToken: string;

        // Format 1: { accessToken, refreshToken }
        if (response.data.accessToken && response.data.refreshToken) {
          accessToken = response.data.accessToken;
          newRefreshToken = response.data.refreshToken;
        }
        // Format 2: { data: { accessToken, refreshToken } }
        else if (response.data.data?.accessToken && response.data.data?.refreshToken) {
          accessToken = response.data.data.accessToken;
          newRefreshToken = response.data.data.refreshToken;
        }
        // Format 3: { tokens: { accessToken, refreshToken } }
        else if (response.data.tokens?.accessToken && response.data.tokens?.refreshToken) {
          accessToken = response.data.tokens.accessToken;
          newRefreshToken = response.data.tokens.refreshToken;
        }
        else {
          throw new Error('Invalid response format from refresh token API');
        }

        // Lưu token mới
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        console.log('Token refreshed successfully');

        // Process queue
        processQueue(null, accessToken);

        // Retry request với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError: any) {
        // Nếu refresh token thất bại
        console.error('Failed to refresh token:', refreshError);
        
        processQueue(refreshError, null);
        
        // Xóa token và redirect về login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        isRefreshing = false;
        
        // Chỉ redirect nếu chưa ở trang login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

