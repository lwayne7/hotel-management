import { describe, expect, it } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import AuthRoute from './index';
import { createTestStore, renderWithProviders } from '../../test/render';

describe('AuthRoute', () => {
  it('redirects unauthenticated users to /login', async () => {
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

    const { findByText } = renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route
          path="/merchant/hotels"
          element={(
            <AuthRoute roles={['merchant']}>
              <div>merchant dashboard</div>
            </AuthRoute>
          )}
        />
      </Routes>,
      {
        route: '/merchant/hotels',
        store,
      },
    );

    expect(await findByText('login page')).toBeInTheDocument();
  });

  it('redirects authenticated users without the required role to /403', async () => {
    const store = createTestStore({
      auth: {
        user: { id: 1, username: 'admin01', role: 'admin' },
        token: 'token',
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

    const { findByText } = renderWithProviders(
      <Routes>
        <Route path="/403" element={<div>forbidden page</div>} />
        <Route
          path="/merchant/hotels"
          element={(
            <AuthRoute roles={['merchant']}>
              <div>merchant dashboard</div>
            </AuthRoute>
          )}
        />
      </Routes>,
      {
        route: '/merchant/hotels',
        store,
      },
    );

    expect(await findByText('forbidden page')).toBeInTheDocument();
  });
});
