import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { Spin } from 'antd';
import MainLayout from '../components/Layout';
import AuthRoute from '../components/AuthRoute';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Home = lazy(() => import('../pages/Home'));
const MerchantHotels = lazy(() => import('../pages/merchant/HotelList'));
const HotelForm = lazy(() => import('../pages/merchant/HotelForm'));
const AdminReview = lazy(() => import('../pages/admin/ReviewList'));
const Forbidden = lazy(() => import('../pages/error/403'));
const NotFound = lazy(() => import('../pages/error/404'));

const suspenseFallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <Spin size="large" />
  </div>
);

const withSuspense = (children: ReactNode) => (
  <Suspense fallback={suspenseFallback}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<Login />),
  },
  {
    path: '/register',
    element: withSuspense(<Register />),
  },
  {
    path: '/',
    element: (
      <AuthRoute>
        <MainLayout />
      </AuthRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(<Home />),
      },
      {
        path: 'merchant/hotels',
        element: (
          <AuthRoute roles={['merchant']}>
            {withSuspense(<MerchantHotels />)}
          </AuthRoute>
        ),
      },
      {
        path: 'merchant/hotels/create',
        element: (
          <AuthRoute roles={['merchant']}>
            {withSuspense(<HotelForm />)}
          </AuthRoute>
        ),
      },
      {
        path: 'merchant/hotels/:id/edit',
        element: (
          <AuthRoute roles={['merchant']}>
            {withSuspense(<HotelForm />)}
          </AuthRoute>
        ),
      },
      {
        path: 'admin/review',
        element: (
          <AuthRoute roles={['admin']}>
            {withSuspense(<AdminReview />)}
          </AuthRoute>
        ),
      },
    ],
  },
  {
    path: '/403',
    element: withSuspense(<Forbidden />),
  },
  {
    path: '*',
    element: withSuspense(<NotFound />),
  },
]);

export default router;
