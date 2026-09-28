"""
Agent 4: Energy Optimization Agent
Generates energy-saving recommendations while strictly respecting industrial production constraints.
Never shuts down CRITICAL machines; prioritizes low-hanging standby savings on idle non-critical machines.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from models.schemas import MachineTelemetryInput, OptimizationRecommendation, OptimizationResult

class EnergyOptimizationAgent:
    def __init__(self):
        self.name = "EnergyOptimizationAgent"

    def optimize(
        self,
        machines: List[MachineTelemetryInput],
        forecast: Optional[Dict[str, Any]] = None,
        energy_tariff: float = 0.15,
        peak_tariff: float = 0.28,
        peak_threshold_kw: float = 160.0
    ) -> OptimizationResult:
        recommendations: List[OptimizationRecommendation] = []
        total_potential_savings = 0.0

        # Calculate current total factory load
        total_factory_load = sum(m.powerKw for m in machines)
        forecast_peak_kw = forecast.get("predictedPeakKw", total_factory_load) if forecast else total_factory_load
        is_peak_impending = forecast_peak_kw >= peak_threshold_kw

        for m in machines:
            # Rule 1: Safety & Maintenance checks
            if m.status in ["MAINTENANCE", "OFFLINE"]:
                continue
            if m.status == "FAULT":
                recommendations.append(OptimizationRecommendation(
                    action="RESET_FAULT",
                    machineId=m.machineId,
                    expectedSavingKwh=0.0,
                    reason=f"Machine {m.machineId} is in FAULT state ({m.temperature:.1f}°C). Requires maintenance inspection before operational restart.",
                    confidence=0.99,
                    affectedProduction="Immediate safety isolation",
                    priority=m.productionPriority
                ))
                continue

            # Rule 2: Idle Machine Standby (Major Energy Optimization)
            # Low or Medium priority machines idling with high energy draw
            if (m.status == "IDLE" or (m.status == "RUNNING" and m.loadPercentage < 12.0)) and m.powerKw > 2.0:
                if m.productionPriority in ["LOW", "MEDIUM"]:
                    # Standby drops power to ~5% of rated capacity
                    standby_power = max(0.4, m.ratedPowerKw * 0.05)
                    hourly_saving = max(0.5, m.powerKw - standby_power)
                    recommendations.append(OptimizationRecommendation(
                        action="ENTER_STANDBY",
                        machineId=m.machineId,
                        expectedSavingKwh=round(hourly_saving, 2),
                        reason=f"Machine has remained idle drawing {m.powerKw:.1f} kW. Transitioning to standby will conserve ~{hourly_saving:.1f} kWh/hour without impacting production throughput.",
                        confidence=0.94 if m.productionPriority == "LOW" else 0.88,
                        affectedProduction="Zero throughput impact; restart time < 90 seconds",
                        priority=m.productionPriority
                    ))
                    total_potential_savings += hourly_saving
                elif m.productionPriority == "HIGH":
                    # For HIGH priority, suggest soft standby with supervisor confirmation
                    standby_power = max(0.8, m.ratedPowerKw * 0.08)
                    hourly_saving = max(1.0, m.powerKw - standby_power)
                    recommendations.append(OptimizationRecommendation(
                        action="ENTER_STANDBY",
                        machineId=m.machineId,
                        expectedSavingKwh=round(hourly_saving, 2),
                        reason=f"Machine {m.machineId} has no active batch in queue. Soft standby saves {hourly_saving:.1f} kWh/hr subject to supervisor sign-off.",
                        confidence=0.82,
                        affectedProduction="Requires operator verification of upcoming job queue",
                        priority=m.productionPriority
                    ))
                    total_potential_savings += hourly_saving

            # Rule 3: Impending Peak Demand Shedding
            # If aggregate load threatens peak tariff threshold, throttle non-critical machines
            elif is_peak_impending and m.productionPriority in ["LOW", "MEDIUM"] and m.loadPercentage > 70.0:
                saving_kw = m.powerKw * 0.25 # 25% load trim
                recommendations.append(OptimizationRecommendation(
                    action="REDUCE_LOAD",
                    machineId=m.machineId,
                    expectedSavingKwh=round(saving_kw, 2),
                    reason=f"Forecast predicts aggregate peak of {forecast_peak_kw:.1f} kW exceeding the {peak_threshold_kw:.1f} kW peak tariff bracket. Trimming auxiliary load reduces peak penalties.",
                    confidence=0.89,
                    affectedProduction=f"Non-critical operation paced down by 25% during peak window",
                    priority=m.productionPriority
                ))
                total_potential_savings += saving_kw

            # Rule 4: Overloaded Machine Optimization
            elif m.loadPercentage > 92.0 and m.productionPriority != "CRITICAL":
                saving_kw = m.powerKw * 0.15
                recommendations.append(OptimizationRecommendation(
                    action="REDUCE_LOAD",
                    machineId=m.machineId,
                    expectedSavingKwh=round(saving_kw, 2),
                    reason=f"Machine is operating at excessive load ({m.loadPercentage:.0f}%) causing heat accumulation ({m.temperature:.1f}°C) and non-linear electrical losses.",
                    confidence=0.91,
                    affectedProduction="Rebalances job queue to prevent thermal stress",
                    priority=m.productionPriority
                ))
                total_potential_savings += saving_kw

            # Rule 5: Critical Machine Safeguard
            elif m.productionPriority == "CRITICAL" and m.status == "RUNNING":
                # Critical machines are kept running to protect assembly line throughput
                recommendations.append(OptimizationRecommendation(
                    action="KEEP_RUNNING",
                    machineId=m.machineId,
                    expectedSavingKwh=0.0,
                    reason=f"Production priority is CRITICAL. Main line throughput protected against automatic shutdowns.",
                    confidence=0.99,
                    affectedProduction="Core production path maintained",
                    priority=m.productionPriority
                ))

        return OptimizationResult(
            agent=self.name,
            recommendations=recommendations,
            totalPotentialSavingsKwh=round(total_potential_savings, 2),
            timestamp=datetime.utcnow().isoformat()
        )
