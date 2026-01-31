import React from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { ShopOutlined, AuditOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '../../store/hooks';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div>
      <Title level={2}>
        欢迎回来，{user?.nickname || user?.username}！
      </Title>
      <Paragraph type="secondary">
        您当前的角色是：{user?.role === 'merchant' ? '商户' : '管理员'}
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {user?.role === 'merchant' && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="我的酒店"
                  value={0}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="待审核"
                  value={0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已上线"
                  value={0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="待审核酒店"
                  value={0}
                  prefix={<AuditOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="已发布酒店"
                  value={0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总酒店数"
                  value={0}
                  prefix={<ShopOutlined />}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default Home;
