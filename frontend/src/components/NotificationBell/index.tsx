import React, { useEffect, useState, useRef } from 'react';
import { Badge, Popover, List, Typography, Empty, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../../store/hooks';
import dayjs from 'dayjs';
import './index.css';

interface Notification {
  type: string;
  hotelId: number;
  hotelName: string;
  message: string;
  timestamp: number;
}

const { Text } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = API_BASE.replace('/api', '');

const NotificationBell: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const socket = io(`${WS_URL}/notifications`, {
      query: { role: user.role, userId: user.id },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('notification', (data: Notification) => {
      setNotifications((prev) => [data, ...prev].slice(0, 20));
      setUnread((c) => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleOpen = (open: boolean) => {
    if (open) setUnread(0);
  };

  const content = (
    <div className="notice-popover">
      {notifications.length === 0 ? (
        <Empty description="暂无通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          size="small"
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item className="notice-item">
              <div>
                <Text style={{ fontSize: 13 }}>{item.message}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {dayjs(item.timestamp).format('MM-DD HH:mm')}
                </Text>
              </div>
            </List.Item>
          )}
        />
      )}
      {notifications.length > 0 && (
        <div className="notice-clear">
          <Button type="link" size="small" onClick={() => setNotifications([])}>
            清空通知
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title="系统通知"
      trigger="click"
      placement="bottomRight"
      onOpenChange={handleOpen}
    >
      <Badge count={unread} size="small" offset={[-2, 2]}>
        <BellOutlined className="notice-bell" />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
