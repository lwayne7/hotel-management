import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

// 响应拦截器：处理错误，返回 data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string = error.config?.url || '';
    const isLoginOrRegister =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    // 登录/注册失败时不要强制跳转，否则看不到错误提示
    if (status === 401 && !isLoginOrRegister) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
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
  role: 'merchant' | 'admin';
  nickname?: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    role: 'merchant' | 'admin';
    nickname?: string;
    phone?: string;
  };
  access_token: string;
}

export const authApi = {
  login: (params: LoginParams): Promise<AuthResponse> => api.post('/auth/login', params),
  register: (params: RegisterParams): Promise<AuthResponse> => api.post('/auth/register', params),
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

export default api;
