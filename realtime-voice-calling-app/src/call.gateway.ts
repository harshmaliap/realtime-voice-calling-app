import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ClientInfo {
  id: string;
  name: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Allow requests from any origin
  },
})
export class CallGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private clients: ClientInfo[] = [];

  afterInit(server: Server) {
    console.log('Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
    const clientInfo: ClientInfo = { id: client.id, name: `User ${client.id.substring(0, 5)}` };
    this.clients.push(clientInfo);
    this.server.emit('clients', this.clients);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.clients = this.clients.filter(c => c.id !== client.id);
    this.server.emit('clients', this.clients);
  }

  @SubscribeMessage('call')
  handleCall(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    const { targetClientId, callerName } = data;
    client.to(targetClientId).emit('call', { callerId: client.id, callerName });
  }

  @SubscribeMessage('call-response')
  handleCallResponse(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    const { callerId, accepted } = data;
    client.to(callerId).emit('call-response', { accepted, fromClientId: client.id });
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    const { targetClientId, offer } = data;
    client.to(targetClientId).emit('offer', { offer, fromClientId: client.id });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    const { targetClientId, answer } = data;
    client.to(targetClientId).emit('answer', { answer, fromClientId: client.id });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
    const { targetClientId, candidate } = data;
    client.to(targetClientId).emit('ice-candidate', { candidate, fromClientId: client.id });
  }
}