"""
Pydantic Schemas for POWERGUARD AI Service
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class MachineTelemetryInput(BaseModel):
    machineId: str
    name: Optional[str] = "Unknown Machine"
    type: Optional[str] = "Generic Machine"
    department: Optional[str] = "Production"
    voltage: float = 400.0
    current: float = 0.0
    powerFactor: float = 0.9
    powerKw: float = 0.0
    energyKwh: float = 0.0
    loadPercentage: float = 0.0
    temperature: float = 35.0
    status: str = "RUNNING"
    operatingHours: float = 0.0
    productionPriority: str = "MEDIUM"
    ratedPowerKw: float = 30.0

class MonitoringResult(BaseModel):
    agent: str = "EnergyMonitoringAgent"
    machineId: str
    status: str
    powerKw: float
    energyKwh: float
    idleWasteDetected: bool = False
    idleDurationMinutes: float = 0.0
    powerFactorStatus: str = "OPTIMAL"
    reason: str
    confidence: float

class AnomalyInput(BaseModel):
    machineId: str
    currentTelemetry: MachineTelemetryInput
    history: List[Dict[str, Any]] = []

class AnomalyResult(BaseModel):
    agent: str = "AnomalyDetectionAgent"
    machineId: str
    anomaly: bool
    severity: str = "NORMAL"  # NORMAL, INFO, WARNING, HIGH, CRITICAL
    score: float = 0.0        # 0.0 to 1.0 anomaly magnitude
    reasons: List[str] = []
    metrics: Dict[str, Any] = {}

class ForecastInput(BaseModel):
    horizon: str = "24h" # 1h, 6h, 24h
    historicalReadings: List[Dict[str, Any]] = []
    currentTotalPowerKw: float = 0.0
    peakThresholdKw: float = 160.0

class ForecastDataPoint(BaseModel):
    time: str
    actual: Optional[float] = None
    predicted: float
    lowerBound: float
    upperBound: float

class ForecastResult(BaseModel):
    agent: str = "EnergyForecastingAgent"
    horizon: str
    predictedTotalPowerKw: float
    predictedPeakKw: float
    peakTime: str
    confidence: float
    dataPoints: List[ForecastDataPoint] = []

class OptimizationInput(BaseModel):
    machines: List[MachineTelemetryInput]
    forecast: Optional[Dict[str, Any]] = None
    energyTariff: float = 0.15
    peakTariff: float = 0.28
    peakThresholdKw: float = 160.0

class OptimizationRecommendation(BaseModel):
    action: str  # ENTER_STANDBY, REDUCE_LOAD, STOP_IDLE_MACHINE, SHIFT_OPERATION, KEEP_RUNNING
    machineId: str
    expectedSavingKwh: float
    reason: str
    confidence: float
    affectedProduction: str
    priority: str

class OptimizationResult(BaseModel):
    agent: str = "EnergyOptimizationAgent"
    recommendations: List[OptimizationRecommendation] = []
    totalPotentialSavingsKwh: float = 0.0
    timestamp: str

class SupervisorInput(BaseModel):
    monitoring: List[MonitoringResult] = []
    anomalies: List[AnomalyResult] = []
    forecast: Optional[ForecastResult] = None
    recommendations: List[OptimizationRecommendation] = []
    machines: List[MachineTelemetryInput] = []

class DecisionExplanation(BaseModel):
    problem: str
    evidence: str
    analysis: str
    recommendation: str
    expectedImpact: str
    risk: str
    confidence: float

class SupervisorDecision(BaseModel):
    agent: str = "SupervisorAgent"
    machineId: str
    approved: bool
    action: str
    confidence: float
    explanation: DecisionExplanation
    simulatedCommand: Optional[str] = None
    affectedPriority: str = "MEDIUM"

class OrchestrationInput(BaseModel):
    machines: List[MachineTelemetryInput]
    historyMap: Dict[str, List[Dict[str, Any]]] = {}
    historicalTotalPower: List[Dict[str, Any]] = []
    energyTariff: float = 0.15
    peakTariff: float = 0.28
    peakThresholdKw: float = 160.0
    aiMode: str = "ASSISTED"

class OrchestrationResult(BaseModel):
    monitoring: List[MonitoringResult]
    anomalies: List[AnomalyResult]
    forecast: ForecastResult
    optimization: OptimizationResult
    decisions: List[SupervisorDecision]
    activityLogs: List[Dict[str, Any]]
