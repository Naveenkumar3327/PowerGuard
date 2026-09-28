# ⚡ PowerGuard — AI-Based Factory Energy Management

PowerGuard is an AI-powered factory energy management platform designed to monitor industrial machine energy consumption, detect abnormal energy usage, forecast future demand, optimize energy consumption, and generate explainable machine-control recommendations through a multi-agent AI architecture.

The platform combines real-time factory simulation, machine telemetry, machine-learning analytics, multi-agent AI, energy optimization, digital-twin simulation, alerts, forecasting, and role-based access control into a single full-stack application.

> **Academic Project:** PowerGuard is designed as a final-year engineering project. Machine-control functionality operates through a safe Digital Twin / Simulator layer and does not directly control real industrial equipment.

---

## 🚀 GitHub Repository Description

**PowerGuard is an AI-based factory energy management platform using multi-agent AI, real-time machine simulation, anomaly detection, energy forecasting, optimization, explainable decisions, and digital-twin machine control.**

### Short Version

**AI-powered factory energy management platform with multi-agent optimization, real-time machine monitoring, forecasting, anomaly detection, and digital-twin simulation.**

---

## 📌 Project Overview

Industrial factories operate multiple machines with different energy requirements, production priorities, operating schedules, and efficiency levels. Traditional energy monitoring systems mainly display consumption data but often do not provide intelligent, coordinated actions for reducing unnecessary energy usage.

PowerGuard addresses this problem by combining real-time monitoring with a group of specialized AI agents.

The system continuously processes simulated factory telemetry and allows AI agents to:

- Monitor machine energy consumption
- Detect abnormal energy patterns
- Forecast future energy demand
- Identify inefficient machine operation
- Optimize machine schedules
- Recommend energy-saving actions
- Manage peak demand
- Generate explainable decisions
- Create alerts and incidents
- Execute safe simulated machine-control commands
- Track estimated energy and cost savings

---

## 🎯 Objectives

1. Develop a real-time factory energy monitoring platform.
2. Build a multi-agent AI architecture for energy management.
3. Detect abnormal machine energy consumption using machine-learning techniques.
4. Forecast future factory energy demand.
5. Optimize machine operation while respecting production priorities.
6. Provide explainable AI recommendations.
7. Simulate machine-control actions through a Digital Twin.
8. Track energy savings and estimated cost reductions.
9. Provide real-time dashboards and analytics.
10. Create a scalable architecture that can later integrate with industrial IoT or PLC gateways.

---

# 🧠 Multi-Agent AI Architecture

PowerGuard uses specialized AI agents instead of relying on a single AI component.

```text
                         POWERGUARD UI
                              │
                       REST + Socket.IO
                              │
                              ▼
                    ┌───────────────────┐
                    │   Node.js API     │
                    │ Express + TS      │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Agent Orchestrator │
                    └─────────┬─────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │          │           │          │            │
       ▼          ▼           ▼          ▼            ▼
   Monitoring  Anomaly     Forecast   Optimizer   Controller
     Agent      Agent        Agent      Agent        Agent
       │          │           │          │            │
       └──────────┴───────────┴──────────┴────────────┘
                              │
                              ▼
                       Alert Agent
                              │
                              ▼
                    Supervisor / Explainer
                              │
                              ▼
                   Digital Twin Simulator
                              │
                              ▼
                       New Telemetry
                              │
                              └──────────────► AI Agents
```

---

# 🤖 AI Agents

## 1. Energy Monitoring Agent

Continuously analyzes machine telemetry such as:

- Voltage
- Current
- Power factor
- Power consumption
- Energy consumption
- Load percentage
- Temperature
- Machine status
- Operating hours

It identifies high-consumption machines, idle consumption, and unusual operating conditions.

---

## 2. Anomaly Detection Agent

Detects unusual energy behavior using machine-learning/statistical methods such as:

- Isolation Forest
- Z-score analysis
- Rolling mean
- Standard deviation
- Historical baseline comparison

Example:

```json
{
  "machineId": "M-003",
  "anomaly": true,
  "severity": "HIGH",
  "score": 0.91,
  "reason": "Energy consumption is significantly above the historical operating baseline"
}
```

---

## 3. Energy Forecasting Agent

Predicts future energy consumption using historical telemetry and operating information.

Forecast horizons include:

- Next hour
- Next 6 hours
- Next 24 hours

Inputs can include:

- Historical energy consumption
- Machine utilization
- Time of day
- Day of week
- Production schedule
- Machine operating state

---

## 4. Energy Optimization Agent

Generates energy-saving recommendations while considering production constraints.

Possible actions:

```text
REDUCE_LOAD
STOP_IDLE_MACHINE
ENTER_STANDBY
SHIFT_OPERATION
OPTIMIZE_SCHEDULE
KEEP_RUNNING
```

Each recommendation contains:

- Machine
- Action
- Reason
- Expected energy saving
- Confidence
- Production impact
- Priority

---

## 5. Machine Control Agent

Converts approved recommendations into safe simulated commands.

Example commands:

```text
START_MACHINE
STOP_MACHINE
REDUCE_LOAD
INCREASE_LOAD
ENTER_STANDBY
EXIT_STANDBY
```

The system operates in simulation mode and does not directly control real industrial equipment.

---

## 6. Alert & Incident Agent

Detects and manages:

- Excessive energy consumption
- Machine anomalies
- High temperature
- Peak demand risk
- Fault conditions
- Communication failures

Alert levels:

```text
INFO
WARNING
HIGH
CRITICAL
```

---

## 7. Supervisor / Explainer Agent

Coordinates the outputs of the other agents.

It:

- Validates recommendations
- Detects conflicting agent decisions
- Considers production priorities
- Provides human-readable explanations
- Calculates overall confidence
- Determines whether a simulated action can proceed

Example:

```text
Problem:
M-004 has remained idle for an extended period.

Evidence:
Current Power: 11.2 kW
Historical Idle Power: 10.8 kW
Production Priority: LOW

Recommendation:
Enter standby mode.

Expected Saving:
Approximately 3.7 kWh/hour.

Confidence:
91%
```

---

# 🏭 Digital Factory Simulator

PowerGuard includes a Digital Factory / Machine Simulator so the complete system can be demonstrated without physical industrial hardware.

Example machines:

| ID | Machine | Department |
|---|---|---|
| M-001 | CNC Machine | Production |
| M-002 | Industrial Compressor | Utilities |
| M-003 | Injection Molding Machine | Production |
| M-004 | Conveyor System | Assembly |
| M-005 | Industrial Pump | Utilities |
| M-006 | HVAC Unit | Utilities |
| M-007 | Welding Machine | Production |
| M-008 | Packaging Machine | Packaging |

Machine states:

```text
RUNNING
IDLE
STANDBY
MAINTENANCE
OFFLINE
FAULT
```

The simulator generates changing telemetry and responds to simulated AI control commands.

---

# 🔄 Real-Time Data Flow

```text
Machine Simulator
       │
       ▼
Telemetry Generator
       │
       ▼
Node.js Backend
       │
       ├──────────────► MongoDB
       │
       └──────────────► Socket.IO
                              │
                              ▼
                         Next.js UI
```

AI processing:

```text
Telemetry
    │
    ▼
Monitoring Agent
    │
    ▼
Anomaly Agent
    │
    ▼
Forecast Agent
    │
    ▼
Optimization Agent
    │
    ▼
Supervisor Agent
    │
    ▼
Human Approval / Safe Auto Mode
    │
    ▼
Control Agent
    │
    ▼
Digital Twin
```

---

# 🖥️ Main Application Modules

## Dashboard

Displays:

- Total factory power
- Total energy consumption
- Active machines
- Factory efficiency
- Energy saved
- Active alerts
- AI actions
- Peak demand

Charts:

- Real-time factory power
- Energy consumption
- Machine comparison
- Department consumption
- Forecast
- Energy savings

---

## Factory Digital Twin

Provides a visual representation of the simulated factory.

Features:

- Live machine states
- Power consumption
- Load
- Temperature
- Department grouping
- Machine details
- Simulation controls

---

## Machine Monitoring

Provides:

- Machine status
- Live telemetry
- Historical energy
- Power graph
- Temperature graph
- Load graph
- Efficiency
- Anomaly history
- AI recommendations
- Simulated control actions

---

## AI Agent Center

Displays:

- Agent status
- Current activity
- Last execution
- Tasks processed
- Decisions generated
- Confidence
- Agent activity timeline

---

## AI Decision Center

Tracks:

- AI recommendations
- Machine
- Agent
- Problem
- Recommendation
- Expected savings
- Confidence
- Approval status
- Execution status

Decision states:

```text
PENDING
APPROVED
REJECTED
EXECUTED
SIMULATED
```

---

## Alert Center

Supports:

- Severity filtering
- Machine filtering
- Search
- Acknowledge
- Resolve
- Alert history

---

## Energy Analytics

Provides:

- Daily consumption
- Weekly consumption
- Monthly consumption
- Peak demand
- Average load
- Energy cost
- Energy savings
- Efficiency analysis

---

## Forecasting

Provides:

- Next-hour prediction
- Six-hour prediction
- Twenty-four-hour prediction
- Actual vs predicted charts
- Peak demand prediction
- Confidence information

---

## Energy Savings

Tracks:

```text
Baseline Energy
Actual Energy
Optimized Energy
Energy Saved
Estimated Cost Saved
Estimated CO₂ Reduction
```

Basic calculations:

```text
Energy Saved =
Baseline Energy - Optimized Energy

Estimated Cost Saved =
Energy Saved × Electricity Tariff

Estimated CO₂ Reduction =
Energy Saved × Emission Factor
```

Simulation-based values are clearly marked as estimates.

---

## AI Assistant

The application includes an AI assistant for factory energy analysis.

Example questions:

```text
Which machine consumes the most power?

Why is M-003 consuming more energy?

Which machines are currently inefficient?

How much energy did AI save today?

What is the predicted peak demand?

Why did the system recommend standby for M-004?

What happened during the latest anomaly?
```

The assistant should retrieve application data before answering and should not invent machine values.

---

# 🎮 Demonstration Scenarios

PowerGuard includes factory simulation scenarios for project demonstrations.

### Normal Factory Operation

Simulates normal machine behavior.

### High Energy Consumption

Increases machine load and factory power.

### Machine Anomaly

Creates abnormal energy behavior.

### Peak Demand

Creates a predicted demand spike.

### Idle Machine

Creates an unnecessarily operating low-priority machine.

### Machine Fault

Simulates abnormal machine behavior.

### Energy Optimization

Triggers the complete AI decision workflow.

---

# 🔐 User Roles

| Role | Access |
|---|---|
| Admin | Full system access |
| Energy Manager | Analytics, AI decisions, approvals |
| Operator | Machines, alerts, simulation |
| Viewer | Read-only access |

Authentication uses JWT-based authorization and role-based access control.

---

# 🛠️ Technology Stack

## Frontend

- Next.js 15+
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts
- TanStack Query
- Zustand
- Socket.IO Client
- Lucide React

## Backend

- Node.js
- Express.js
- TypeScript
- Socket.IO
- Mongoose
- JWT
- bcrypt
- Zod / validation layer
- Helmet
- Rate limiting

## AI / ML

- Python
- FastAPI
- Scikit-learn
- Pandas
- NumPy
- Optional XGBoost
- Gemini API / OpenAI API

## Database

- MongoDB Atlas
- MongoDB local development support

## DevOps

- Docker
- Docker Compose
- GitHub Actions

---

# 📁 Project Structure

```text
powerguard/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── services/
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── sockets/
│   │   │   └── utils/
│   │   └── tests/
│   │
│   └── ai-service/
│       ├── app/
│       │   ├── agents/
│       │   ├── models/
│       │   ├── forecasting/
│       │   ├── anomaly/
│       │   ├── optimization/
│       │   └── orchestrator/
│       └── tests/
│
├── simulator/
│   ├── machines/
│   ├── scenarios/
│   └── simulation-engine/
│
├── packages/
│   ├── shared-types/
│   └── config/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── project-report/
│
├── docker/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

# ⚙️ Environment Variables

Create a `.env` file based on `.env.example`.

```env
MONGODB_URI=mongodb://localhost:27017/powerguard

JWT_SECRET=your_secure_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000

AI_SERVICE_URL=http://localhost:8000

ENERGY_TARIFF=8
EMISSION_FACTOR=0.82
```

Never commit `.env` files or API keys to GitHub.

---

# 🚀 Local Development

## Prerequisites

Install:

- Node.js 20+
- Python 3.11+
- MongoDB or MongoDB Atlas
- Git
- Docker Desktop (optional)

---

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/powerguard.git

cd powerguard
```

---

## 2. Install Frontend Dependencies

```bash
cd apps/web
npm install
```

---

## 3. Install Backend Dependencies

```bash
cd ../api
npm install
```

---

## 4. Install AI Service Dependencies

```bash
cd ../ai-service

python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Install packages:

```bash
pip install -r requirements.txt
```

---

# ▶️ Run the Application

Start the Node.js backend:

```bash
cd apps/api
npm run dev
```

Start the AI service:

```bash
cd apps/ai-service
uvicorn app.main:app --reload --port 8000
```

Start the Next.js frontend:

```bash
cd apps/web
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🐳 Docker Setup

Build and start all services:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up -d
```

Stop:

```bash
docker compose down
```

View logs:

```bash
docker compose logs -f
```

---

# 🔌 API Overview

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

## Machines

```http
GET /api/machines
GET /api/machines/:id
POST /api/machines
PUT /api/machines/:id
```

## Telemetry

```http
GET /api/telemetry
GET /api/telemetry/:machineId
POST /api/telemetry
```

## AI

```http
POST /api/ai/analyze
POST /api/ai/optimize
POST /api/ai/forecast
```

## Decisions

```http
GET /api/decisions
GET /api/decisions/:id
POST /api/decisions/:id/approve
POST /api/decisions/:id/reject
```

## Commands

```http
GET /api/commands
POST /api/commands/simulate
```

## Alerts

```http
GET /api/alerts
POST /api/alerts/:id/acknowledge
POST /api/alerts/:id/resolve
```

## Analytics

```http
GET /api/analytics/energy
GET /api/analytics/savings
GET /api/analytics/peak-demand
```

---

# 🔄 Real-Time Communication

PowerGuard uses Socket.IO for real-time telemetry.

Example event:

```text
machineTelemetryUpdated
```

Other real-time events can include:

```text
machineStatusChanged
alertCreated
aiDecisionCreated
aiDecisionUpdated
machineCommandExecuted
energySavingRecorded
simulationStarted
simulationStopped
```

---

# 🧪 Testing

Run backend tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Run TypeScript checks:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

AI service tests:

```bash
pytest
```

---

# 🔒 Safety & Simulation Architecture

PowerGuard is designed with a safe simulation layer.

```text
AI Recommendation
       │
       ▼
Supervisor Validation
       │
       ▼
Human Approval / Safe Auto Mode
       │
       ▼
Control Agent
       │
       ▼
Simulation Command
       │
       ▼
Digital Twin
```

The application does not directly send commands to real industrial equipment.

A future industrial deployment could introduce an isolated IoT/PLC gateway between the control layer and physical machines, with additional industrial safety mechanisms and authorization.

---

# 📊 Key Performance Indicators

PowerGuard tracks:

- Total Power
- Total Energy
- Peak Demand
- Machine Efficiency
- Energy Saved
- Estimated Cost Saved
- Estimated CO₂ Reduction
- AI Decisions
- Active Alerts
- Anomaly Count
- Forecast Accuracy
- Machine Utilization

---

# 🌱 Sustainability

PowerGuard supports energy-efficiency analysis by helping identify:

- Unnecessary machine operation
- High-energy operating periods
- Inefficient machine behavior
- Peak-demand conditions
- Opportunities for standby operation
- Schedule optimization opportunities

The project can be aligned with sustainability objectives such as:

- SDG 7 — Affordable and Clean Energy
- SDG 9 — Industry, Innovation and Infrastructure
- SDG 12 — Responsible Consumption and Production
- SDG 13 — Climate Action

---

# 🔮 Future Scope

Potential future extensions include:

- Industrial IoT sensor integration
- MQTT support
- OPC-UA integration
- PLC gateway integration
- Edge AI
- Real-time power meters
- Advanced reinforcement-learning optimization
- Carbon-aware scheduling
- Renewable energy integration
- Solar generation forecasting
- Battery energy storage optimization
- Digital-twin visualization
- Predictive maintenance
- Enterprise multi-factory management
- Cloud deployment
- Advanced time-series databases

---

# 🎓 Academic Contribution

PowerGuard demonstrates the integration of:

```text
Artificial Intelligence
        +
Machine Learning
        +
Multi-Agent Systems
        +
Industrial Energy Management
        +
Real-Time Systems
        +
Digital Twin Simulation
        +
Full-Stack Development
        +
Data Analytics
        +
Explainable AI
```

The project provides a software-based framework for intelligent factory energy management without requiring physical industrial hardware for demonstration.

---

# 👨‍💻 Project

**Project Name:** PowerGuard

**Title:** AI-Based Factory Energy Management

**Project Type:** Final Year Engineering Project

**Domain:** Artificial Intelligence + Industrial Energy Management + Full Stack Development

---

# 📜 License

This project is intended primarily for academic and educational purposes.

Add an appropriate open-source license before public production use.
