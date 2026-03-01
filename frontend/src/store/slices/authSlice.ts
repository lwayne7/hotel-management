import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, type LoginParams, type RegisterParams, type AuthResponse } from '../../services/api';
import { getApiErrorMessage } from '../../utils/error';

export type UserRole = 'merchant' | 'admin';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  nickname?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

function parseStoredUser(): User | null {
  const raw = sessionStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: parseStoredUser(),
  token: sessionStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<AuthResponse, LoginParams, { rejectValue: string }>(
  'auth/login',
  async (params, { rejectWithValue }) => {
    try {
      const response = await authApi.login(params);
      sessionStorage.setItem('token', response.access_token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, '登录失败'));
    }
  },
);

export const register = createAsyncThunk<AuthResponse, RegisterParams, { rejectValue: string }>(
  'auth/register',
  async (params, { rejectWithValue }) => {
    try {
      const response = await authApi.register(params);
      sessionStorage.setItem('token', response.access_token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, '注册失败'));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? '登录失败';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? '注册失败';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
