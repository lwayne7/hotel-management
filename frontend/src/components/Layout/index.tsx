import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, theme, Button, Modal, Descriptions, Tag, Typography } from 'antd';
import {
  HomeOutlined,
  ShopOutlined,
  AuditOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import NotificationBell from '../NotificationBell';
import './index.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [profileVisible, setProfileVisible] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // 根据角色生成菜单
  const menuItems = React.useMemo(() => {
    const items = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '首页',
      },
    ];

    if (user?.role === 'merchant') {
      items.push({
        key: '/merchant/hotels',
        icon: <ShopOutlined />,
        label: '我的酒店',
      });
    }

    if (user?.role === 'admin') {
      items.push({
        key: '/admin/review',
        icon: <AuditOutlined />,
        label: '酒店审核',
      });
    }

    return items;
  }, [user?.role]);

  const userMenuItems = React.useMemo(() => [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ], []);

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
      return;
    }
    if (key === 'profile') {
      setProfileVisible(true);
    }
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case 'merchant':
        return '商户';
      case 'admin':
        return '管理员';
      default:
        return '用户';
    }
  };

  return (
    <Layout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div className="logo">
          {collapsed
            ? <span className="logo-text-short">易宿</span>
            : <span className="logo-text-full">易宿酒店管理</span>
          }
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          className="main-layout-header"
          style={{
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            className="collapse-btn"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="header-right">
          <NotificationBell />
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <button type="button" className="user-info">
              <Avatar icon={<UserOutlined />} />
              <span className="username">
                {user?.nickname || user?.username}
              </span>
              <span className="role-tag">{getRoleName(user?.role)}</span>
            </button>
          </Dropdown>
          </div>
        </Header>
        <Content
          className="main-layout-content"
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      <Modal
        title="个人信息"
        open={profileVisible}
        footer={null}
        onCancel={() => setProfileVisible(false)}
      >
        <div className="profile-modal-head">
          <Avatar size={56} icon={<UserOutlined />} />
          <div>
            <div className="profile-modal-name">{user?.nickname || user?.username || '未登录用户'}</div>
            <Tag color={user?.role === 'admin' ? 'volcano' : 'blue'}>
              {getRoleName(user?.role)}
            </Tag>
          </div>
        </div>
        <Descriptions
          className="profile-modal-desc"
          column={1}
          bordered
          size="small"
        >
          <Descriptions.Item label="用户ID">{user?.id ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="用户名">{user?.username ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="昵称">{user?.nickname || '-'}</Descriptions.Item>
          <Descriptions.Item label="手机号">{user?.phone || '-'}</Descriptions.Item>
        </Descriptions>
        <Text type="secondary" className="profile-modal-tip">
          若需修改账户信息，可联系管理员或在后续版本中使用账户设置页。
        </Text>
      </Modal>
    </Layout>
  );
};

export default MainLayout;
