import React from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { ShopOutlined, AuditOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, FileTextOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '../../store/hooks';
import { hotelApi } from '../../services/api';
import './index.css';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const { data: merchantStats, isLoading: merchantLoading } = useQuery({
    queryKey: ['merchant-statistics'],
    queryFn: () => hotelApi.getMerchantStatistics(),
    enabled: user?.role === 'merchant',
  });

  const { data: adminStats, isLoading: adminLoading } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: () => hotelApi.getAdminStatistics(),
    enabled: user?.role === 'admin',
  });

  const loading = merchantLoading || adminLoading;

  return (
    <div className="home-page">
      <Card className="home-hero" bordered={false}>
        <Title level={2} className="page-title">
          欢迎回来，{user?.nickname || user?.username}！
        </Title>
        <Paragraph className="page-subtitle">
          您当前的角色是：{user?.role === 'merchant' ? '商户' : '管理员'}，以下是今日业务概览。
        </Paragraph>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="home-stats-row">
          {user?.role === 'merchant' && merchantStats && (
            <>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card-blue">
                  <Statistic
                    title="我的酒店"
                    value={merchantStats.total}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card">
                  <Statistic
                    title="草稿"
                    value={merchantStats.draft}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card-warn">
                  <Statistic
                    title="待审核"
                    value={merchantStats.pending}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card-success">
                  <Statistic
                    title="已上线"
                    value={merchantStats.approved}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </>
          )}

          {user?.role === 'admin' && adminStats && (
            <>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card-warn">
                  <Statistic
                    title="待审核酒店"
                    value={adminStats.pending}
                    prefix={<AuditOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card-success">
                  <Statistic
                    title="已发布酒店"
                    value={adminStats.approved}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card-danger">
                  <Statistic
                    title="已下线酒店"
                    value={adminStats.offline}
                    prefix={<StopOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card stat-card-blue">
                  <Statistic
                    title="总酒店数"
                    value={adminStats.total}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
            </>
          )}
        </Row>
      </Spin>
    </div>
  );
};

export default Home;
