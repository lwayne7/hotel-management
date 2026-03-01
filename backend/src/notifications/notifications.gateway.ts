import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserRole } from '../users/entities/user.entity';

export interface NotificationPayload {
  type: 'hotel_submitted' | 'hotel_approved' | 'hotel_rejected' | 'hotel_offline' | 'hotel_online';
  hotelId: number;
  hotelName: string;
  message: string;
  timestamp: number;
  /** 精准推送给指定用户（同时持久化到数据库） */
  targetUserId?: number;
  /** 广播给整个角色组（不持久化） */
  targetRole?: 'merchant' | 'admin' | 'all';
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { role?: string; userId?: number }>();

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    const role = client.handshake.query.role as string;
    const userId = Number(client.handshake.query.userId) || undefined;
    this.connectedClients.set(client.id, { role, userId });
    client.join(`role:${role}`);
    if (userId) client.join(`user:${userId}`);
    console.log(`[WS] Client connected: ${client.id} (role=${role})`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`[WS] Client disconnected: ${client.id}`);
  }

  sendNotification(payload: NotificationPayload) {
    if (payload.targetUserId) {
      // 精准推送：只发给指定用户，并持久化到数据库
      this.server.to(`user:${payload.targetUserId}`).emit('notification', payload);
      void this.notificationsService.save({
        type: payload.type,
        hotelId: payload.hotelId,
        hotelName: payload.hotelName,
        message: payload.message,
        targetUserId: payload.targetUserId,
        timestamp: payload.timestamp,
      });
    } else if (payload.targetRole === 'all') {
      this.server.emit('notification', payload);
    } else if (payload.targetRole) {
      this.server.to(`role:${payload.targetRole}`).emit('notification', payload);
      // 按角色持久化：为该角色下每位用户各存一条
      void this.notificationsService.saveForRole(payload.targetRole as UserRole, {
        type: payload.type,
        hotelId: payload.hotelId,
        hotelName: payload.hotelName,
        message: payload.message,
        timestamp: payload.timestamp,
      });
    }
  }
}
