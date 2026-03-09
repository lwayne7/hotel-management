import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, { logout, clearError, login, register } from './authSlice';

// Mock the api module
vi.mock('../../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock('../../utils/error', () => ({
  getApiErrorMessage: (_err: unknown, fallback: string) => fallback,
}));

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const emptyState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  };

  it('should return the initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('logout', () => {
    it('should clear user, token, and error', () => {
      const stateWithUser = {
        user: { id: 1, username: 'test', role: 'merchant' as const },
        token: 'some_token',
        isLoading: false,
        error: 'some error',
      };
      const state = authReducer(stateWithUser, logout());
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should remove token/user from localStorage', () => {
      localStorage.setItem('token', 'test');
      localStorage.setItem('user', '{}');
      authReducer(emptyState, logout());
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear only the error', () => {
      const stateWithError = { ...emptyState, error: 'some error' };
      const state = authReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('login async thunk', () => {
    it('login.pending should set isLoading true', () => {
      const state = authReducer(emptyState, { type: login.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('login.fulfilled should set user and token', () => {
      const payload = {
        user: { id: 1, username: 'test', role: 'merchant' as const },
        access_token: 'jwt_token_123',
      };
      const state = authReducer(emptyState, {
        type: login.fulfilled.type,
        payload,
      });
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe('jwt_token_123');
    });

    it('login.rejected should set error', () => {
      const state = authReducer(emptyState, {
        type: login.rejected.type,
        payload: '用户名或密码错误',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('用户名或密码错误');
    });
  });

  describe('register async thunk', () => {
    it('register.pending should set isLoading true', () => {
      const state = authReducer(emptyState, { type: register.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('register.fulfilled should set user and token', () => {
      const payload = {
        user: { id: 2, username: 'newuser', role: 'merchant' as const },
        access_token: 'new_jwt_token',
      };
      const state = authReducer(emptyState, {
        type: register.fulfilled.type,
        payload,
      });
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe('new_jwt_token');
    });

    it('register.rejected should set error', () => {
      const state = authReducer(emptyState, {
        type: register.rejected.type,
        payload: '用户名已存在',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('用户名已存在');
    });
  });
});
