import React, { useState } from 'react';
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
  Image,
  Row,
  Col,
} from 'antd';
import type { TableProps, TabsProps } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hotelApi, type HotelListParams } from '../../../services/api';
import type { Hotel, HotelStatus, HotelImage, RoomType } from '../../../types/hotel';
import { getApiErrorMessage, isFormValidationError } from '../../../utils/error';
import dayjs from 'dayjs';
import './index.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

type AdminFilterStatus = HotelStatus | 'all';

// Query key factory（与移动端 hotelKeys 模式一致）
const adminHotelKeys = {
  all: () => ['admin-hotels'] as const,
  list: (params: { status?: string; page: number; pageSize: number }) =>
    [...adminHotelKeys.all(), 'list', params] as const,
};

const statusConfig: Record<HotelStatus, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待审核' },
  approved: { color: 'success', text: '已发布' },
  rejected: { color: 'error', text: '已驳回' },
  offline: { color: 'warning', text: '已下线' },
};

const ReviewList: React.FC = () => {
  const [activeStatus, setActiveStatus] = useState<AdminFilterStatus>('pending');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [detailModal, setDetailModal] = useState<{ visible: boolean; hotel: Hotel | null }>({
    visible: false,
    hotel: null,
  });
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; hotelId: number | null }>({
    visible: false,
    hotelId: null,
  });
  const [rejectForm] = Form.useForm<{ reason: string }>();
  const queryClient = useQueryClient();

  // 用 useQuery 替代手写 loading/error 管理
  const queryParams = {
    status: activeStatus === 'all' ? undefined : activeStatus,
    page,
    pageSize,
  };
  const { data, isLoading: loading } = useQuery({
    queryKey: adminHotelKeys.list(queryParams),
    queryFn: () => {
      const params: HotelListParams = { page, pageSize };
      if (activeStatus !== 'all') params.status = activeStatus;
      return hotelApi.getPendingHotels(params);
    },
  });

  const hotels = data?.data ?? [];
  const total = data?.total ?? 0;

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: adminHotelKeys.all() });

  // 用 useMutation 替代手动调用 + reload
  const approveMutation = useMutation({
    mutationFn: (id: number) => hotelApi.approveHotel(id),
    onSuccess: () => { message.success('审核通过'); void invalidateList(); },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '操作失败')),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => hotelApi.rejectHotel(id, reason),
    onSuccess: () => {
      message.success('已驳回');
      setRejectModal({ visible: false, hotelId: null });
      rejectForm.resetFields();
      void invalidateList();
    },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '操作失败')),
  });

  const offlineMutation = useMutation({
    mutationFn: (id: number) => hotelApi.offlineHotel(id),
    onSuccess: () => { message.success('已下线'); void invalidateList(); },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '操作失败')),
  });

  const onlineMutation = useMutation({
    mutationFn: (id: number) => hotelApi.onlineHotel(id),
    onSuccess: () => { message.success('已恢复上线'); void invalidateList(); },
    onError: (error: unknown) => message.error(getApiErrorMessage(error, '操作失败')),
  });

  const handleReject = async () => {
    if (!rejectModal.hotelId) return;
    try {
      const { reason } = await rejectForm.validateFields();
      rejectMutation.mutate({ id: rejectModal.hotelId, reason });
    } catch (error: unknown) {
      if (!isFormValidationError(error)) {
        message.error(getApiErrorMessage(error, '操作失败'));
      }
    }
  };

  const columns: TableProps<Hotel>['columns'] = [
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
      render: (_: unknown, record: Hotel) =>
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
      render: (status: HotelStatus) => (
        <Tag color={statusConfig[status]?.color}>{statusConfig[status]?.text}</Tag>
      ),
    },
    {
      title: '驳回原因',
      key: 'rejectReason',
      width: 160,
      render: (_: unknown, record: Hotel) => {
        if (!record.rejectReason) return '-';
        return (
          <Tooltip title={record.rejectReason}>
            <Space size={4}>
              <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
              <Text ellipsis style={{ maxWidth: 110 }}>
                {record.rejectReason}
              </Text>
            </Space>
          </Tooltip>
        );
      },
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
      render: (_: unknown, record: Hotel) => (
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
                onClick={() => approveMutation.mutate(record.id)}
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
              onClick={() => offlineMutation.mutate(record.id)}
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
              onClick={() => onlineMutation.mutate(record.id)}
            >
              上线
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabItems: TabsProps['items'] = [
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已发布' },
    { key: 'rejected', label: '已驳回' },
    { key: 'offline', label: '已下线' },
    { key: 'all', label: '全部' },
  ];

  return (
    <div className="admin-review page-shell">
      <div className="admin-review-header">
        <Title level={3} className="page-title">酒店审核</Title>
        <Text className="page-subtitle">统一处理酒店提审、驳回原因和发布上下线流程</Text>
      </div>

      <Tabs
        activeKey={activeStatus}
        onChange={(key) => {
          setActiveStatus(key as AdminFilterStatus);
          setPage(1);
        }}
        items={tabItems}
      />

      <Table
        className="pretty-table"
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p) => setPage(p),
        }}
      />

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
              <Descriptions.Item label="附近景点" span={2}>
                {detailModal.hotel.nearbyAttractions?.join('、') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="交通信息" span={2}>
                {detailModal.hotel.transportation?.join('、') || '-'}
              </Descriptions.Item>
            </Descriptions>

            {detailModal.hotel.images && detailModal.hotel.images.length > 0 && (
              <Card title="酒店图片" size="small" style={{ marginTop: 16 }}>
                <Image.PreviewGroup>
                  <Row gutter={[8, 8]}>
                    {detailModal.hotel.images
                      .slice()
                      .sort((a: HotelImage, b: HotelImage) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map((img: HotelImage) => (
                        <Col span={8} key={img.id ?? img.imageUrl}>
                          <Image
                            src={img.imageUrl}
                            alt={img.description || '酒店图片'}
                            style={{ width: '100%', height: 150, objectFit: 'cover' }}
                          />
                          {img.description && (
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {img.description}
                              </Text>
                            </div>
                          )}
                        </Col>
                      ))}
                  </Row>
                </Image.PreviewGroup>
              </Card>
            )}

            {detailModal.hotel.roomTypes && detailModal.hotel.roomTypes.length > 0 && (
              <Card title="房型信息" size="small" style={{ marginTop: 16 }}>
                {detailModal.hotel.roomTypes
                  .slice()
                  .sort((a: RoomType, b: RoomType) => Number(a.price) - Number(b.price))
                  .map((room: RoomType, index: number) => (
                    <div key={room.id ?? index} style={{ marginBottom: 8 }}>
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

      <Modal
        title="驳回原因"
        open={rejectModal.visible}
        onOk={() => void handleReject()}
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
