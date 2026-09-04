import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'ws',
})
export class SafetyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`📡 Client connected to live alerts: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  // Push urgent 24-Hour SAE Alert to all connected dashboards
  broadcastSaeAlert(payload: any) {
    this.server.emit('EMERGENCY_SAE_ALERT', {
      type: 'SAE_24H_TRIGGER',
      title: '🚨 CRITICAL: Serious Adverse Event Reported!',
      data: payload,
      timestamp: new Date().toISOString(),
    });
  }
}
