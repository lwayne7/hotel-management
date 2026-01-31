import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/Layout';
import AuthRoute from '../components/AuthRoute';

// 页面懒加载
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Home = lazy(() => import('../pages/Home'));
const MerchantHotels = lazy(() => import('../pages/merchant/HotelList'));
const HotelForm = lazy(() => import('../pages/merchant/HotelForm'));
const AdminReview = lazy(() => import('../pages/admin/ReviewList'));
const Forbidden = lazy(() => import('../pages/error/403'));
const NotFound = lazy(() => import('../pages/error/404'));

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyLoad>
        <Login />
      </LazyLoad>
    ),
  },
  {
    path: '/register',
    element: (
      <LazyLoad>
        <Register />
      </LazyLoad>
    ),
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
        element: (
          <LazyLoad>
            <Home />
          </LazyLoad>
        ),
      },
      // 商户端路由
      {
        path: 'merchant/hotels',
        element: (
          <AuthRoute roles={['merchant']}>
            <LazyLoad>
              <MerchantHotels />
            </LazyLoad>
          </AuthRoute>
        ),
      },
      {
        path: 'merchant/hotels/create',
        element: (
          <AuthRoute roles={['merchant']}>
            <LazyLoad>
              <HotelForm />
            </LazyLoad>
          </AuthRoute>
        ),
      },
      {
        path: 'merchant/hotels/:id/edit',
        element: (
          <AuthRoute roles={['merchant']}>
            <LazyLoad>
              <HotelForm />
            </LazyLoad>
          </AuthRoute>
        ),
      },
      // 管理员端路由
      {
        path: 'admin/review',
        element: (
          <AuthRoute roles={['admin']}>
            <LazyLoad>
              <AdminReview />
            </LazyLoad>
          </AuthRoute>
        ),
      },
    ],
  },
  {
    path: '/403',
    element: (
      <LazyLoad>
        <Forbidden />
      </LazyLoad>
    ),
  },
  {
    path: '*',
    element: (
      <LazyLoad>
        <NotFound />
      </LazyLoad>
    ),
  },
]);

export default router;
