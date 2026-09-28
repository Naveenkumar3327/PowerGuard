import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Telemetry, FactorySummary } from '@powerguard/shared-types';

export let ioServer: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  ioServer = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  ioServer.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Client requests immediate status
    socket.on('requestInitialData', () => {
      socket.emit('connectionReady', { status: 'connected', time: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioServer;
}

export function broadcastTelemetry(telemetries: Telemetry[]): void {
  if (ioServer) {
    ioServer.emit('machineTelemetryUpdated', telemetries);
  }
}
