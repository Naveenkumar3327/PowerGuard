/**
 * POWERGUARD Digital Factory / Machine Simulator Engine
 * High-fidelity real-time physics & electrical state machine simulation for 8 industrial machines.
 * Strictly operates in safe simulation mode with zero physical hardware hazard.
 */
import { 
  Machine, 
  MachineStatus, 
  SimulatedCommandType, 
  Telemetry, 
  DemoScenarioId, 
  Department, 
  ProductionPriority 
} from '@powerguard/shared-types';

export class SimulationEngine {
  private machines: Map<string, Machine> = new Map();
  private isRunning: boolean = true;
  private speedMultiplier: number = 1;
  private activeScenario: DemoScenarioId = 'NORMAL';
  private timer: NodeJS.Timeout | null = null;
  private telemetryListeners: ((telemetries: Telemetry[]) => void)[] = [];
  private lastTickTime: number = Date.now();

  constructor() {
    this.initializeDefaultMachines();
  }

  private initializeDefaultMachines(): void {
    const initialMachines: Machine[] = [
      {
        machineId: 'M-001',
        name: '5-Axis CNC Milling Machine',
        type: 'CNC Machine',
        department: 'Production',
        status: 'RUNNING',
        voltage: 400.0,
        current: 60.5,
        powerFactor: 0.94,
        powerKw: 39.4,
        energyKwh: 3420.5,
        loadPercentage: 82.0,
        temperature: 48.2,
        operatingHours: 1420.0,
        productionPriority: 'CRITICAL',
        efficiencyScore: 92.5,
        ratedPowerKw: 45.0,
      },
      {
        machineId: 'M-002',
        name: 'Industrial Screw Compressor',
        type: 'Compressor',
        department: 'Utilities',
        status: 'RUNNING',
        voltage: 402.0,
        current: 44.8,
        powerFactor: 0.91,
        powerKw: 28.4,
        energyKwh: 2810.0,
        loadPercentage: 74.0,
        temperature: 52.1,
        operatingHours: 1890.0,
        productionPriority: 'HIGH',
        efficiencyScore: 89.0,
        ratedPowerKw: 37.0,
      },
      {
        machineId: 'M-003',
        name: 'Hydraulic Injection Molding Machine',
        type: 'Injection Molding',
        department: 'Production',
        status: 'RUNNING',
        voltage: 398.0,
        current: 72.0,
        powerFactor: 0.93,
        powerKw: 46.2,
        energyKwh: 4120.0,
        loadPercentage: 84.0,
        temperature: 56.4,
        operatingHours: 2150.0,
        productionPriority: 'CRITICAL',
        efficiencyScore: 94.0,
        ratedPowerKw: 55.0,
      },
      {
        machineId: 'M-004',
        name: 'Automated Sorting & Conveyor',
        type: 'Conveyor',
        department: 'Assembly',
        status: 'IDLE',
        voltage: 401.0,
        current: 17.5,
        powerFactor: 0.86,
        powerKw: 10.5,
        energyKwh: 1250.0,
        loadPercentage: 5.0,
        temperature: 34.0,
        operatingHours: 940.0,
        productionPriority: 'LOW',
        efficiencyScore: 68.0,
        ratedPowerKw: 15.0,
      },
      {
        machineId: 'M-005',
        name: 'High-Pressure Chilled Water Pump',
        type: 'Industrial Pump',
        department: 'Utilities',
        status: 'RUNNING',
        voltage: 400.0,
        current: 28.0,
        powerFactor: 0.92,
        powerKw: 17.8,
        energyKwh: 1840.0,
        loadPercentage: 78.0,
        temperature: 42.5,
        operatingHours: 1620.0,
        productionPriority: 'MEDIUM',
        efficiencyScore: 91.0,
        ratedPowerKw: 22.0,
      },
      {
        machineId: 'M-006',
        name: 'Factory Central HVAC Chiller Unit',
        type: 'HVAC Unit',
        department: 'HVAC',
        status: 'RUNNING',
        voltage: 405.0,
        current: 48.0,
        powerFactor: 0.90,
        powerKw: 30.3,
        energyKwh: 3650.0,
        loadPercentage: 72.0,
        temperature: 39.8,
        operatingHours: 2800.0,
        productionPriority: 'MEDIUM',
        efficiencyScore: 88.0,
        ratedPowerKw: 40.0,
      },
      {
        machineId: 'M-007',
        name: 'Robotic Spot Welding Machine',
        type: 'Welding Machine',
        department: 'Assembly',
        status: 'RUNNING',
        voltage: 399.0,
        current: 36.0,
        powerFactor: 0.91,
        powerKw: 22.7,
        energyKwh: 1980.0,
        loadPercentage: 75.0,
        temperature: 46.0,
        operatingHours: 1120.0,
        productionPriority: 'HIGH',
        efficiencyScore: 90.0,
        ratedPowerKw: 30.0,
      },
      {
        machineId: 'M-008',
        name: 'High-Speed Packaging Machine',
        type: 'Packaging Machine',
        department: 'Packaging',
        status: 'RUNNING',
        voltage: 400.0,
        current: 14.5,
        powerFactor: 0.93,
        powerKw: 9.3,
        energyKwh: 890.0,
        loadPercentage: 76.0,
        temperature: 36.2,
        operatingHours: 780.0,
        productionPriority: 'LOW',
        efficiencyScore: 92.0,
        ratedPowerKw: 12.0,
      },
    ];

    initialMachines.forEach((m) => this.machines.set(m.machineId, m));
  }

  public start(intervalMs: number = 2000): void {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = true;
    this.lastTickTime = Date.now();
    this.timer = setInterval(() => this.tick(), intervalMs);
    console.log(`[SimulationEngine] Simulator active (interval: ${intervalMs}ms, speed: ${this.speedMultiplier}x)`);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[SimulationEngine] Simulator paused.');
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = Math.max(1, Math.min(10, multiplier));
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      speedMultiplier: this.speedMultiplier,
      activeScenario: this.activeScenario,
      machineCount: this.machines.size,
    };
  }

  public getMachines(): Machine[] {
    return Array.from(this.machines.values());
  }

  public getMachine(machineId: string): Machine | undefined {
    return this.machines.get(machineId);
  }

  public onTelemetry(listener: (telemetries: Telemetry[]) => void): void {
    this.telemetryListeners.push(listener);
  }

  /**
   * Main simulation tick.
   * Updates state, computes 3-phase electrical formulas, accumulates energy, and emits telemetry.
   */
  public tick(): Telemetry[] {
    const now = Date.now();
    const dtSeconds = ((now - this.lastTickTime) / 1000) * this.speedMultiplier;
    this.lastTickTime = now;

    const telemetryBatch: Telemetry[] = [];

    for (const machine of this.machines.values()) {
      // 1. Realistic Voltage oscillation (industrial grid ripple 395V - 405V)
      machine.voltage = 398.0 + (Math.sin(now / 5000 + parseInt(machine.machineId.slice(-1))) * 4.0);

      // 2. State-dependent load & power physics
      if (machine.status === 'RUNNING') {
        // Minor natural operational jitter (+- 3%)
        const jitter = (Math.random() - 0.5) * 3.0;
        machine.loadPercentage = Math.max(15, Math.min(100, machine.loadPercentage + jitter));
        
        // Active Power (kW): base idle power + load portion of rated power
        const baseIdlePower = machine.ratedPowerKw * 0.12;
        const usefulPower = (machine.loadPercentage / 100) * (machine.ratedPowerKw - baseIdlePower);
        machine.powerKw = Math.round((baseIdlePower + usefulPower) * 10) / 10;

        // Current (Amps) = (PowerKw * 1000) / (sqrt(3) * Voltage * PowerFactor)
        const v = machine.voltage;
        const pf = machine.powerFactor || 0.92;
        machine.current = Math.round(((machine.powerKw * 1000) / (Math.sqrt(3) * v * pf)) * 10) / 10;

        // Thermodynamic heat generation: target temp = 25 + (load * 0.4)
        const targetTemp = 25 + (machine.loadPercentage * 0.42);
        machine.temperature += (targetTemp - machine.temperature) * 0.05 * (dtSeconds / 2);
        machine.temperature = Math.round(machine.temperature * 10) / 10;

        // Efficiency score tracks power factor and optimal loading zone (65-85% is sweet spot)
        let eff = 95 - Math.abs(machine.loadPercentage - 75) * 0.25 - (1.0 - machine.powerFactor) * 50;
        machine.efficiencyScore = Math.max(60, Math.min(99, Math.round(eff * 10) / 10));

      } else if (machine.status === 'IDLE') {
        machine.loadPercentage = Math.max(1, Math.min(8, machine.loadPercentage));
        // Idle power is ~15-25% rated power unless put in standby!
        machine.powerKw = Math.round((machine.ratedPowerKw * 0.20) * 10) / 10;
        machine.current = Math.round(((machine.powerKw * 1000) / (Math.sqrt(3) * machine.voltage * machine.powerFactor)) * 10) / 10;
        // Cools towards ambient (28°C)
        machine.temperature += (28.0 - machine.temperature) * 0.04 * (dtSeconds / 2);
        machine.temperature = Math.round(machine.temperature * 10) / 10;
        machine.efficiencyScore = 65.0; // poor efficiency when idling

      } else if (machine.status === 'STANDBY') {
        machine.loadPercentage = 0.5;
        // Standby draws minimal parasitic power (~2-4% rated power)
        machine.powerKw = Math.max(0.4, Math.round((machine.ratedPowerKw * 0.03) * 10) / 10);
        machine.current = Math.round(((machine.powerKw * 1000) / (Math.sqrt(3) * machine.voltage * 0.85)) * 10) / 10;
        machine.temperature += (25.0 - machine.temperature) * 0.05 * (dtSeconds / 2);
        machine.temperature = Math.round(machine.temperature * 10) / 10;
        machine.efficiencyScore = 96.0; // standby is efficient energy conservation

      } else if (machine.status === 'FAULT') {
        // High thermal/electrical fault condition
        machine.loadPercentage = 0.0;
        machine.powerKw = 2.5; // residual parasitic fault draw
        machine.temperature = Math.min(95.0, machine.temperature + 0.3 * dtSeconds);
        machine.temperature = Math.round(machine.temperature * 10) / 10;
        machine.efficiencyScore = 30.0;

      } else {
        // OFFLINE or MAINTENANCE
        machine.loadPercentage = 0;
        machine.powerKw = 0;
        machine.current = 0;
        machine.temperature += (25.0 - machine.temperature) * 0.05 * (dtSeconds / 2);
        machine.temperature = Math.round(machine.temperature * 10) / 10;
        machine.efficiencyScore = 0;
      }

      // 3. Energy Accumulation (kWh) = Power(kW) * Time(hours)
      const energyDeltaKwh = (machine.powerKw * (dtSeconds / 3600));
      machine.energyKwh = Math.round((machine.energyKwh + energyDeltaKwh) * 100) / 100;
      machine.operatingHours += (dtSeconds / 3600);

      // Create telemetry record
      const tel: Telemetry = {
        machineId: machine.machineId,
        timestamp: new Date().toISOString(),
        voltage: Math.round(machine.voltage * 10) / 10,
        current: machine.current,
        powerFactor: machine.powerFactor,
        powerKw: machine.powerKw,
        energyKwh: machine.energyKwh,
        loadPercentage: Math.round(machine.loadPercentage * 10) / 10,
        temperature: machine.temperature,
        status: machine.status,
        isAnomaly: machine.status === 'FAULT' || machine.powerKw > machine.ratedPowerKw * 1.15,
      };

      telemetryBatch.push(tel);
    }

    // Broadcast to registered listeners
    for (const listener of this.telemetryListeners) {
      try {
        listener(telemetryBatch);
      } catch (err) {
        console.error('[SimulationEngine] Error notifying telemetry listener:', err);
      }
    }

    return telemetryBatch;
  }

  /**
   * Safe Simulated Command Execution.
   * Modifies virtual machine state in the Digital Twin without touching physical PLCs.
   */
  public executeSimulatedCommand(
    machineId: string, 
    command: SimulatedCommandType, 
    parameters?: Record<string, any>
  ): { success: boolean; message: string; machine?: Machine } {
    const machine = this.machines.get(machineId);
    if (!machine) {
      return { success: false, message: `Machine ${machineId} not found in Digital Twin` };
    }

    // Safety Interlocks
    if (machine.productionPriority === 'CRITICAL' && (command === 'STOP_MACHINE' || command === 'ENTER_STANDBY')) {
      return { 
        success: false, 
        message: `Safety Interlock Triggered: Cannot shut down CRITICAL machine ${machineId} without manual bypass.` 
      };
    }

    if (machine.status === 'MAINTENANCE' && command === 'START_MACHINE') {
      return { 
        success: false, 
        message: `Safety Interlock Triggered: Machine ${machineId} is locked out for physical maintenance.` 
      };
    }

    switch (command) {
      case 'ENTER_STANDBY':
        machine.status = 'STANDBY';
        machine.loadPercentage = 1.0;
        break;

      case 'EXIT_STANDBY':
      case 'START_MACHINE':
        machine.status = 'RUNNING';
        machine.loadPercentage = parameters?.targetLoad || 65.0;
        break;

      case 'STOP_MACHINE':
        machine.status = 'IDLE';
        machine.loadPercentage = 0.0;
        break;

      case 'REDUCE_LOAD':
        machine.loadPercentage = Math.max(20.0, machine.loadPercentage * 0.75);
        break;

      case 'INCREASE_LOAD':
        machine.loadPercentage = Math.min(95.0, machine.loadPercentage * 1.25);
        break;

      case 'RESET_FAULT':
        machine.status = 'IDLE';
        machine.loadPercentage = 0.0;
        machine.temperature = 38.0;
        break;

      default:
        break;
    }

    // Recalculate immediate power
    this.tick();

    return {
      success: true,
      message: `Simulated command [${command}] executed on ${machine.name} (${machineId}) in Digital Twin.`,
      machine,
    };
  }

  /**
   * Set Demo Scenario.
   * Adjusts machine conditions to demonstrate specific AI and optimization workflows.
   */
  public setScenario(scenarioId: DemoScenarioId): { success: boolean; scenario: DemoScenarioId; message: string } {
    this.activeScenario = scenarioId;

    switch (scenarioId) {
      case 'NORMAL':
        this.initializeDefaultMachines();
        return { success: true, scenario: scenarioId, message: 'Factory reset to standard balanced operations.' };

      case 'HIGH_CONSUMPTION':
        // M-003 Hydraulic Injection surges to 98% load near rated 55kW
        const m3 = this.machines.get('M-003');
        if (m3) {
          m3.status = 'RUNNING';
          m3.loadPercentage = 98.0;
          m3.powerKw = 53.5;
          m3.temperature = 68.0;
        }
        return { success: true, scenario: scenarioId, message: 'Scenario HIGH_CONSUMPTION: M-003 load increased to 98%.' };

      case 'ANOMALY':
        // M-002 Industrial Compressor suffers severe power factor degradation and heat spike
        const m2 = this.machines.get('M-002');
        if (m2) {
          m2.status = 'RUNNING';
          m2.powerFactor = 0.68;
          m2.temperature = 78.5;
          m2.loadPercentage = 92.0;
          m2.powerKw = 36.2;
        }
        return { success: true, scenario: scenarioId, message: 'Scenario ANOMALY: M-002 compressor PF degraded to 0.68 with thermal surge.' };

      case 'PEAK_DEMAND':
        // Ramp multiple machines up to simulate impending factory peak threshold breach (>160kW)
        for (const m of this.machines.values()) {
          if (m.status !== 'MAINTENANCE' && m.status !== 'OFFLINE') {
            m.status = 'RUNNING';
            m.loadPercentage = Math.min(95.0, m.loadPercentage * 1.35);
          }
        }
        return { success: true, scenario: scenarioId, message: 'Scenario PEAK_DEMAND: Factory total power driven past peak threshold (160 kW).' };

      case 'IDLE_MACHINE':
        // M-004 Conveyor idling at 3% load while drawing 11 kW
        const m4 = this.machines.get('M-004');
        if (m4) {
          m4.status = 'IDLE';
          m4.loadPercentage = 3.0;
          m4.powerKw = 11.2;
          m4.temperature = 33.0;
        }
        return { success: true, scenario: scenarioId, message: 'Scenario IDLE_MACHINE: M-004 conveyor idling drawing baseline power.' };

      case 'FAULT':
        // M-007 Welding machine thermal overload trip
        const m7 = this.machines.get('M-007');
        if (m7) {
          m7.status = 'FAULT';
          m7.temperature = 89.0;
          m7.loadPercentage = 0.0;
        }
        return { success: true, scenario: scenarioId, message: 'Scenario FAULT: M-007 welding robot tripped into thermal FAULT (89°C).' };

      case 'ENERGY_OPTIMIZATION':
        // Puts M-004 Conveyor and M-008 Packaging into idle, prime for AI optimizer
        const m4opt = this.machines.get('M-004');
        const m8opt = this.machines.get('M-008');
        if (m4opt) {
          m4opt.status = 'IDLE';
          m4opt.loadPercentage = 4.0;
          m4opt.powerKw = 10.8;
        }
        if (m8opt) {
          m8opt.status = 'IDLE';
          m8opt.loadPercentage = 5.0;
          m8opt.powerKw = 7.5;
        }
        return { success: true, scenario: scenarioId, message: 'Scenario ENERGY_OPTIMIZATION: Non-critical machines set to idle awaiting AI standby recommendations.' };

      default:
        return { success: true, scenario: scenarioId, message: `Scenario ${scenarioId} activated.` };
    }
  }

  /**
   * Manual Fault Injection for a specific machine
   */
  public injectFault(machineId: string, faultType: string = 'OVERHEATING'): boolean {
    const machine = this.machines.get(machineId);
    if (!machine) return false;

    machine.status = 'FAULT';
    machine.temperature = 92.0;
    machine.efficiencyScore = 25.0;
    this.tick();
    return true;
  }
}

// Global Singleton Simulator instance
export const simulator = new SimulationEngine();
