import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

export interface NotificationPayload {
  type: 'hotel_submitted' | 'hotel_approved' | 'hotel_rejected' | 'hotel_offline' | 'hotel_online';
  hotelId: number;
  hotelName: string;
  message: string;
  timestamp: number;
  targetRole: 'merchant' | 'admin' | 'all';
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

  /** Send a notification to a specific role or all connected clients */
  sendNotification(payload: NotificationPayload) {
    if (payload.targetRole === 'all') {
      this.server.emit('notification', payload);
    } else {
      this.server.to(`role:${payload.targetRole}`).emit('notification', payload);
    }
  }
}
