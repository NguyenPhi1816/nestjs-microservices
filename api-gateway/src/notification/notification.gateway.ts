import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import NewNotification from './dto/new-message.dto';

@WebSocketGateway({
  cors: {
    origin: ['https://guds-admin.vercel.app', 'http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, string>(); // Map socketId -> userId

  handleConnection(client: any) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedClients.set(client.id, userId);
      client.join(userId);
      console.log(`Client connected: ${client.id}, User ID: ${userId}`);
    } else {
      console.log(`Client connected without userId: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  sendNotificationToUser(data: NewNotification) {
    console.log(this.server._opts.cors);
    this.server.to(data.userId.toString()).emit('new-notification', data);
  }
}
