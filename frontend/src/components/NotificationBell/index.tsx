import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Badge, Popover, List, Typography, Empty, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../../store/hooks';
import { notificationApi } from '../../services/api';
import dayjs from 'dayjs';
import './index.css';

interface DisplayNotification {
  id?: number;
  type: string;
  hotelId: number;
  hotelName: string;
  message: string;
  timestamp: number;
}

const { Text } = Typography;

const WS_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  : (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin);

const NotificationBell: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // 登录后从数据库拉取历史未读通知
  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const items = await notificationApi.getUnread();
      const mapped: DisplayNotification[] = items.map((n) => ({
        id: n.id,
        type: n.type,
        hotelId: n.hotelId,
        hotelName: n.hotelName,
        message: n.message,
        timestamp: n.timestamp,
      }));
      setNotifications(mapped);
      setUnread(mapped.length);
    } catch {
      // 静默失败，不影响主功能
    }
  }, [user]);

  useEffect(() => {
    void fetchUnread();
  }, [fetchUnread]);

  // WebSocket 实时推送
  useEffect(() => {
    if (!user) return;
    const socket = io(`${WS_URL}/notifications`, {
      query: { role: user.role, userId: user.id },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('notification', (data: DisplayNotification) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50));
      setUnread((c) => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleOpen = (open: boolean) => {
    if (open && unread > 0) {
      setUnread(0);
      // 异步标记数据库中所有通知为已读
      void notificationApi.markAllRead().catch(() => {});
    }
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
