import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Rate,
  DatePicker,
  Space,
  Typography,
  Divider,
  message,
  InputNumber,
  Select,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { hotelApi } from '../../../services/api';
import dayjs from 'dayjs';
import './index.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const discountTypeOptions = [
  { value: 'none', label: '无折扣' },
  { value: 'percentage', label: '百分比折扣' },
  { value: 'fixed', label: '固定减免' },
  { value: 'package', label: '套餐优惠' },
];

const facilityOptions = [
  '免费WiFi', '停车场', '游泳池', '健身房', '餐厅', '酒吧',
  '会议室', 'SPA', '儿童乐园', '24小时前台', '行李寄存', '洗衣服务',
];

const HotelForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      loadHotel(parseInt(id));
    }
  }, [id]);

  const loadHotel = async (hotelId: number) => {
    try {
      setLoading(true);
      const hotel = await hotelApi.getHotelById(hotelId);
      
      // 检查是否只读（非草稿和驳回状态）
      if (!['draft', 'rejected'].includes(hotel.status)) {
        setIsReadOnly(true);
      }

      form.setFieldsValue({
        ...hotel,
        openingDate: hotel.openingDate ? dayjs(hotel.openingDate) : undefined,
        facilities: hotel.facilities || [],
        nearbyAttractions: hotel.nearbyAttractions || [],
        transportation: hotel.transportation || [],
        roomTypes: hotel.roomTypes || [],
      });
    } catch (error: any) {
      message.error(error.response?.data?.message || '加载酒店信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isDraft = true) => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const data = {
        ...values,
        openingDate: values.openingDate?.format('YYYY-MM-DD'),
      };

      if (isEdit) {
        await hotelApi.updateHotel(parseInt(id!), data);
        message.success('保存成功');
      } else {
        const newHotel = await hotelApi.createHotel(data);
        message.success('创建成功');
        if (!isDraft) {
          await hotelApi.submitForReview(newHotel.id);
          message.success('已提交审核');
        }
        navigate('/merchant/hotels');
        return;
      }

      if (!isDraft && isEdit) {
        await hotelApi.submitForReview(parseInt(id!));
        message.success('已提交审核');
        navigate('/merchant/hotels');
      }
    } catch (error: any) {
      if (error.errorFields) {
        message.error('请检查表单填写是否完整');
      } else {
        message.error(error.response?.data?.message || '操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hotel-form-page">
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEdit ? (isReadOnly ? '查看酒店' : '编辑酒店') : '新增酒店'}
          </Title>
        </Space>
        {!isReadOnly && (
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleSave(true)}
              loading={submitting}
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSave(false)}
              loading={submitting}
            >
              提交审核
            </Button>
          </Space>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        disabled={isReadOnly}
        initialValues={{
          starRating: 3,
          roomTypes: [{ name: '', price: 0, maxGuests: 2 }],
        }}
      >
        {/* 基本信息 */}
        <Card title="基本信息" className="form-card">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="nameCn"
                label="酒店中文名"
                rules={[{ required: true, message: '请输入酒店中文名' }]}
              >
                <Input placeholder="请输入酒店中文名" maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nameEn" label="酒店英文名">
                <Input placeholder="请输入酒店英文名（可选）" maxLength={100} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="酒店地址"
            rules={[{ required: true, message: '请输入酒店地址' }]}
          >
            <Input placeholder="请输入详细地址" maxLength={255} />
          </Form.Item>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="starRating"
                label="酒店星级"
                rules={[{ required: true, message: '请选择星级' }]}
              >
                <Rate />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="openingDate" label="开业时间">
                <DatePicker style={{ width: '100%' }} placeholder="选择开业日期" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="酒店描述">
            <TextArea rows={4} placeholder="请输入酒店描述信息" maxLength={1000} />
          </Form.Item>

          <Form.Item name="facilities" label="酒店设施">
            <Select
              mode="multiple"
              placeholder="选择酒店设施"
              options={facilityOptions.map((f) => ({ value: f, label: f }))}
            />
          </Form.Item>
        </Card>

        {/* 房型信息 */}
        <Card title="房型信息" className="form-card">
          <Form.List name="roomTypes">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="room-type-item">
                    <Row gutter={16} align="middle">
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="房型名称"
                          rules={[{ required: true, message: '请输入房型名称' }]}
                        >
                          <Input placeholder="如：豪华大床房" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'price']}
                          label="价格（元）"
                          rules={[{ required: true, message: '请输入价格' }]}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'originalPrice']}
                          label="原价（元）"
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'discountType']}
                          label="折扣类型"
                          initialValue="none"
                        >
                          <Select options={discountTypeOptions} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'maxGuests']}
                          label="最大入住"
                          initialValue={2}
                        >
                          <InputNumber min={1} max={10} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, 'bedType']}
                          label="床型"
                        >
                          <Input placeholder="如：1.8m大床" />
                        </Form.Item>
                      </Col>
                      <Col span={1}>
                        {!isReadOnly && fields.length > 1 && (
                          <MinusCircleOutlined
                            className="remove-btn"
                            onClick={() => remove(name)}
                          />
                        )}
                      </Col>
                    </Row>
                    <Divider style={{ margin: '8px 0 16px' }} />
                  </div>
                ))}
                {!isReadOnly && (
                  <Button
                    type="dashed"
                    onClick={() => add({ name: '', price: 0, maxGuests: 2 })}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加房型
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Card>

        {/* 周边信息 */}
        <Card title="周边信息（可选）" className="form-card">
          <Form.Item name="nearbyAttractions" label="附近景点">
            <Select
              mode="tags"
              placeholder="输入景点名称后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="transportation" label="交通信息">
            <Select
              mode="tags"
              placeholder="输入交通信息后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

export default HotelForm;
