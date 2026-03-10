import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== JWT 静默刷新 + 并发竞态保护 ==========
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
}

function clearAuthAndRedirect() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// 响应拦截器：处理错误、JWT 静默刷新，返回 data
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl: string = originalRequest?.url || '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    // 非 401 或认证相关请求：直接拒绝
    if (status !== 401 || isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 已有刷新在进行中：将请求加入等待队列
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      processQueue(error, null);
      isRefreshing = false;
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      // 静默刷新 token
      const { access_token, refresh_token } = await authApi.refreshToken(storedRefreshToken);
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);

      // 通知队列中的所有等待请求
      processQueue(null, access_token);

      // 用新 token 重试原始请求
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// 认证相关 API
export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  role: 'merchant' | 'customer';
  nickname?: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    role: 'merchant' | 'admin' | 'customer';
    nickname?: string;
    phone?: string;
  };
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  login: (params: LoginParams): Promise<AuthResponse> => api.post('/auth/login', params),
  register: (params: RegisterParams): Promise<AuthResponse> => api.post('/auth/register', params),
  refreshToken: (refreshToken: string): Promise<{ access_token: string; refresh_token: string }> =>
    api.post('/auth/refresh', { refreshToken }),
};

// 酒店类型 - 使用共享类型
import type { Hotel, HotelStatus } from '../types/hotel';
export type { Hotel };

/** 酒店列表查询参数 */
export interface HotelListParams {
  page?: number;
  pageSize?: number;
  status?: HotelStatus;
  keyword?: string;
}

/** 酒店列表响应 */
export interface HotelListResult {
  data: Hotel[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

// 酒店相关 API（响应拦截器已解包为 response.data，故返回类型为数据本身）
export const hotelApi = {
  getMyHotels: (params?: HotelListParams): Promise<HotelListResult> =>
    api.get('/hotels/my', { params }),
  getHotelById: (id: number): Promise<Hotel> => api.get(`/hotels/${id}`),
  createHotel: (data: Partial<Hotel>): Promise<Hotel> => api.post('/hotels', data),
  updateHotel: (id: number, data: Partial<Hotel>): Promise<Hotel> => api.patch(`/hotels/${id}`, data),
  deleteHotel: (id: number): Promise<void> => api.delete(`/hotels/${id}`),
  submitForReview: (id: number): Promise<Hotel> => api.post(`/hotels/${id}/submit`),
  getMerchantStatistics: (): Promise<{ total: number; pending: number; approved: number; rejected: number; draft: number }> =>
    api.get('/hotels/statistics'),

  getPendingHotels: (params?: HotelListParams): Promise<HotelListResult> =>
    api.get('/admin/hotels', { params }),
  approveHotel: (id: number): Promise<Hotel> => api.post(`/admin/hotels/${id}/approve`),
  rejectHotel: (id: number, reason: string): Promise<Hotel> =>
    api.post(`/admin/hotels/${id}/reject`, { reason }),
  offlineHotel: (id: number): Promise<Hotel> => api.post(`/admin/hotels/${id}/offline`),
  onlineHotel: (id: number): Promise<Hotel> => api.post(`/admin/hotels/${id}/online`),
  getAdminStatistics: (): Promise<{ total: number; pending: number; approved: number; rejected: number; offline: number }> =>
    api.get('/admin/statistics'),
};

// 通知相关
export interface NotificationItem {
  id: number;
  type: string;
  hotelId: number;
  hotelName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getUnread: (): Promise<NotificationItem[]> => api.get('/notifications/mine'),
  markAllRead: (): Promise<{ success: boolean }> => api.patch('/notifications/read-all'),
};

export default api;
