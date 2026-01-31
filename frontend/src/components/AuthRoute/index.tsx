import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import type { UserRole } from '../../store/slices/authSlice';

interface AuthRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, roles }) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 未登录，跳转到登录页
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 角色权限检查
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default AuthRoute;
