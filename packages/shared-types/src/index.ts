/**
 * POWERGUARD - Shared TypeScript Types and Interfaces
 * Core domain types for Factory Energy Management, Machine Telemetry,
 * Multi-Agent System, Simulator, Alerts, Decisions, and Analytics.
 */

export type MachineStatus = 'RUNNING' | 'IDLE' | 'STANDBY' | 'MAINTENANCE' | 'OFFLINE' | 'FAULT';

export type ProductionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Department = 'Production' | 'Assembly' | 'Packaging' | 'Utilities' | 'HVAC';

export interface Machine {
  machineId: string;
  name: string;
  type: string;
  department: Department;
  status: MachineStatus;
  voltage: number;         // Volts (e.g. 380-420V)
  current: number;         // Amperes
  powerFactor: number;     // 0.0 - 1.0 (e.g. 0.85 - 0.96)
  powerKw: number;         // Real Power in kW
  energyKwh: number;       // Cumulative kWh
  loadPercentage: number;  // 0 - 100%
  temperature: number;     // °C
  operatingHours: number;  // Cumulative hours
  productionPriority: ProductionPriority;
  efficiencyScore: number; // 0 - 100%
  ratedPowerKw: number;    // Machine maximum rated capacity (kW)
  lastMaintenanceDate?: string;
}

export interface Telemetry {
  id?: string;
  machineId: string;
  timestamp: string | Date;
  voltage: number;
  current: number;
  powerFactor: number;
  powerKw: number;
  energyKwh: number;
  loadPercentage: number;
  temperature: number;
  status: MachineStatus;
  isAnomaly?: boolean;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  title: string;
  machineId: string;
  severity: AlertSeverity;
  detectedTime: string;
  agent: string;
  description: string;
  recommendedAction: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'SIMULATED';

export type SimulatedCommandType = 
  | 'START_MACHINE' 
  | 'STOP_MACHINE' 
  | 'REDUCE_LOAD' 
  | 'INCREASE_LOAD' 
  | 'ENTER_STANDBY' 
  | 'EXIT_STANDBY' 
  | 'SHIFT_SCHEDULE'
  | 'RESET_FAULT';

export interface DecisionExplanation {
  problem: string;
  evidence: string;
  analysis: string;
  recommendation: string;
  expectedImpact: string;
  risk: string;
  confidence: number;
}

export interface AIDecision {
  id: string;
  timestamp: string;
  machineId: string;
  agent: string;
  problem: string;
  recommendation: string;
  expectedSavingKwh: number;
  confidence: number;
  status: DecisionStatus;
  affectedProduction: string;
  priority: ProductionPriority;
  explanation: DecisionExplanation;
  simulatedCommand?: SimulatedCommandType;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface MachineCommand {
  id: string;
  machineId: string;
  command: SimulatedCommandType;
  parameters?: Record<string, any>;
  source: string;
  simulation: true; // Strictly simulation only for safety
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  timestamp: string;
}

export interface EnergySaving {
  id: string;
  timestamp: string;
  machineId: string;
  action: string;
  baselinePowerKw: number;
  optimizedPowerKw: number;
  durationMinutes: number;
  energySavedKwh: number;
  costSaved: number;
  co2ReducedKg: number;
}

export interface ForecastDataPoint {
  time: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface Forecast {
  horizon: '1h' | '6h' | '24h';
  timestamp: string;
  predictedTotalPowerKw: number;
  predictedPeakKw: number;
  peakTime: string;
  confidence: number;
  dataPoints: ForecastDataPoint[];
}

export type UserRole = 'ADMIN' | 'ENERGY_MANAGER' | 'OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  lastLogin?: string;
}

export type AIMode = 'AUTO' | 'ASSISTED' | 'MANUAL';

export interface SystemSetting {
  electricityTariff: number;       // USD / kWh
  peakTariff: number;              // USD / kWh
  emissionFactor: number;          // kg CO2 / kWh
  peakDemandThresholdKw: number;   // Factory peak limit (kW)
  aiMode: AIMode;
  simulationSpeed: number;         // 1, 2, 5, 10
  alertCooldownSeconds: number;
  forecastHorizonHours: number;
}

export interface AgentStatus {
  agentId: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'IDLE' | 'BUSY' | 'ERROR';
  lastExecution: string;
  tasksProcessed: number;
  decisionsMade: number;
  confidence: number;
  currentActivity: string;
}

export interface AgentActivityLog {
  id: string;
  timestamp: string;
  agent: string;
  machineId?: string;
  action: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
}

export type DemoScenarioId = 
  | 'NORMAL' 
  | 'HIGH_CONSUMPTION' 
  | 'ANOMALY' 
  | 'PEAK_DEMAND' 
  | 'IDLE_MACHINE' 
  | 'FAULT' 
  | 'ENERGY_OPTIMIZATION';

export interface DemoScenario {
  id: DemoScenarioId;
  name: string;
  description: string;
  targetMachineId?: string;
  expectedBehavior: string;
}

export interface FactorySummary {
  totalPowerKw: number;
  totalEnergyKwh: number;
  activeMachines: number;
  totalMachines: number;
  factoryEfficiency: number;
  energySavedTodayKwh: number;
  costSavedToday: number;
  co2SavedTodayKg: number;
  activeAlertsCount: number;
  pendingDecisionsCount: number;
  currentPeakKw: number;
  peakThresholdKw: number;
  isPeakWarning: boolean;
  simulationSpeed: number;
  simulationRunning: boolean;
  aiMode: AIMode;
}

export interface EnergyAnalytics {
  daily: { date: string; consumptionKwh: number; cost: number; baselineKwh: number; savingsKwh: number }[];
  hourly: { hour: string; consumptionKwh: number; peakPowerKw: number }[];
  byDepartment: { department: Department; consumptionKwh: number; percentage: number; cost: number }[];
  byMachine: { machineId: string; name: string; consumptionKwh: number; cost: number; efficiencyScore: number }[];
  baselineComparison: {
    totalActualKwh: number;
    totalBaselineKwh: number;
    totalSavedKwh: number;
    efficiencyGainPercent: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  cites?: {
    type: 'machine' | 'alert' | 'decision' | 'saving';
    id: string;
    label: string;
  }[];
}
