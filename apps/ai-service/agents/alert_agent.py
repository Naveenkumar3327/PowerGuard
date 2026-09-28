"""
Agent 6: Alert & Incident Agent
Monitors anomaly outputs, telemetry excursions, and forecast risks to produce triaged,
deduplicated industrial alerts with severity levels INFO, WARNING, HIGH, and CRITICAL.
"""
from datetime import datetime
from typing import List, Dict, Any
from models.schemas import AnomalyResult, MonitoringResult, ForecastResult

class AlertIncidentAgent:
    def __init__(self):
        self.name = "AlertIncidentAgent"
        self._recent_alert_signatures: Dict[str, datetime] = {}

    def evaluate(
        self,
        monitoring_results: List[MonitoringResult],
        anomaly_results: List[AnomalyResult],
        forecast_result: ForecastResult = None,
        peak_threshold_kw: float = 160.0
    ) -> List[Dict[str, Any]]:
        generated_alerts: List[Dict[str, Any]] = []
        now = datetime.utcnow()

        # 1. Evaluate Anomaly Detections
        for a in anomaly_results:
            if a.anomaly and a.severity in ["WARNING", "HIGH", "CRITICAL"]:
                sig = f"{a.machineId}:{a.severity}:{a.reasons[0] if a.reasons else 'anomaly'}"
                # 30-second cooldown per signature
                if sig in self._recent_alert_signatures:
                    if (now - self._recent_alert_signatures[sig]).total_seconds() < 30:
                        continue

                self._recent_alert_signatures[sig] = now
                generated_alerts.append({
                    "title": f"Anomaly Detected: {a.machineId}",
                    "machineId": a.machineId,
                    "severity": a.severity,
                    "detectedTime": now.isoformat(),
                    "agent": self.name,
                    "description": "; ".join(a.reasons),
                    "recommendedAction": "Inspect load distribution and verify digital-twin telemetry trend.",
                    "status": "ACTIVE"
                })

        # 2. Evaluate Idle Waste & Power Factor Excursions
        for m in monitoring_results:
            if m.idleWasteDetected:
                sig = f"{m.machineId}:IDLE_WASTE"
                if sig not in self._recent_alert_signatures or (now - self._recent_alert_signatures[sig]).total_seconds() >= 45:
                    self._recent_alert_signatures[sig] = now
                    generated_alerts.append({
                        "title": f"Idle Energy Waste: {m.machineId}",
                        "machineId": m.machineId,
                        "severity": "WARNING",
                        "detectedTime": now.isoformat(),
                        "agent": self.name,
                        "description": m.reason,
                        "recommendedAction": "Transition machine to standby mode to prevent non-productive energy draw.",
                        "status": "ACTIVE"
                    })

            if m.powerFactorStatus == "CRITICAL_LOW":
                sig = f"{m.machineId}:PF_LOW"
                if sig not in self._recent_alert_signatures or (now - self._recent_alert_signatures[sig]).total_seconds() >= 60:
                    self._recent_alert_signatures[sig] = now
                    generated_alerts.append({
                        "title": f"Critical Low Power Factor: {m.machineId}",
                        "machineId": m.machineId,
                        "severity": "HIGH",
                        "detectedTime": now.isoformat(),
                        "agent": self.name,
                        "description": m.reason,
                        "recommendedAction": "Engage capacitor bank / reactive power compensation filter.",
                        "status": "ACTIVE"
                    })

        # 3. Evaluate Forecast Peak Demand Threat
        if forecast_result and forecast_result.predictedPeakKw >= peak_threshold_kw:
            sig = f"FACTORY_PEAK_DEMAND_{forecast_result.peakTime}"
            if sig not in self._recent_alert_signatures or (now - self._recent_alert_signatures[sig]).total_seconds() >= 120:
                self._recent_alert_signatures[sig] = now
                generated_alerts.append({
                    "title": "Impending Factory Peak Demand Excursion",
                    "machineId": "FACTORY-WIDE",
                    "severity": "HIGH",
                    "detectedTime": now.isoformat(),
                    "agent": self.name,
                    "description": f"Forecast agent projects aggregate load of {forecast_result.predictedPeakKw:.1f} kW at {forecast_result.peakTime}, exceeding the {peak_threshold_kw:.1f} kW threshold.",
                    "recommendedAction": "Initiate peak-shaving protocols: standby low-priority machines and curtail auxiliary HVAC load.",
                    "status": "ACTIVE"
                })

        return generated_alerts
