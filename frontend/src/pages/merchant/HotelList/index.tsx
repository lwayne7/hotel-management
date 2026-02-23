import React, { useCallback, useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Tabs,
  Input,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import type { TableProps, TabsProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchMyHotels } from '../../../store/slices/hotelSlice';
import type { Hotel, HotelStatus } from '../../../store/slices/hotelSlice';
import { hotelApi } from '../../../services/api';
import { getApiErrorMessage } from '../../../utils/error';
import dayjs from 'dayjs';
import './index.css';

const { Title } = Typography;

type MerchantFilterStatus = 'all' | HotelStatus;

const statusConfig: Record<HotelStatus, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '审核中' },
  approved: { color: 'success', text: '已发布' },
  rejected: { color: 'error', text: '已驳回' },
  offline: { color: 'warning', text: '已下线' },
};

const MerchantHotels: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hotels, isLoading, pagination } = useAppSelector((state) => state.hotel);
  const [activeStatus, setActiveStatus] = useState<MerchantFilterStatus>('all');
  const [searchText, setSearchText] = useState('');

  const loadHotels = useCallback(
    (page = 1) => {
      const params: { page?: number; status?: HotelStatus; keyword?: string } = { page };
      if (activeStatus !== 'all') {
        params.status = activeStatus;
      }
      const keyword = searchText.trim();
      if (keyword) {
        params.keyword = keyword;
      }
      void dispatch(fetchMyHotels(params));
    },
    [activeStatus, dispatch, searchText],
  );

  useEffect(() => {
    loadHotels(1);
  }, [loadHotels]);

  const handleDelete = async (id: number) => {
    try {
      await hotelApi.deleteHotel(id);
      message.success('删除成功');
      loadHotels(pagination.page);
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, '删除失败'));
    }
  };

  const handleSubmit = async (id: number) => {
    try {
      await hotelApi.submitForReview(id);
      message.success('提交审核成功');
      loadHotels(pagination.page);
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, '提交失败'));
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
      render: (rating: number) => '⭐'.repeat(rating),
    },
    {
      title: '房型数',
      key: 'roomCount',
      width: 80,
      render: (_: unknown, record: Hotel) => record.roomTypes?.length || 0,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: HotelStatus, record: Hotel) => (
        <Space>
          <Tag color={statusConfig[status]?.color}>
            {statusConfig[status]?.text}
          </Tag>
          {status === 'rejected' && record.rejectReason && (
            <Tooltip title={record.rejectReason}>
              <InfoCircleOutlined style={{ color: '#ff4d4f' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_: unknown, record: Hotel) => (
        <Space size="small">
          {['draft', 'rejected', 'approved', 'offline'].includes(record.status) && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/merchant/hotels/${record.id}/edit`)}
            >
              编辑
            </Button>
          )}
          {['draft', 'rejected'].includes(record.status) && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handleSubmit(record.id)}
            >
              提交审核
            </Button>
          )}
          {record.status === 'draft' && (
            <Popconfirm
              title="确定删除此酒店？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => navigate(`/merchant/hotels/${record.id}/edit`)}
            >
              查看
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabItems: TabsProps['items'] = [
    { key: 'all', label: '全部' },
    { key: 'draft', label: '草稿' },
    { key: 'pending', label: '审核中' },
    { key: 'approved', label: '已发布' },
    { key: 'rejected', label: '已驳回' },
    { key: 'offline', label: '已下线' },
  ];

  return (
    <div className="merchant-hotels">
      <div className="page-header">
        <Title level={3}>我的酒店</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/merchant/hotels/create')}
        >
          新增酒店
        </Button>
      </div>

      <div className="filter-bar">
        <Tabs
          activeKey={activeStatus}
          onChange={(key) => {
            setActiveStatus(key as MerchantFilterStatus);
          }}
          items={tabItems}
        />
        <Input.Search
          placeholder="搜索酒店名称或地址"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={() => loadHotels(1)}
          allowClear
          enterButton="搜索"
        />
      </div>

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page) => {
            loadHotels(page);
          },
        }}
      />
    </div>
  );
};

export default MerchantHotels;
