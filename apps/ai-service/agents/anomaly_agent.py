"""
Agent 2: Anomaly Detection Agent
Implements machine learning-based anomaly detection using Scikit-Learn Isolation Forest
combined with statistical Z-score & rolling window standard deviations.
"""
from typing import List, Dict, Any
import numpy as np
from sklearn.ensemble import IsolationForest
from models.schemas import MachineTelemetryInput, AnomalyResult

class AnomalyDetectionAgent:
    def __init__(self):
        self.name = "AnomalyDetectionAgent"
        self._cached_models: Dict[str, IsolationForest] = {}

    def detect(self, machine: MachineTelemetryInput, history: List[Dict[str, Any]] = None) -> AnomalyResult:
        reasons = []
        severity = "NORMAL"
        score = 0.0
        is_anomaly = False
        metrics = {}

        # 1. Feature extraction from current telemetry
        current_features = np.array([
            machine.powerKw,
            machine.current,
            machine.loadPercentage,
            machine.temperature,
            machine.powerFactor
        ]).reshape(1, -1)

        # 2. Historical baseline analysis (Z-score and statistical checks)
        if history and len(history) >= 5:
            hist_power = [h.get("powerKw", 0.0) for h in history]
            hist_temp = [h.get("temperature", 35.0) for h in history]
            hist_pf = [h.get("powerFactor", 0.92) for h in history]

            mean_power = float(np.mean(hist_power))
            std_power = float(np.std(hist_power)) + 1e-5
            mean_temp = float(np.mean(hist_temp))
            std_temp = float(np.std(hist_temp)) + 1e-5

            z_power = (machine.powerKw - mean_power) / std_power
            z_temp = (machine.temperature - mean_temp) / std_temp

            metrics["power_z_score"] = round(z_power, 2)
            metrics["temp_z_score"] = round(z_temp, 2)
            metrics["baseline_power_mean"] = round(mean_power, 2)
            metrics["baseline_temp_mean"] = round(mean_temp, 2)

            # Statistical trigger checks
            if z_power > 2.8:
                is_anomaly = True
                score = min(0.98, 0.65 + (z_power - 2.8) * 0.1)
                severity = "HIGH" if z_power < 4.0 else "CRITICAL"
                reasons.append(f"Power consumption ({machine.powerKw:.1f} kW) is {z_power:.1f} standard deviations above historical baseline ({mean_power:.1f} kW)")

            if z_temp > 2.5 and machine.temperature > 65.0:
                is_anomaly = True
                score = max(score, min(0.95, 0.70 + (z_temp - 2.5) * 0.1))
                severity = "CRITICAL" if machine.temperature > 85.0 else ("HIGH" if severity != "CRITICAL" else severity)
                reasons.append(f"Abnormal thermal ramp: {machine.temperature:.1f}°C vs normal baseline of {mean_temp:.1f}°C")

            # Train or evaluate Isolation Forest if sufficient historical samples
            if len(history) >= 15:
                try:
                    X_hist = np.array([
                        [
                            h.get("powerKw", 0.0),
                            h.get("current", 0.0),
                            h.get("loadPercentage", 0.0),
                            h.get("temperature", 35.0),
                            h.get("powerFactor", 0.9)
                        ]
                        for h in history
                    ])
                    # Fit lightweight Isolation Forest
                    iso_forest = IsolationForest(n_estimators=40, contamination=0.08, random_state=42)
                    iso_forest.fit(X_hist)
                    prediction = iso_forest.predict(current_features)[0] # -1 for anomaly, 1 for inlier
                    raw_score = float(-iso_forest.decision_function(current_features)[0]) # higher = more anomalous

                    metrics["isolation_forest_raw"] = round(raw_score, 4)
                    if prediction == -1 and raw_score > 0.12:
                        is_anomaly = True
                        score = max(score, min(0.96, 0.60 + raw_score))
                        if severity == "NORMAL":
                            severity = "WARNING"
                        reasons.append(f"Multivariate Isolation Forest identified high multidimensional outlier score ({raw_score:.3f})")
                except Exception as e:
                    metrics["ml_error"] = str(e)
        else:
            # Fallback for cold start without full history
            if machine.powerKw > (machine.ratedPowerKw * 1.15):
                is_anomaly = True
                score = 0.88
                severity = "HIGH"
                reasons.append(f"Severe overload: {machine.powerKw:.1f} kW exceeds rated {machine.ratedPowerKw} kW by 15%+")
            elif machine.status == "FAULT":
                is_anomaly = True
                score = 0.95
                severity = "CRITICAL"
                reasons.append(f"Machine triggered FAULT status with active electrical draw")
            elif machine.temperature > 80.0:
                is_anomaly = True
                score = 0.85
                severity = "HIGH"
                reasons.append(f"Temperature {machine.temperature:.1f}°C exceeds safety envelope")

        if not is_anomaly:
            reasons.append("Operating within normal historical variance and feature space")

        return AnomalyResult(
            agent=self.name,
            machineId=machine.machineId,
            anomaly=is_anomaly,
            severity=severity,
            score=round(score, 2),
            reasons=reasons,
            metrics=metrics
        )
