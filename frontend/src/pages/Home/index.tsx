import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { ShopOutlined, AuditOutlined, CheckCircleOutlined, ClockCircleOutlined, StopOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store/hooks';
import { hotelApi } from '../../services/api';

const { Title, Paragraph } = Typography;

interface MerchantStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  offline: number;
}

const Home: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [merchantStats, setMerchantStats] = useState<MerchantStats | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    loadStatistics();
  }, [user?.role]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      if (user?.role === 'merchant') {
        const stats = await hotelApi.getMerchantStatistics();
        setMerchantStats(stats);
      } else if (user?.role === 'admin') {
        const stats = await hotelApi.getAdminStatistics();
        setAdminStats(stats);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>
        欢迎回来，{user?.nickname || user?.username}！
      </Title>
      <Paragraph type="secondary">
        您当前的角色是：{user?.role === 'merchant' ? '商户' : '管理员'}
      </Paragraph>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {user?.role === 'merchant' && merchantStats && (
            <>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="我的酒店"
                    value={merchantStats.total}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="草稿"
                    value={merchantStats.draft}
                    prefix={<FileTextOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="待审核"
                    value={merchantStats.pending}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
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
                <Card>
                  <Statistic
                    title="待审核酒店"
                    value={adminStats.pending}
                    prefix={<AuditOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="已发布酒店"
                    value={adminStats.approved}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="已下线酒店"
                    value={adminStats.offline}
                    prefix={<StopOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
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
