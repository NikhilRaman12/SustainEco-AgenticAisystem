# SustainAI: Multi-Agent Decision Intelligence System for Sustainable Agriculture

SustainAI is a production-grade, state-of-the-art decision intelligence ecosystem designed to evaluate farm agricultural ecosystems, diagnose critical soil, climate, water, pathogen, carbon, and ecological vulnerabilities, and propose optimized actionable conservation roadmaps.

The platform relies on **Google Gemini**, **LangChain**, and **LangGraph** orchestrators for cohesive Multi-Agent cooperation, utilizing standard **Model Context Protocol (MCP)** JSON-RPC services for weather, soil biology, carbon accounting, scientific database search, and MongoDB persistence.

---

## 1. Multi-Agent Ecosystem Architecture

```
                  ┌──────────────────────┐
                  │      START NODE      │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │   Supervisor Agent   │
                  │ (Chief Intelligence) │
                  └──────────┬───────────┘
                             │
        ┌───────────┬────────┼────────┬───────────┬───────────┐
        │           │        │        │           │           │     (Parallel Tasks)
  ┌─────▼─────┐┌────▼─────┐┌─▼───┐┌───▼───┐┌──────▼──────┐┌───▼───┐
  │Soil Agent ││Climate   ││Water││Crop   ││Carbon Agent ││Ecologist
  │(Scientist)││Agent     ││Agent││Agent  ││(Analyst)    ││Agent  │
  └─────┬─────┘└────┬─────┘└─┬───┘└───┬───┘└──────┬──────┘└───┬───┘
        │           │        │        │           │           │
        └───────────┼────────┼────────┼───────────┼───────────┘
                             │  (State Coverages)
                  ┌──────────▼───────────┐
                  │     Critic Agent     │
                  │ (Scientific Audit)  │
                  └──────────┬───────────┘
                             │  [Conditional routing check]
                             ├──────────────────────────┐
                    Confidence < 70%           Confidence >= 70%
                             │                          │
                  ┌──────────▼───────────┐    ┌─────────▼─────────┐
                  │ Injects Corrections  │    │  Human Approval   │
                  │   [Supervisor Loop]  │    │  (Intercept Node) │
                  └──────────────────────┘    └─────────┬─────────┘
                                                        │
                                              ┌─────────▼─────────┐
                                              │  Decision Agent   │
                                              │  (Chief Advisor)  │
                                              └─────────┬─────────┘
                                                        │
                                              ┌─────────▼─────────┐
                                              │     END NODE      │
                                              └───────────────────┘
```

### Virtual Expert Scientific Team Roles:
1. **Supervisor Agent**: Deconstructs user directives, maps local crop-season stress requirements, compiles research plans, and marshals parallel nodes.
2. **Soil Scientist Agent**: Audits chemical nutrient availability, active Soil Organic Carbon (SOC), salinity, and physical compaction thresholds.
3. **Climate Scientist Agent**: Audits seasonal warming rates, precipitation standard deviations, and frost/dry weather windows.
4. **Water Resource Scientist Agent**: Evaluates hydrological balances, evaporation rates, irrigation system efficiencies (Flood vs Drip), and aquifer safety margins.
5. **Crop Health Agent (Plant Pathologist)**: Diagnoses pathogenic hazards, insect vectors, chlorosis flags, and biological pest defense regimes (IPM).
6. **Carbon Footprint Analyst**: Drafts detailed emissions scopes (CO2 equivalent) and specifies voluntary offset eligibility (Verra/Gold Standard pathways).
7. **Ecologist Agent**: Plans bio-complexity corridors, woodland canopy borders, and native bee/predator wasp habitats.
8. **Research Agent (Literature Review)**: Grounds all proposed techniques by matching peer-reviewed journals (FAO / USDA).
9. **Critic Agent (Scientific Audit)**: Reviews parallel data outputs, flags agronomical conflicts (e.g. soil sub-tillage contradictions with carbon zero-till preservation), and scores confidence levels.
10. **Decision Agent (Chief Advisor)**: Combines reconciled diagnostics and formats a 3-Year Sustainability Roadmap containing CAPEX and KPI goals.

---

## 2. Directory Structure

This repository contains the physical Python packages:

```
sustainai/
├── __init__.py
├── agents/                   # Scientific Agent modules
│   ├── __init__.py
│   ├── supervisor.py
│   ├── soil.py
│   ├── climate.py
│   ├── water.py
│   ├── crop.py
│   ├── carbon.py
│   ├── biodiversity.py
│   ├── research.py
│   ├── critic.py
│   └── decision.py
├── graph/                    # LangGraph workflow orchestration
│   ├── __init__.py
│   ├── state.py
│   └── workflow.py
├── mcp_servers/              # Model Context Protocol microservices
│   ├── __init__.py
│   ├── weather.py
│   ├── soil.py
│   ├── carbon.py
│   ├── research.py
│   └── database.py
├── memory/                   # Durable persistence adapter (MongoDB)
│   ├── __init__.py
│   └── mongo.py
├── evaluation/               # LangSmith quality validation judges
│   ├── __init__.py
│   └── langsmith_eval.py
├── api/                      # Enterprise REST Gateway (FastAPI)
│   ├── __init__.py
│   └── main.py
└── tests/                    # Programmatic testing suite (Pytest)
    ├── __init__.py
    └── test_workflow.py
```

---

## 3. Local Installation & Setup

### Prerequisites
- Python 3.12+
- MongoDB instance (Optional - program automatically mounts mock-driver memory adapter if connection fails)

### Step 1: Install Dependencies
Create a virtual environment and run the installation:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pydantic google-genai langgraph pymongo pytest mcp
```

### Step 2: Set Environment Variables
Add your credentials to your system or `.env` configuration file:

```bash
export GEMINI_API_KEY="your-google-gemini-api-key"
export MONGO_URI="mongodb+srv://admin:secure_password@cluster0.mongodb.net/sustainai"
```

### Step 3: Launch MCP Server services
To run the server microservices using NPM/MCP configuration utilities or direct Execution script:

```bash
# E.g., launch Soil MCP Server
python -m sustainai.mcp_servers.soil
```

### Step 4: Run the API Gateway
Power up the complete REST FastAPI backend:

```bash
uvicorn sustainai.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive swagger endpoints can then be inspected at `http://localhost:8000/docs`.

### Step 5: Execute Tests
Run the programmatic tests:

```bash
pytest sustainai/tests/
```
