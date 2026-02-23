import React from 'react';
import { Form, Input, Button, Card, message, Typography, Radio } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { register, clearError } from '../../../store/slices/authSlice';
import type { UserRole } from '../../../store/slices/authSlice';
import type { AuthResponse, RegisterParams } from '../../../services/api';
import '../Login/auth.css';

const { Title, Text } = Typography;

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  nickname?: string;
  phone?: string;
}

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onFinish = async (values: RegisterFormValues) => {
    const registerData: RegisterParams = {
      username: values.username,
      password: values.password,
      role: values.role,
      nickname: values.nickname,
      phone: values.phone,
    };
    const result = await dispatch(register(registerData));
    if (register.fulfilled.match(result)) {
      message.success('注册成功');
      const payload = result.payload as AuthResponse;
      const user = payload.user;
      if (user.role === 'merchant') {
        navigate('/merchant/hotels');
      } else if (user.role === 'admin') {
        navigate('/admin/review');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>易宿酒店管理</Title>
          <Text type="secondary">创建您的账户</Text>
        </div>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          initialValues={{ role: 'merchant' }}
        >
          <Form.Item name="role" className="role-selector">
            <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
              <Radio.Button value="merchant" style={{ flex: 1, textAlign: 'center' }}>
                商户
              </Radio.Button>
              <Radio.Button value="admin" style={{ flex: 1, textAlign: 'center' }}>
                管理员
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 6, message: '用户名至少6个字符' },
              { max: 20, message: '用户名最多20个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名（6-20位）" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8个字符' },
              { max: 20, message: '密码最多20个字符' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/,
                message: '密码必须包含数字和字母',
              },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码（8-20位，包含数字和字母）" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item name="nickname">
            <Input prefix={<UserOutlined />} placeholder="昵称（可选）" />
          </Form.Item>

          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="手机号（可选）" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              注册
            </Button>
          </Form.Item>

          <div className="auth-footer">
            <Text>已有账户？</Text>
            <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
