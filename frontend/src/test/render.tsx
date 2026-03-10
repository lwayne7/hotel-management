import type { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import authReducer from '../store/slices/authSlice';
import hotelReducer from '../store/slices/hotelSlice';

const reducerMap = {
  auth: authReducer,
  hotel: hotelReducer,
};

const rootReducer = combineReducers(reducerMap);

export function createTestStore(preloadedState?: Record<string, unknown>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    preloadedState: preloadedState as never,
  });
}

interface RenderOptions {
  route?: string;
  store?: ReturnType<typeof createTestStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
) {
  const { route = '/', store = createTestStore() } = options;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </Provider>
      </QueryClientProvider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
}
