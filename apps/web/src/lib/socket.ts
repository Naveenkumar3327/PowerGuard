import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(WS_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO] Connected to PowerGuard telemetry stream:', socketInstance?.id);
    });

    socketInstance.on('disconnect', () => {
      console.log('[Socket.IO] Disconnected from telemetry stream');
    });
  }

  return socketInstance;
}
