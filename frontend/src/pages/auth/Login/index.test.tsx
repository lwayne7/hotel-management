import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { message } from 'antd';
import Login from './index';
import { createTestStore, renderWithProviders } from '../../../test/render';

const authApiMock = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../../../services/api', async () => {
  const actual = await vi.importActual<typeof import('../../../services/api')>('../../../services/api');
  return {
    ...actual,
    authApi: authApiMock,
  };
});

describe('Login page', () => {
  beforeEach(() => {
    authApiMock.login.mockReset();
    authApiMock.register.mockReset();
    vi.spyOn(message, 'success').mockImplementation(() => undefined as never);
    vi.spyOn(message, 'error').mockImplementation(() => undefined as never);
  });

  it('navigates merchants to the merchant hotel list after login', async () => {
    authApiMock.login.mockResolvedValue({
      access_token: 'merchant-token',
      user: {
        id: 1,
        username: 'merchant01',
        role: 'merchant',
        nickname: '测试商户',
      },
    });

    const store = createTestStore({
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
      },
      hotel: {
        hotels: [],
        currentHotel: null,
        isLoading: false,
        error: null,
        pagination: { page: 1, pageSize: 10, total: 0 },
      },
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/merchant/hotels" element={<div>merchant dashboard</div>} />
      </Routes>,
      {
        route: '/login',
        store,
      },
    );

    fireEvent.change(screen.getByPlaceholderText('用户名'), {
      target: { value: 'merchant01' },
    });
    fireEvent.change(screen.getByPlaceholderText('密码'), {
      target: { value: 'Test123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));

    await waitFor(() => {
      expect(authApiMock.login).toHaveBeenCalledWith({
        username: 'merchant01',
        password: 'Test123456',
      });
    });
    expect(await screen.findByText('merchant dashboard')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('merchant-token');
  });
});
