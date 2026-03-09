import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { login, clearError, logout } from '../../../store/slices/authSlice';
import type { AuthResponse } from '../../../services/api';
import './auth.css';

const { Title, Text } = Typography;

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
}

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();

  const locationState = (location.state as LoginLocationState | null) ?? null;
  const from = locationState?.from?.pathname || '/';

  React.useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onFinish = async (values: { username: string; password: string }) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      const payload = result.payload as AuthResponse;
      const user = payload.user;
      // 管理端只面向商户 / 管理员，普通用户统一引导去移动端
      if (user.role !== 'merchant' && user.role !== 'admin') {
        message.error('此后台仅面向商户和管理员，请使用移动端小程序体验普通用户功能');
        dispatch(logout());
        return;
      }

      message.success('登录成功');

      // 根据角色跳转
      if (user.role === 'merchant') {
        navigate('/merchant/hotels');
      } else if (user.role === 'admin') {
        navigate('/admin/review');
      } else {
        navigate(from);
      }
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <div className="auth-brand-icon">🏨</div>
          </div>
          <Title level={2}>易宿酒店管理</Title>
          <div className="auth-divider" />
          <Text type="secondary">欢迎回来，请登录您的账户</Text>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              登录
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Text type="secondary">
              本管理后台仅供 <strong>商户 / 管理员</strong> 使用；普通用户请通过移动端小程序进行预订与查看订单。
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
