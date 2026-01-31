import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Tabs,
  Modal,
  Form,
  Input,
  message,
  Descriptions,
  Card,
  Rate,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { hotelApi } from '../../../services/api';
import dayjs from 'dayjs';
import './index.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Hotel {
  id: number;
  nameCn: string;
  nameEn?: string;
  address: string;
  starRating: number;
  openingDate?: string;
  description?: string;
  facilities?: string[];
  status: string;
  rejectReason?: string;
  merchant?: { id: number; username: string; nickname?: string };
  roomTypes?: any[];
  images?: any[];
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待审核' },
  approved: { color: 'success', text: '已发布' },
  rejected: { color: 'error', text: '已驳回' },
  offline: { color: 'warning', text: '已下线' },
};

const ReviewList: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string>('pending');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [detailModal, setDetailModal] = useState<{ visible: boolean; hotel: Hotel | null }>({
    visible: false,
    hotel: null,
  });
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; hotelId: number | null }>({
    visible: false,
    hotelId: null,
  });
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    loadHotels();
  }, [activeStatus, pagination.page]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const params: any = { page: pagination.page, pageSize: pagination.pageSize };
      if (activeStatus !== 'all') {
        params.status = activeStatus;
      }
      const response: any = await hotelApi.getPendingHotels(params);
      setHotels(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error: any) {
      message.error(error.response?.data?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await hotelApi.approveHotel(id);
      message.success('审核通过');
      loadHotels();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleReject = async () => {
    try {
      const { reason } = await rejectForm.validateFields();
      await hotelApi.rejectHotel(rejectModal.hotelId!, reason);
      message.success('已驳回');
      setRejectModal({ visible: false, hotelId: null });
      rejectForm.resetFields();
      loadHotels();
    } catch (error: any) {
      if (!error.errorFields) {
        message.error(error.response?.data?.message || '操作失败');
      }
    }
  };

  const handleOffline = async (id: number) => {
    try {
      await hotelApi.offlineHotel(id);
      message.success('已下线');
      loadHotels();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleOnline = async (id: number) => {
    try {
      await hotelApi.onlineHotel(id);
      message.success('已恢复上线');
      loadHotels();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'nameCn',
      key: 'nameCn',
      render: (text: string, record: Hotel) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.nameEn && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.nameEn}</div>
          )}
        </div>
      ),
    },
    {
      title: '商户',
      key: 'merchant',
      render: (_: any, record: Hotel) =>
        record.merchant?.nickname || record.merchant?.username || '-',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '星级',
      dataIndex: 'starRating',
      key: 'starRating',
      width: 100,
      render: (rating: number) => <Rate disabled value={rating} style={{ fontSize: 12 }} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: any, record: Hotel) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailModal({ visible: true, hotel: record })}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                danger
                onClick={() => setRejectModal({ visible: true, hotelId: record.id })}
              >
                驳回
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button
              type="link"
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleOffline(record.id)}
            >
              下线
            </Button>
          )}
          {record.status === 'offline' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              style={{ color: '#52c41a' }}
              onClick={() => handleOnline(record.id)}
            >
              上线
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已发布' },
    { key: 'rejected', label: '已驳回' },
    { key: 'offline', label: '已下线' },
    { key: 'all', label: '全部' },
  ];

  return (
    <div className="admin-review">
      <Title level={3}>酒店审核</Title>

      <Tabs activeKey={activeStatus} onChange={setActiveStatus} items={tabItems} />

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page) => setPagination((prev) => ({ ...prev, page })),
        }}
      />

      {/* 详情弹窗 */}
      <Modal
        title="酒店详情"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, hotel: null })}
        footer={null}
        width={800}
      >
        {detailModal.hotel && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="酒店中文名">
                {detailModal.hotel.nameCn}
              </Descriptions.Item>
              <Descriptions.Item label="酒店英文名">
                {detailModal.hotel.nameEn || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>
                {detailModal.hotel.address}
              </Descriptions.Item>
              <Descriptions.Item label="星级">
                <Rate disabled value={detailModal.hotel.starRating} />
              </Descriptions.Item>
              <Descriptions.Item label="开业时间">
                {detailModal.hotel.openingDate || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="商户">
                {detailModal.hotel.merchant?.nickname ||
                  detailModal.hotel.merchant?.username}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[detailModal.hotel.status]?.color}>
                  {statusConfig[detailModal.hotel.status]?.text}
                </Tag>
              </Descriptions.Item>
              {detailModal.hotel.rejectReason && (
                <Descriptions.Item label="驳回原因" span={2}>
                  <Text type="danger">{detailModal.hotel.rejectReason}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="酒店描述" span={2}>
                {detailModal.hotel.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="酒店设施" span={2}>
                {detailModal.hotel.facilities?.join('、') || '-'}
              </Descriptions.Item>
            </Descriptions>

            {detailModal.hotel.roomTypes && detailModal.hotel.roomTypes.length > 0 && (
              <Card title="房型信息" size="small" style={{ marginTop: 16 }}>
                {detailModal.hotel.roomTypes.map((room, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <Text strong>{room.name}</Text>
                    <Text style={{ marginLeft: 16 }}>¥{room.price}</Text>
                    {room.originalPrice && (
                      <Text delete type="secondary" style={{ marginLeft: 8 }}>
                        ¥{room.originalPrice}
                      </Text>
                    )}
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      最多{room.maxGuests}人入住
                    </Text>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* 驳回原因弹窗 */}
      <Modal
        title="驳回原因"
        open={rejectModal.visible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModal({ visible: false, hotelId: null });
          rejectForm.resetFields();
        }}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm}>
          <Form.Item
            name="reason"
            rules={[{ required: true, message: '请输入驳回原因' }]}
          >
            <TextArea rows={4} placeholder="请输入驳回原因，将展示给商户" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewList;
