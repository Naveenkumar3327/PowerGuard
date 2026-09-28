import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { connectDatabase } from './config/database';
import { initSocketServer, broadcastTelemetry } from './socket/socketManager';
import { simulator } from './simulator/SimulationEngine';
import { orchestrator } from './orchestration/AgentOrchestrator';
import { apiRouter } from './routes/apiRoutes';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // Security & standard middlewares
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json());

  // Attach Socket.IO
  initSocketServer(server);

  // Connect to Database (Atlas or local/in-memory fallback)
  await connectDatabase();

  // Wire Simulator telemetry stream to WebSocket and Orchestrator
  simulator.onTelemetry((telemetries) => {
    broadcastTelemetry(telemetries);
    orchestrator.processTelemetryCycle(telemetries).catch((err) => {
      console.error('[Bootstrap] Orchestrator telemetry processing error:', err.message);
    });
  });

  // Start digital factory simulator
  simulator.start(config.simulationTickMs);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'powerguard-api',
      timestamp: new Date().toISOString(),
      simulator: simulator.getStatus(),
    });
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  });

  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`⚡ POWERGUARD API SERVER STARTED`);
    console.log(`📡 URL: http://localhost:${config.port}`);
    console.log(`🔌 WebSockets: Ready for client connections`);
    console.log(`🤖 AI Engine Mode: ${config.aiSystemMode}`);
    console.log(`🏭 Monitored Machines: 8 Industrial Units`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal startup error:', err);
  process.exit(1);
});
