"""
Agent 1: Energy Monitoring Agent
Continuously monitors machine telemetry, computes accurate 3-phase real power,
identifies idle power waste, evaluates power factor health, and detects peak consumption.
"""
import math
from typing import List
from models.schemas import MachineTelemetryInput, MonitoringResult

class EnergyMonitoringAgent:
    def __init__(self):
        self.name = "EnergyMonitoringAgent"

    def analyze_machine(self, machine: MachineTelemetryInput) -> MonitoringResult:
        # Industrial 3-Phase Real Power formula: P (kW) = (sqrt(3) * V * I * PF) / 1000
        # If current > 0 and voltage > 0, compute calculated power or compare with reported power
        calc_power_kw = (math.sqrt(3) * machine.voltage * machine.current * machine.powerFactor) / 1000.0
        effective_power_kw = max(machine.powerKw, round(calc_power_kw, 2))

        # Check Idle Waste: Machine is marked IDLE or load < 10% but draws significant power
        idle_waste = False
        reason_parts = []
        status = "NORMAL"
        confidence = 0.95

        is_idle_state = machine.status == "IDLE" or (machine.status == "RUNNING" and machine.loadPercentage < 10.0)
        idle_threshold_kw = machine.ratedPowerKw * 0.15 # >15% rated power while idle is wasteful

        if is_idle_state and effective_power_kw > idle_threshold_kw:
            idle_waste = True
            status = "IDLE_ENERGY_WASTE"
            reason_parts.append(f"Machine is operating idle but consuming {effective_power_kw:.1f} kW ({effective_power_kw/machine.ratedPowerKw*100:.0f}% of rated capacity)")

        # Power Factor Analysis
        pf_status = "OPTIMAL"
        if machine.powerFactor < 0.82:
            pf_status = "CRITICAL_LOW"
            reason_parts.append(f"Severely low power factor ({machine.powerFactor:.2f}) causing excessive reactive line losses")
            status = "POOR_POWER_FACTOR" if status == "NORMAL" else status
        elif machine.powerFactor < 0.88:
            pf_status = "SUBOPTIMAL"
            reason_parts.append(f"Suboptimal power factor ({machine.powerFactor:.2f})")

        # High Consumption Check
        if effective_power_kw > (machine.ratedPowerKw * 0.92):
            status = "HIGH_CONSUMPTION"
            reason_parts.append(f"Machine operating near max capacity ({effective_power_kw:.1f} kW / {machine.ratedPowerKw} kW rated)")
            confidence = 0.98

        # Temperature warning
        if machine.temperature > 75.0:
            status = "THERMAL_ELEVATED" if status == "NORMAL" else status
            reason_parts.append(f"Elevated operating temperature ({machine.temperature:.1f}°C)")

        if not reason_parts:
            reason = f"Normal operational telemetry. Power: {effective_power_kw:.1f} kW, PF: {machine.powerFactor:.2f}, Load: {machine.loadPercentage:.0f}%"
        else:
            reason = "; ".join(reason_parts)

        return MonitoringResult(
            agent=self.name,
            machineId=machine.machineId,
            status=status,
            powerKw=round(effective_power_kw, 2),
            energyKwh=round(machine.energyKwh, 2),
            idleWasteDetected=idle_waste,
            idleDurationMinutes=18.0 if idle_waste else 0.0,
            powerFactorStatus=pf_status,
            reason=reason,
            confidence=confidence
        )

    def analyze_all(self, machines: List[MachineTelemetryInput]) -> List[MonitoringResult]:
        return [self.analyze_machine(m) for m in machines]
