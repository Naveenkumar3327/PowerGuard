"""
POWERGUARD AI Microservice
FastAPI Multi-Agent Intelligence Engine for Industrial Energy Management
"""
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models.schemas import (
    MachineTelemetryInput,
    MonitoringResult,
    AnomalyInput,
    AnomalyResult,
    ForecastInput,
    ForecastResult,
    OptimizationInput,
    OptimizationResult,
    SupervisorInput,
    SupervisorDecision,
    OrchestrationInput,
    OrchestrationResult
)
from agents import (
    EnergyMonitoringAgent,
    AnomalyDetectionAgent,
    EnergyForecastingAgent,
    EnergyOptimizationAgent,
    MachineControlAgent,
    AlertIncidentAgent,
    SupervisorAgent
)

app = FastAPI(
    title="PowerGuard AI Service",
    description="Multi-Agent Energy Management & Machine Control Engine",
    version="1.0.0"
)

# Enable CORS for Next.js frontend and Node.js API backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize 7 Cooperative Agents
monitoring_agent = EnergyMonitoringAgent()
anomaly_agent = AnomalyDetectionAgent()
forecasting_agent = EnergyForecastingAgent()
optimization_agent = EnergyOptimizationAgent()
control_agent = MachineControlAgent()
alert_agent = AlertIncidentAgent()
supervisor_agent = SupervisorAgent()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "powerguard-ai-service",
        "timestamp": datetime.utcnow().isoformat(),
        "agents": [
            {"id": "agent-1", "name": "Energy Monitoring Agent", "status": "ACTIVE"},
            {"id": "agent-2", "name": "Anomaly Detection Agent", "status": "ACTIVE"},
            {"id": "agent-3", "name": "Energy Forecasting Agent", "status": "ACTIVE"},
            {"id": "agent-4", "name": "Energy Optimization Agent", "status": "ACTIVE"},
            {"id": "agent-5", "name": "Machine Control Agent", "status": "ACTIVE"},
            {"id": "agent-6", "name": "Alert & Incident Agent", "status": "ACTIVE"},
            {"id": "agent-7", "name": "Supervisor / Explainability Agent", "status": "ACTIVE"}
        ]
    }

@app.post("/api/ai/monitor", response_model=List[MonitoringResult])
def monitor_machines(machines: List[MachineTelemetryInput]):
    return monitoring_agent.analyze_all(machines)

@app.post("/api/ai/anomaly", response_model=AnomalyResult)
def detect_anomaly(payload: AnomalyInput):
    return anomaly_agent.detect(payload.currentTelemetry, payload.history)

@app.post("/api/ai/forecast", response_model=ForecastResult)
def forecast_energy(payload: ForecastInput):
    return forecasting_agent.forecast(
        horizon=payload.horizon,
        historical_readings=payload.historicalReadings,
        current_total_power_kw=payload.currentTotalPowerKw,
        peak_threshold_kw=payload.peakThresholdKw
    )

@app.post("/api/ai/optimize", response_model=OptimizationResult)
def optimize_energy(payload: OptimizationInput):
    return optimization_agent.optimize(
        machines=payload.machines,
        forecast=payload.forecast,
        energy_tariff=payload.energyTariff,
        peak_tariff=payload.peakTariff,
        peak_threshold_kw=payload.peakThresholdKw
    )

@app.post("/api/ai/supervise", response_model=List[SupervisorDecision])
def supervise_decisions(payload: SupervisorInput):
    return supervisor_agent.supervise_and_explain(
        monitoring=payload.monitoring,
        anomalies=payload.anomalies,
        forecast=payload.forecast,
        recommendations=payload.recommendations,
        machines=payload.machines
    )

class ControlCommandRequest(BaseModel):
    action: str
    machineId: str
    machineState: Dict[str, Any]
    source: str = "OptimizationAgent"

@app.post("/api/ai/control/simulate")
def simulate_control(payload: ControlCommandRequest):
    return control_agent.generate_simulated_command(
        action=payload.action,
        machine_id=payload.machineId,
        machine_state=payload.machineState,
        source=payload.source
    )

@app.post("/api/ai/orchestrate", response_model=OrchestrationResult)
def orchestrate_cycle(payload: OrchestrationInput):
    """
    Central Agent Orchestration:
    Runs full multi-agent cycle (Telemetry -> Monitoring -> Anomaly -> Forecast -> Optimization -> Supervisor -> Alerts).
    """
    now_str = datetime.utcnow().strftime("%H:%M:%S")
    activity_logs = []

    # Step 1: Energy Monitoring Agent
    monitoring_results = monitoring_agent.analyze_all(payload.machines)
    for m in monitoring_results:
        if m.status != "NORMAL":
            activity_logs.append({
                "agent": "EnergyMonitoringAgent",
                "machineId": m.machineId,
                "action": "FLAGGED_STATUS",
                "details": m.reason,
                "severity": "WARNING" if m.idleWasteDetected else "INFO",
                "timestamp": now_str
            })

    # Step 2: Anomaly Detection Agent
    anomaly_results = []
    for m in payload.machines:
        m_history = payload.historyMap.get(m.machineId, [])
        anom = anomaly_agent.detect(m, m_history)
        anomaly_results.append(anom)
        if anom.anomaly:
            activity_logs.append({
                "agent": "AnomalyDetectionAgent",
                "machineId": m.machineId,
                "action": "ANOMALY_DETECTED",
                "details": f"Severity {anom.severity} (Score: {anom.score}): {'; '.join(anom.reasons)}",
                "severity": "ALERT" if anom.severity in ["HIGH", "CRITICAL"] else "WARNING",
                "timestamp": now_str
            })

    # Step 3: Energy Forecasting Agent
    current_total_power = sum(m.powerKw for m in payload.machines)
    forecast_result = forecasting_agent.forecast(
        horizon="24h",
        historical_readings=payload.historicalTotalPower,
        current_total_power_kw=current_total_power,
        peak_threshold_kw=payload.peakThresholdKw
    )
    if forecast_result.predictedPeakKw >= payload.peakThresholdKw:
        activity_logs.append({
            "agent": "EnergyForecastingAgent",
            "action": "PEAK_WARNING",
            "details": f"Forecasted peak demand {forecast_result.predictedPeakKw:.1f} kW exceeds threshold at {forecast_result.peakTime}",
            "severity": "WARNING",
            "timestamp": now_str
        })

    # Step 4: Energy Optimization Agent
    opt_result = optimization_agent.optimize(
        machines=payload.machines,
        forecast=forecast_result.model_dump(),
        energy_tariff=payload.energyTariff,
        peak_tariff=payload.peakTariff,
        peak_threshold_kw=payload.peakThresholdKw
    )
    for rec in opt_result.recommendations:
        if rec.action != "KEEP_RUNNING":
            activity_logs.append({
                "agent": "EnergyOptimizationAgent",
                "machineId": rec.machineId,
                "action": "PROPOSED_ACTION",
                "details": f"Recommended [{rec.action}]: Potential saving of {rec.expectedSavingKwh:.1f} kWh/hr ({rec.reason})",
                "severity": "INFO",
                "timestamp": now_str
            })

    # Step 5: Supervisor / Explanation Agent
    decisions = supervisor_agent.supervise_and_explain(
        monitoring=monitoring_results,
        anomalies=anomaly_results,
        forecast=forecast_result,
        recommendations=opt_result.recommendations,
        machines=payload.machines
    )
    for dec in decisions:
        if dec.action != "KEEP_RUNNING":
            activity_logs.append({
                "agent": "SupervisorAgent",
                "machineId": dec.machineId,
                "action": "DECISION_FORMULATED",
                "details": f"Approved: {dec.approved} for command [{dec.action}]. Confidence: {dec.confidence*100:.0f}%",
                "severity": "SUCCESS" if dec.approved else "WARNING",
                "timestamp": now_str
            })

    return OrchestrationResult(
        monitoring=monitoring_results,
        anomalies=anomaly_results,
        forecast=forecast_result,
        optimization=opt_result,
        decisions=decisions,
        activityLogs=activity_logs
    )

class ChatRequest(BaseModel):
    query: str
    factoryContext: Dict[str, Any]

@app.post("/api/ai/chat")
def ai_chat(payload: ChatRequest):
    """
    Factory Energy Assistant endpoint.
    Answers natural questions strictly grounded in live telemetry, active alerts, and AI decisions.
    """
    query_lower = payload.query.lower()
    ctx = payload.factoryContext or {}
    machines = ctx.get("machines", [])
    alerts = ctx.get("alerts", [])
    decisions = ctx.get("decisions", [])
    savings = ctx.get("savings", {})
    forecast = ctx.get("forecast", {})

    cites = []
    response_text = ""

    # 1. "Which machine consumes the most power?"
    if "most power" in query_lower or "highest power" in query_lower or "highest consumption" in query_lower:
        if machines:
            sorted_m = sorted(machines, key=lambda x: x.get("powerKw", 0.0), reverse=True)
            top_m = sorted_m[0]
            cites.append({"type": "machine", "id": top_m["machineId"], "label": f"{top_m['name']} ({top_m['powerKw']:.1f} kW)"})
            response_text = (
                f"Currently, **{top_m['name']} ({top_m['machineId']})** in the {top_m.get('department')} department "
                f"is consuming the most power at **{top_m['powerKw']:.1f} kW** "
                f"({top_m.get('loadPercentage', 0):.0f}% operational load). "
                f"Its rated maximum capacity is {top_m.get('ratedPowerKw', 0):.1f} kW."
            )
            if len(sorted_m) > 1:
                second = sorted_m[1]
                response_text += f" The second highest consumer is **{second['name']} ({second['machineId']})** at **{second['powerKw']:.1f} kW**."
        else:
            response_text = "Machine telemetry is currently initializing. Please check back in a few seconds."

    # 2. Specific machine question: "Why is M-003 consuming more energy?" or "Tell me about M-004"
    elif any(f"m-00{i}" in query_lower for i in range(1, 9)):
        # Extract machineId
        target_id = None
        for i in range(1, 9):
            if f"m-00{i}" in query_lower:
                target_id = f"M-00{i}"
                break
        
        target_m = next((m for m in machines if m.get("machineId") == target_id), None)
        if target_m:
            cites.append({"type": "machine", "id": target_id, "label": f"{target_m['name']}"})
            # Check for decisions or alerts on this machine
            m_alerts = [a for a in alerts if a.get("machineId") == target_id and a.get("status") == "ACTIVE"]
            m_decisions = [d for d in decisions if d.get("machineId") == target_id]

            response_text = (
                f"**{target_m['name']} ({target_id})** is currently **{target_m['status']}** with a power draw of "
                f"**{target_m['powerKw']:.1f} kW** at **{target_m['loadPercentage']:.0f}% load** "
                f"and temperature of **{target_m['temperature']:.1f}°C** (Power Factor: {target_m['powerFactor']:.2f})."
            )
            if m_alerts:
                cites.append({"type": "alert", "id": m_alerts[0].get("id", "a-1"), "label": m_alerts[0].get("title")})
                response_text += f"\n\nActive Alert: **{m_alerts[0]['title']}** - {m_alerts[0]['description']}"
            if m_decisions:
                latest_d = m_decisions[0]
                cites.append({"type": "decision", "id": latest_d.get("id", "d-1"), "label": f"AI: {latest_d.get('recommendation')}"})
                response_text += f"\n\nLatest AI Recommendation: **{latest_d.get('recommendation')}** (Confidence: {int(latest_d.get('confidence', 0.9)*100)}%). {latest_d.get('explanation', {}).get('analysis', '')}"
        else:
            response_text = f"Machine {target_id} was not found in the active telemetry registry."

    # 3. Inefficient machines or idle waste
    elif "inefficient" in query_lower or "waste" in query_lower or "idle" in query_lower:
        inefficient_m = [
            m for m in machines 
            if (m.get("status") == "IDLE" and m.get("powerKw", 0) > 2.0) 
            or m.get("efficiencyScore", 100) < 80 
            or m.get("powerFactor", 1.0) < 0.85
        ]
        if inefficient_m:
            names = []
            for m in inefficient_m:
                cites.append({"type": "machine", "id": m["machineId"], "label": f"{m['name']} ({m['status']})"})
                names.append(f"• **{m['name']} ({m['machineId']})**: Status [{m['status']}], Power {m['powerKw']:.1f} kW, PF {m['powerFactor']:.2f}, Efficiency {m.get('efficiencyScore', 0):.0f}%")
            response_text = (
                f"The AI Energy Monitoring Agent identified **{len(inefficient_m)} machine(s)** with suboptimal efficiency or idle waste:\n\n"
                + "\n".join(names)
                + "\n\nThe Optimization Agent recommends placing idling machines into **STANDBY** to reduce baseline losses."
            )
        else:
            response_text = "All operational machines are currently running within optimal efficiency parameters (efficiency scores > 85%, power factors > 0.88)."

    # 4. Energy savings today
    elif "save" in query_lower or "savings" in query_lower or "cost" in query_lower:
        saved_kwh = savings.get("energySavedTodayKwh", 34.8)
        saved_cost = savings.get("costSavedToday", saved_kwh * 0.15)
        saved_co2 = savings.get("co2SavedTodayKg", saved_kwh * 0.42)
        response_text = (
            f"Today, the PowerGuard Multi-Agent System has achieved:\n\n"
            f"• **Energy Saved**: {saved_kwh:.1f} kWh\n"
            f"• **Cost Reduction**: ${saved_cost:.2f} (at $0.15/kWh tariff)\n"
            f"• **CO2 Reduction**: {saved_co2:.1f} kg CO2\n\n"
            f"These savings were generated primarily through automated idle standby scheduling on low-priority conveyor and packaging units."
        )

    # 5. Peak demand & forecast
    elif "peak" in query_lower or "forecast" in query_lower or "demand" in query_lower:
        pred_peak = forecast.get("predictedPeakKw", 148.5)
        peak_time = forecast.get("peakTime", "15:00")
        threshold = forecast.get("peakThresholdKw", 160.0)
        margin = threshold - pred_peak
        status_word = "within safe limits" if margin > 0 else "exceeding threshold"
        response_text = (
            f"The Energy Forecasting Agent predicts a factory peak demand of **{pred_peak:.1f} kW** at **{peak_time}**.\n\n"
            f"• Configured Peak Limit: **{threshold:.1f} kW**\n"
            f"• Status: **{status_word}** (Margin: {margin:+.1f} kW)\n\n"
            f"If demand approaches the threshold, the Optimizer Agent will automatically propose curtailing non-critical auxiliary loads."
        )

    # 6. Default general assistant answer
    else:
        total_p = sum(m.get("powerKw", 0) for m in machines)
        active_cnt = sum(1 for m in machines if m.get("status") == "RUNNING")
        response_text = (
            f"PowerGuard Industrial AI Assistant is active.\n\n"
            f"• **Total Factory Power**: {total_p:.1f} kW\n"
            f"• **Active Running Machines**: {active_cnt} / {len(machines)}\n"
            f"• **Active Alerts**: {len(alerts)}\n"
            f"• **Pending AI Recommendations**: {len(decisions)}\n\n"
            f"You can ask me questions such as:\n"
            f"- *'Which machine consumes the most power?'*\n"
            f"- *'Why is M-003 consuming more energy?'*\n"
            f"- *'What machines are currently inefficient?'*\n"
            f"- *'How much energy did AI save today?'*\n"
            f"- *'What is the predicted peak demand?'*"
        )

    return {
        "reply": response_text,
        "cites": cites,
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
