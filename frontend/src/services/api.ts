import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

// 酒店类型
export interface Hotel {
  id: number;
  nameCn: string;
  nameEn?: string;
  address: string;
  starRating: number;
  openingDate?: string;
  description?: string;
  facilities?: string[];
  nearbyAttractions?: string[];
  transportation?: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'offline';
  rejectReason?: string;
  roomTypes?: any[];
  images?: any[];
}

// 酒店相关 API
export const hotelApi = {
  // 商户端
  getMyHotels: (params?: { page?: number; status?: string }): Promise<{ data: Hotel[]; page: number; pageSize: number; total: number }> =>
    api.get('/hotels/my', { params }),
  getHotelById: (id: number): Promise<Hotel> => api.get(`/hotels/${id}`),
  createHotel: (data: any): Promise<Hotel> => api.post('/hotels', data),
  updateHotel: (id: number, data: any): Promise<Hotel> => api.patch(`/hotels/${id}`, data),
  deleteHotel: (id: number): Promise<void> => api.delete(`/hotels/${id}`),
  submitForReview: (id: number): Promise<Hotel> => api.post(`/hotels/${id}/submit`),

  // 管理员端
  getPendingHotels: (params?: { page?: number; status?: string }): Promise<{ data: Hotel[]; page: number; pageSize: number; total: number }> =>
    api.get('/admin/hotels', { params }),
  approveHotel: (id: number): Promise<Hotel> => api.post(`/admin/hotels/${id}/approve`),
  rejectHotel: (id: number, reason: string): Promise<Hotel> =>
    api.post(`/admin/hotels/${id}/reject`, { reason }),
  offlineHotel: (id: number): Promise<Hotel> => api.post(`/admin/hotels/${id}/offline`),
  onlineHotel: (id: number): Promise<Hotel> => api.post(`/admin/hotels/${id}/online`),
};

// 上传相关 API
export const uploadApi = {
  getOssSignature: () => api.get('/upload/signature'),
};

export default api;
