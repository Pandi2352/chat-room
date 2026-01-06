import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });
      client.data.userId = payload.sub; // payload.sub is userId from login
      client.join(payload.sub); // Join personal room for 1-on-1 signaling

      await this.usersService.updateStatus(payload.sub, 'online');
      this.server.emit('user_status', { userId: payload.sub, status: 'online' });

      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (e) {
      console.log('Socket Auth Failed', e);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      await this.usersService.updateStatus(userId, 'offline');
      this.server.emit('user_status', { userId, status: 'offline' });
      console.log(`Client disconnected: ${client.id}, User: ${userId}`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    client: Socket,
    payload: { roomId: string; senderId: string; content: string; type?: 'text' | 'image' },
  ) {
    const message = await this.messagesService.create(payload);
    this.server.to(payload.roomId).emit('receive_message', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { roomId: string; isTyping: boolean }) {
    const userId = client.data.userId;
    client.broadcast.to(payload.roomId).emit('user_typing', { ...payload, userId });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(client: Socket, payload: { roomId: string }) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.messagesService.markAsRead(payload.roomId, userId);
    // Emit to everyone in the room (including sender) to update tick status
    this.server.to(payload.roomId).emit('messages_read', { roomId: payload.roomId, readBy: userId });
  }

  // --- WebRTC Signaling ---

  @SubscribeMessage('call_user')
  handleCallUser(client: Socket, data: { userToCall: string; signalData: any; from: string, name: string }) {
    this.server.to(data.userToCall).emit('call_incoming', {
      signal: data.signalData,
      from: data.from,
      name: data.name
    });
  }

  @SubscribeMessage('answer_call')
  handleAnswerCall(client: Socket, data: { to: string; signal: any }) {
    this.server.to(data.to).emit('call_accepted', data.signal);
  }

  @SubscribeMessage('ice_candidate')
  handleIceCandidate(client: Socket, data: { to: string; candidate: any }) {
    this.server.to(data.to).emit('ice_candidate', data.candidate);
  }

  @SubscribeMessage('end_call')
  handleEndCall(client: Socket, data: { to: string }) {
    this.server.to(data.to).emit('call_ended');
  }
}
