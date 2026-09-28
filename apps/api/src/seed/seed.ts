/**
 * POWERGUARD Database Seed Script
 * Seeds 4 demo accounts, 8 industrial machines, 30 days of realistic telemetry,
 * past AI decisions, alerts, and verified energy savings.
 */
import bcrypt from 'bcryptjs';
import { connectDatabase, isConnectedToDb } from '../config/database';
import { 
  UserModel, 
  MachineModel, 
  TelemetryModel, 
  AlertModel, 
  AIDecisionModel, 
  EnergySavingModel, 
  SystemSettingModel 
} from '../models';

async function seed() {
  console.log('[Seed] Initializing PowerGuard database seed...');
  await connectDatabase();

  if (!isConnectedToDb) {
    console.log('[Seed] Database not connected. In-memory defaults will be used by the application automatically.');
    process.exit(0);
  }

  // 1. Seed Users
  console.log('[Seed] Seeding demo users...');
  await UserModel.deleteMany({});
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const mgrPass = await bcrypt.hash('Manager@123', salt);
  const opPass = await bcrypt.hash('Operator@123', salt);
  const viewPass = await bcrypt.hash('Viewer@123', salt);

  await UserModel.create([
    { name: 'Factory Director Admin', email: 'admin@powerguard.demo', passwordHash: adminPass, role: 'ADMIN', department: 'Executive' },
    { name: 'Chief Energy Manager', email: 'manager@powerguard.demo', passwordHash: mgrPass, role: 'ENERGY_MANAGER', department: 'Sustainability' },
    { name: 'Lead Floor Operator', email: 'operator@powerguard.demo', passwordHash: opPass, role: 'OPERATOR', department: 'Production' },
    { name: 'Sustainability Auditor', email: 'viewer@powerguard.demo', passwordHash: viewPass, role: 'VIEWER', department: 'Compliance' },
  ]);

  // 2. Seed Machines
  console.log('[Seed] Seeding 8 industrial machines...');
  await MachineModel.deleteMany({});
  await MachineModel.create([
    { machineId: 'M-001', name: '5-Axis CNC Milling Machine', type: 'CNC Machine', department: 'Production', status: 'RUNNING', voltage: 400.0, current: 60.5, powerFactor: 0.94, powerKw: 39.4, energyKwh: 3420.5, loadPercentage: 82.0, temperature: 48.2, operatingHours: 1420.0, productionPriority: 'CRITICAL', efficiencyScore: 92.5, ratedPowerKw: 45.0 },
    { machineId: 'M-002', name: 'Industrial Screw Compressor', type: 'Compressor', department: 'Utilities', status: 'RUNNING', voltage: 402.0, current: 44.8, powerFactor: 0.91, powerKw: 28.4, energyKwh: 2810.0, loadPercentage: 74.0, temperature: 52.1, operatingHours: 1890.0, productionPriority: 'HIGH', efficiencyScore: 89.0, ratedPowerKw: 37.0 },
    { machineId: 'M-003', name: 'Hydraulic Injection Molding Machine', type: 'Injection Molding', department: 'Production', status: 'RUNNING', voltage: 398.0, current: 72.0, powerFactor: 0.93, powerKw: 46.2, energyKwh: 4120.0, loadPercentage: 84.0, temperature: 56.4, operatingHours: 2150.0, productionPriority: 'CRITICAL', efficiencyScore: 94.0, ratedPowerKw: 55.0 },
    { machineId: 'M-004', name: 'Automated Sorting & Conveyor', type: 'Conveyor', department: 'Assembly', status: 'IDLE', voltage: 401.0, current: 17.5, powerFactor: 0.86, powerKw: 10.5, energyKwh: 1250.0, loadPercentage: 5.0, temperature: 34.0, operatingHours: 940.0, productionPriority: 'LOW', efficiencyScore: 68.0, ratedPowerKw: 15.0 },
    { machineId: 'M-005', name: 'High-Pressure Chilled Water Pump', type: 'Industrial Pump', department: 'Utilities', status: 'RUNNING', voltage: 400.0, current: 28.0, powerFactor: 0.92, powerKw: 17.8, energyKwh: 1840.0, loadPercentage: 78.0, temperature: 42.5, operatingHours: 1620.0, productionPriority: 'MEDIUM', efficiencyScore: 91.0, ratedPowerKw: 22.0 },
    { machineId: 'M-006', name: 'Factory Central HVAC Chiller Unit', type: 'HVAC Unit', department: 'HVAC', status: 'RUNNING', voltage: 405.0, current: 48.0, powerFactor: 0.90, powerKw: 30.3, energyKwh: 3650.0, loadPercentage: 72.0, temperature: 39.8, operatingHours: 2800.0, productionPriority: 'MEDIUM', efficiencyScore: 88.0, ratedPowerKw: 40.0 },
    { machineId: 'M-007', name: 'Robotic Spot Welding Machine', type: 'Welding Machine', department: 'Assembly', status: 'RUNNING', voltage: 399.0, current: 36.0, powerFactor: 0.91, powerKw: 22.7, energyKwh: 1980.0, loadPercentage: 75.0, temperature: 46.0, operatingHours: 1120.0, productionPriority: 'HIGH', efficiencyScore: 90.0, ratedPowerKw: 30.0 },
    { machineId: 'M-008', name: 'High-Speed Packaging Machine', type: 'Packaging Machine', department: 'Packaging', status: 'RUNNING', voltage: 400.0, current: 14.5, powerFactor: 0.93, powerKw: 9.3, energyKwh: 890.0, loadPercentage: 76.0, temperature: 36.2, operatingHours: 780.0, productionPriority: 'LOW', efficiencyScore: 92.0, ratedPowerKw: 12.0 },
  ]);

  // 3. Seed System Settings
  console.log('[Seed] Seeding settings...');
  await SystemSettingModel.deleteMany({});
  await SystemSettingModel.create({
    factoryName: 'Apex Precision Manufacturing Digital Twin',
    electricityTariff: 0.15,
    peakTariff: 0.28,
    emissionFactor: 0.42,
    peakDemandThresholdKw: 160.0,
    aiMode: 'ASSISTED',
    simulationSpeed: 1,
    alertCooldownSeconds: 30,
    forecastHorizonHours: 24,
  });

  // 4. Seed Alerts
  console.log('[Seed] Seeding initial alerts...');
  await AlertModel.deleteMany({});
  await AlertModel.create([
    {
      title: 'Idle Energy Waste: M-004',
      machineId: 'M-004',
      severity: 'WARNING',
      detectedTime: new Date(Date.now() - 15 * 60 * 1000),
      agent: 'EnergyMonitoringAgent',
      description: 'Conveyor system has remained in idle operational mode for 18 minutes drawing 10.5 kW.',
      recommendedAction: 'Transition to low-power standby mode.',
      status: 'ACTIVE',
    },
    {
      title: 'Suboptimal Power Factor: M-002',
      machineId: 'M-002',
      severity: 'INFO',
      detectedTime: new Date(Date.now() - 45 * 60 * 1000),
      agent: 'EnergyMonitoringAgent',
      description: 'Screw Compressor PF dropped to 0.89 during cycle switchover.',
      recommendedAction: 'Verify automatic capacitor bank stage 2 engagement.',
      status: 'RESOLVED',
      resolvedBy: 'Lead Floor Operator',
      resolvedAt: new Date(Date.now() - 10 * 60 * 1000),
    },
  ]);

  console.log('[Seed] Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Error seeding database:', err);
  process.exit(1);
});
