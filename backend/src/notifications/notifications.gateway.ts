import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { UserRole } from '../users/entities/user.entity';
import type { JwtPayload } from '../auth/jwt.strategy';

export interface NotificationPayload {
  type:
    | 'hotel_submitted'
    | 'hotel_approved'
    | 'hotel_rejected'
    | 'hotel_offline'
    | 'hotel_online'
    | 'order_created'
    | 'order_paid'
    | 'order_cancelled';
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

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    const queryToken = client.handshake.query.token;
    const rawToken =
      (typeof authToken === 'string' && authToken) ||
      (typeof queryToken === 'string' && queryToken) ||
      null;

    if (!rawToken) return null;
    return rawToken.startsWith('Bearer ') ? rawToken.slice(7) : rawToken;
  }

  handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      client.disconnect(true);
      return;
    }

    const role = payload.role;
    const userId = payload.sub;
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
