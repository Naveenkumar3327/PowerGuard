import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import * as authCtrl from '../controllers/authController';
import * as machineCtrl from '../controllers/machineController';
import * as telemetryCtrl from '../controllers/telemetryController';
import * as agentCtrl from '../controllers/agentController';
import * as decisionCtrl from '../controllers/decisionController';
import * as commandCtrl from '../controllers/commandController';
import * as alertCtrl from '../controllers/alertController';
import * as analyticsCtrl from '../controllers/analyticsController';
import * as forecastCtrl from '../controllers/forecastController';
import * as simCtrl from '../controllers/simulationController';
import * as settingsCtrl from '../controllers/settingsController';
import * as chatCtrl from '../controllers/chatController';

export const apiRouter = Router();

// 1. Auth Routes
apiRouter.post('/auth/register', authCtrl.register);
apiRouter.post('/auth/login', authCtrl.login);
apiRouter.get('/auth/me', authenticate, authCtrl.getMe);
apiRouter.get('/auth/demo-accounts', authCtrl.getDemoAccounts);

// 2. Machine Routes
apiRouter.get('/machines', machineCtrl.getMachines);
apiRouter.get('/machines/:id', machineCtrl.getMachineById);
apiRouter.put('/machines/:id', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), machineCtrl.updateMachine);

// 3. Telemetry Routes
apiRouter.get('/telemetry', telemetryCtrl.getLatestTelemetry);
apiRouter.get('/telemetry/:machineId', telemetryCtrl.getMachineTelemetryHistory);

// 4. Agent Routes
apiRouter.get('/agents', agentCtrl.getAgents);
apiRouter.get('/agents/activity', agentCtrl.getAgentActivity);

// 5. Decision Routes
apiRouter.get('/decisions', decisionCtrl.getDecisions);
apiRouter.get('/decisions/:id', decisionCtrl.getDecisionById);
apiRouter.post('/decisions/:id/approve', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), decisionCtrl.approveDecision);
apiRouter.post('/decisions/:id/reject', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), decisionCtrl.rejectDecision);

// 6. Command Routes
apiRouter.get('/commands', commandCtrl.getCommands);
apiRouter.post('/commands/simulate', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), commandCtrl.simulateCommand);

// 7. Alert Routes
apiRouter.get('/alerts', alertCtrl.getAlerts);
apiRouter.post('/alerts/:id/acknowledge', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), alertCtrl.acknowledgeAlert);
apiRouter.post('/alerts/:id/resolve', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), alertCtrl.resolveAlert);

// 8. Analytics Routes
apiRouter.get('/analytics/energy', analyticsCtrl.getEnergyAnalytics);
apiRouter.get('/analytics/savings', analyticsCtrl.getSavingsAnalytics);
apiRouter.get('/analytics/peak-demand', analyticsCtrl.getPeakDemandAnalytics);

// 9. Forecast Routes
apiRouter.get('/forecast', forecastCtrl.getForecast);

// 10. Simulation Control Routes
apiRouter.get('/simulation/status', simCtrl.getSimulationStatus);
apiRouter.post('/simulation/start', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), simCtrl.startSimulation);
apiRouter.post('/simulation/stop', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), simCtrl.stopSimulation);
apiRouter.post('/simulation/speed', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), simCtrl.setSimulationSpeed);
apiRouter.post('/simulation/scenario', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), simCtrl.setScenario);
apiRouter.post('/simulation/fault', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER', 'OPERATOR']), simCtrl.injectFault);

// 11. System Settings Routes
apiRouter.get('/settings', settingsCtrl.getSettings);
apiRouter.put('/settings', authenticate, authorize(['ADMIN', 'ENERGY_MANAGER']), settingsCtrl.updateSettings);

// 12. AI Assistant Chat
apiRouter.post('/ai/chat', chatCtrl.handleChat);
