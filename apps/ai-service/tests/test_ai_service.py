import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models.schemas import MachineTelemetryInput
from agents import (
    EnergyMonitoringAgent,
    AnomalyDetectionAgent,
    EnergyForecastingAgent,
    EnergyOptimizationAgent,
    MachineControlAgent,
    AlertIncidentAgent,
    SupervisorAgent
)

def test_all_agents():
    print("Testing 7 Cooperative Agents...")
    
    # Sample machines
    m1 = MachineTelemetryInput(
        machineId="M-001",
        name="5-Axis CNC Milling Machine",
        type="CNC Machine",
        department="Production",
        voltage=400.0,
        current=65.0,
        powerFactor=0.92,
        powerKw=41.4,
        energyKwh=150.0,
        loadPercentage=85.0,
        temperature=45.0,
        status="RUNNING",
        operatingHours=1200.0,
        productionPriority="CRITICAL",
        ratedPowerKw=45.0
    )

    m4_idle = MachineTelemetryInput(
        machineId="M-004",
        name="Automated Conveyor System",
        type="Conveyor",
        department="Assembly",
        voltage=400.0,
        current=18.0,
        powerFactor=0.88,
        powerKw=11.0,
        energyKwh=95.0,
        loadPercentage=4.0,
        temperature=32.0,
        status="IDLE",
        operatingHours=850.0,
        productionPriority="LOW",
        ratedPowerKw=15.0
    )

    machines = [m1, m4_idle]

    # 1. Monitoring Agent
    mon_agent = EnergyMonitoringAgent()
    mon_results = mon_agent.analyze_all(machines)
    assert len(mon_results) == 2
    assert mon_results[1].idleWasteDetected is True
    print("[OK] EnergyMonitoringAgent passed: Detected idle waste on M-004")

    # 2. Anomaly Agent
    anom_agent = AnomalyDetectionAgent()
    anom_result = anom_agent.detect(m1)
    assert anom_result.machineId == "M-001"
    print("[OK] AnomalyDetectionAgent passed")

    # 3. Forecasting Agent
    forecast_agent = EnergyForecastingAgent()
    forecast = forecast_agent.forecast(horizon="24h", current_total_power_kw=52.4, peak_threshold_kw=160.0)
    assert forecast.predictedTotalPowerKw > 0
    assert len(forecast.dataPoints) == 24
    print(f"[OK] EnergyForecastingAgent passed: 24h peak predicted at {forecast.peakTime} ({forecast.predictedPeakKw} kW)")

    # 4. Optimization Agent
    opt_agent = EnergyOptimizationAgent()
    opt_results = opt_agent.optimize(machines=machines, peak_threshold_kw=160.0)
    assert len(opt_results.recommendations) >= 2
    standby_rec = next((r for r in opt_results.recommendations if r.action == "ENTER_STANDBY"), None)
    assert standby_rec is not None
    assert standby_rec.machineId == "M-004"
    print(f"[OK] EnergyOptimizationAgent passed: Recommended ENTER_STANDBY for M-004 saving {standby_rec.expectedSavingKwh} kWh")

    # 5. Machine Control Agent
    control_agent = MachineControlAgent()
    cmd = control_agent.generate_simulated_command(
        action="ENTER_STANDBY",
        machine_id="M-004",
        machine_state=m4_idle.model_dump()
    )
    assert cmd["simulation"] is True
    assert cmd["success"] is True
    assert cmd["command"]["targetState"]["status"] == "STANDBY"
    print("[OK] MachineControlAgent passed: Generated safe simulated command")

    # 6. Alert Agent
    alert_agent = AlertIncidentAgent()
    alerts = alert_agent.evaluate(monitoring_results=mon_results, anomaly_results=[anom_result])
    assert len(alerts) >= 1
    print(f"[OK] AlertIncidentAgent passed: Generated {len(alerts)} alert(s)")

    # 7. Supervisor Agent
    sup_agent = SupervisorAgent()
    decisions = sup_agent.supervise_and_explain(
        monitoring=mon_results,
        anomalies=[anom_result],
        forecast=forecast,
        recommendations=opt_results.recommendations,
        machines=machines
    )
    assert len(decisions) >= 1
    m4_dec = next((d for d in decisions if d.machineId == "M-004"), None)
    assert m4_dec is not None
    assert m4_dec.approved is True
    assert "M-004" in m4_dec.explanation.problem
    print("[OK] SupervisorAgent passed: Full explainability generated")

    print("\nALL 7 MULTI-AGENT ENGINES VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_all_agents()
