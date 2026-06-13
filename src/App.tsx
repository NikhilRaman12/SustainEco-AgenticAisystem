import React, { useState, useEffect } from "react";
import { 
  Trees, Leaf, Play, Cpu, Code2, Layers, BookOpen, Clock, 
  Trash2, Plus, RefreshCw, CheckCircle2, ShieldAlert, Sparkles, UserCheck, HelpCircle,
  Globe, Database, BarChart3, TrendingUp
} from "lucide-react";
import { FarmData, SimulationResult } from "./types";
import { BLUEPRINTS } from "./data";
import { REAL_WORLD_DATA, RealWorldRecord } from "./realWorldData";
import CodeExplorer from "./components/CodeExplorer";
import McpLogsPane from "./components/McpLogsPane";
import LangSmithPane from "./components/LangSmithPane";
import ReportDashboard from "./components/ReportDashboard";
import StateGraphVisualizer from "./components/StateGraphVisualizer";
import CommandCenterView from "./components/CommandCenterView";

export default function App() {
  // Navigation & Catalogs
  const [activeTab, setActiveTab] = useState<string>("dashboard"); // dashboard, codebase, mcp_logs, langsmith, history
  const [blueprints] = useState(BLUEPRINTS);
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>("ca_tomato");

  // Real-world dataset States
  const [contextMode, setContextMode] = useState<"blueprints" | "real_world">("blueprints");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [cropFilter, setCropFilter] = useState<string>("All");
  const [selectedRecordIndex, setSelectedRecordIndex] = useState<number>(0);

  // Farm State Inputs
  const [farmData, setFarmData] = useState<FarmData>(BLUEPRINTS[0].data);
  const [userRequest, setUserRequest] = useState<string>(
    "Assess the overall agronomic sustainability and output an evidence-backed priority actionable safety blueprint."
  );

  // Simulation Status States
  const [simulationStep, setSimulationStep] = useState<"idle" | "supervisor" | "specialists" | "critic" | "human" | "decision" | "completed">("idle");
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simError, setSimError] = useState<string>("");
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [humanRule, setHumanRule] = useState<string>("");

  // History Stores
  const [historyList, setHistoryList] = useState<SimulationResult[]>([]);
  const [activeHistoryInspection, setActiveHistoryInspection] = useState<SimulationResult | null>(null);

  // Map helper
  const mapRealWorldToFarmData = (record: RealWorldRecord): FarmData => {
    const soilPh = record.soil_health_index > 75 ? 6.8 : record.soil_health_index > 55 ? 6.1 : 7.9;
    const organicMatter = record.soil_health_index > 80 ? 4.2 : record.soil_health_index > 60 ? 2.5 : 1.2;
    
    return {
      farm_name: `${record.region} restorative ${record.crop_type} Facility`,
      location: `${record.region}, ${record.country} (${record.year})`,
      crop_name: record.crop_type,
      soil_data: {
        ph: soilPh,
        organic_matter_pct: organicMatter,
        nitrogen_ppm: Math.round(record.fertilizer_use_kg_per_ha * 0.15 + 10),
        phosphorus_ppm: Math.round(record.fertilizer_use_kg_per_ha * 0.10 + 5),
        potassium_ppm: Math.round(record.fertilizer_use_kg_per_ha * 0.50 + 80),
      },
      climate_data: {
        annual_temp_c: record.average_temp_c,
        annual_precip_mm: record.total_precipitation_mm,
        drought_risk_rating: record.extreme_weather_events > 7 ? "Critical" : record.extreme_weather_events > 4 ? "High" : "Low",
      },
      water_data: {
        irrigation_type: record.irrigation_access_pct > 70 ? "Surface Drip" : record.irrigation_access_pct > 30 ? "Overhead Sprinkler" : "Dryland (Rain-fed)",
        annual_consumption_m3: Math.round(record.irrigation_access_pct * 400 + 5000),
        source: record.irrigation_access_pct > 40 ? "Regional Irrigation Canal" : "Atmospheric precipitation / runoff"
      },
      crop_data: {
        observed_abiotic_stresses: record.extreme_weather_events > 6 
          ? ["Post-heat desiccation roll", "Soil dry porosity stress"] 
          : ["Moderate water saturation"],
        observed_pathogens: record.pesticide_use_kg_per_ha > 30
          ? ["Symptomatic fungal leaf spot", "Emerged insecticide tolerance"]
          : ["Trace natural pest presence"]
      },
      carbon_inputs: {
        tillage_frequency_yr: record.adaptation_strategy === "Drought-resistant Crops" ? 1 : 2,
        diesel_liters_used_yr: Math.round(record.pesticide_use_kg_per_ha * 20 + 800),
        synthetic_nitrogen_kg_yr: Math.round(record.fertilizer_use_kg_per_ha * 30),
        acreage: 150
      },
      biodiversity_data: {
        has_wildlife_corridors: record.soil_health_index > 70,
        native_vegetation_pct: Math.round(record.soil_health_index * 0.25)
      }
    };
  };

  // Filtered records
  const filteredRecords = REAL_WORLD_DATA.filter((r) => {
    if (countryFilter !== "All" && r.country !== countryFilter) return false;
    if (cropFilter !== "All" && r.crop_type !== cropFilter) return false;
    return true;
  });

  useEffect(() => {
    if (contextMode === "blueprints") {
      const bp = blueprints.find((b) => b.id === selectedBlueprint);
      if (bp) {
        setFarmData(bp.data);
      }
    } else {
      const activeRecord = filteredRecords[selectedRecordIndex] || filteredRecords[0];
      if (activeRecord) {
        setFarmData(mapRealWorldToFarmData(activeRecord));
        setUserRequest(`Formulate a sustainable multi-agent transition workflow solving our key ecological constraints under the adaptation path of ${activeRecord.adaptation_strategy}.`);
      }
    }
  }, [contextMode, selectedBlueprint, blueprints, countryFilter, cropFilter, selectedRecordIndex]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.history) {
        setHistoryList(data.history);
      }
    } catch (e) {
      console.error("Error loading runs history:", e);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to purge all historical simulation logs?")) return;
    try {
      const res = await fetch("/api/history/clear", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setHistoryList([]);
        setActiveHistoryInspection(null);
      }
    } catch (e) {
      console.error("Failed to empty history:", e);
    }
  };

  const startSimulation = async () => {
    setSimLoading(true);
    setSimError("");
    setSimResult(null);
    setSystemLogs([]);
    
    // Progress Step 1: Supervisor planning
    setSimulationStep("supervisor");
    setSystemLogs(prev => [...prev, "[Supervisor] Waking up Chief Sustainability Agent... Analyzing inputs..."]);
    
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_request: userRequest, farm_data: farmData }),
      });
      
      const data = await response.json();
      if (response.status !== 200 || data.error) {
        throw new Error(data.error || "Simulation response error.");
      }

      // Step 2: Transition to Specialists parallel execution (delay to allow visualization of the agent threads!)
      setTimeout(() => {
        setSimulationStep("specialists");
        setSystemLogs(prev => [
          ...prev, 
          "[Team Hub] Handing assignments to Soil Scientist, Climatologist, Hydrologist, Pathologist, Carbon Analyst, Ecologist...",
          "[MCP Soil Server] analyze_soil() tool triggered successfully.",
          "[MCP Weather Server] get_weather() & get_rainfall_history() retrieved.",
          "[MCP Carbon Server] calculate_carbon() operations finalized."
        ]);

        // Step 3: Transition to Critic safety check
        setTimeout(() => {
          setSimulationStep("critic");
          setSystemLogs(prev => [
            ...prev,
            "[Critic] Specialized data converging. Initiating scientific safety audit...",
            "[Critic] Analyzing potential contradictions (soil aeration vs no-till, pesticide usage vs wild borders)...",
            `[Critic] Calculated composite scientific confidence rating: ${data.critic.overall_scientific_confidence_pct}%. Approved.`
          ]);

          // Step 4: Human-in-the-Loop block!
          setTimeout(() => {
            setSimulationStep("human");
            setSystemLogs(prev => [
              ...prev,
              "[LangGraph Bridge] INTERCEPT TRIPPED: Node 'human_approval' paused waiting for human authorization signatures."
            ]);
            // Buffer the final compiled dataset in local state to retrieve on approval
            setSimResult(data);
            setSimLoading(false);
          }, 2400);

        }, 3200);

      }, 1800);

    } catch (err: any) {
      console.error("Simulation error:", err);
      setSimError(err.message || "Assessments run failed.");
      setSimLoading(false);
      setSimulationStep("idle");
    }
  };

  const authorizeSimulation = () => {
    if (!simResult) return;
    
    setSimLoading(true);
    setSimulationStep("decision");
    setSystemLogs(prev => [
      ...prev,
      `[Human Block] Signatures confirmed. Optional instructions received: "${humanRule || "None provided"}"`,
      "[Decision Agent] Translating parsed parameters into agricultural advisory roadmap...",
      "[Decision Agent] Adding milestone target ratings and CaPex estimations...",
      "[LangGraph Bridge] Workflow execution completed successfully. Report persisted inside local database adapter."
    ]);

    setTimeout(() => {
      setSimulationStep("completed");
      setSimLoading(false);
      fetchHistory(); // Reload history logs
    }, 2000);
  };

  const handleCustomFieldChange = (section: string, field: string, value: any) => {
    setFarmData((prev) => {
      const copy = { ...prev } as any;
      if (section) {
        copy[section] = { ...copy[section], [field]: value };
      } else {
        copy[field] = value;
      }
      return copy;
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-700 flex flex-col selection:bg-emerald-700 selection:text-white">
      
      {/* Header Bar */}
      <header className="bg-white border-b border-stone-200 shrink-0 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700 text-white rounded-lg shadow-sm">
              <Trees className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-stone-850 tracking-tight leading-none">SustainEco-AI</h1>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                Autonomous Multi-Agent Decision Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full font-mono">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>UTC: {new Date().toISOString().slice(11, 16)}</span>
            </div>
            
            <a 
              href="#workspace-files"
              onClick={() => setActiveTab("codebase")}
              className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Inspect Policy Frameworks</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Framework Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Navigation Sidebar Drawer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-stone-200 pb-px">
          <button
            onClick={() => { setActiveTab("dashboard"); setActiveHistoryInspection(null); }}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              activeTab === "dashboard" && !activeHistoryInspection
                ? "border-emerald-700 text-emerald-800 bg-emerald-500/5"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Advisory Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab("codebase")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              activeTab === "codebase"
                ? "border-emerald-700 text-emerald-800 bg-emerald-500/5"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ecosystem Framework Rules</span>
          </button>

          <button
            onClick={() => setActiveTab("mcp_logs")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              activeTab === "mcp_logs"
                ? "border-emerald-700 text-emerald-800 bg-emerald-500/5"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Telemetry Connectors</span>
          </button>

          <button
            onClick={() => setActiveTab("langsmith")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              activeTab === "langsmith"
                ? "border-emerald-700 text-emerald-800 bg-emerald-500/5"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ESG Assurance Audit</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
              activeTab === "history" || activeHistoryInspection
                ? "border-emerald-700 text-emerald-800 bg-emerald-500/5"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historical Assessments ({historyList.length})</span>
          </button>
        </div>

        {/* CONTENT ZONE */}

        {/* 1. DISPATCHER DASHBOARD */}
        {activeTab === "dashboard" && !activeHistoryInspection && (
          <CommandCenterView
            farmData={farmData}
            simulationStep={simulationStep}
            simLoading={simLoading}
            systemLogs={systemLogs}
            simResult={simResult}
            onCustomFieldChange={handleCustomFieldChange}
            onStartSimulation={startSimulation}
            onAuthorizeSimulation={authorizeSimulation}
            humanRule={humanRule}
            setHumanRule={setHumanRule}
            selectedBlueprintId={selectedBlueprint}
            onBlueprintSelect={setSelectedBlueprint}
          />
        )}

        {/* 2. HISTORY LIST VIEW */}
        {activeTab === "history" && !activeHistoryInspection && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-stone-850 text-sm tracking-tight uppercase">Previous Assessment Runs</h3>
              </div>
              {historyList.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-bold transition mr-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Logs</span>
                </button>
              )}
            </div>

            {historyList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-stone-500 h-[300px]">
                <Clock className="w-12 h-12 text-stone-200 mb-2" />
                <p className="text-sm font-bold uppercase tracking-wider text-stone-400">Memory History Cleared</p>
                <p className="text-xs text-stone-400 mt-1">Previous assessments logged on server are empty.</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 h-[500px] overflow-y-auto pr-1">
                {historyList.map((run, idx) => (
                  <div key={idx} className="py-4 hover:bg-emerald-500/5 px-2.5 rounded transition flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-800">{run.farm_data.farm_name}</span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          {run.decision?.unifying_agricultural_paradigm || "Regenerative Paradigm"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 font-mono">Run ID: {run.run_id} — {new Date(run.timestamp).toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveHistoryInspection(run)}
                        className="text-xs font-bold bg-emerald-700 hover:bg-emerald-850 text-white px-3 py-1.5 rounded transition"
                      >
                        Inspect Result
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. HISTORY INDIVIDUAL INSPECTOR SCREEN */}
        {activeHistoryInspection && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-stone-100 border border-stone-200 p-4 rounded-xl shadow-sm">
              <div className="text-xs space-y-0.5">
                <span className="text-stone-405 font-bold uppercase text-[9px] tracking-wider block">Inspecting archived simulation results:</span>
                <span className="font-extrabold text-stone-800 text-sm">
                  {activeHistoryInspection.farm_data.farm_name} ({activeHistoryInspection.farm_data.location})
                </span>
              </div>
              <button
                onClick={() => { setActiveHistoryInspection(null); setActiveTab("history"); }}
                className="text-xs font-bold bg-stone-200 hover:bg-stone-300 px-3.5 py-1.5 rounded transition"
              >
                Back to Archives List
              </button>
            </div>

            <ReportDashboard res={activeHistoryInspection} />
          </div>
        )}

        {/* 4. CODE EXPLORER VIEW */}
        {activeTab === "codebase" && (
          <div className="space-y-4">
            <div className="text-xs bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
              <div className="p-1.5 bg-emerald-600 text-white rounded shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-emerald-950 font-normal leading-relaxed">
                Below is the live code browser listing files physically stored in the <strong>sustainai/</strong> workspace folder. This complete project comprises modular expert classes, custom state dicts, FastMCP servers, LangSmith analytics mock judges, FastAPI routers, and testing wrappers.
              </p>
            </div>
            
            <CodeExplorer />
          </div>
        )}

        {/* 5. MCP SERVER CONFIG MONITOR */}
        {activeTab === "mcp_logs" && (
          <div className="space-y-4">
            <div className="text-xs bg-stone-900 text-stone-300 p-4 rounded-xl border border-stone-850 flex items-start gap-3">
              <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="font-mono text-[11px] leading-relaxed">
                Model Context Protocol (MCP) telemetry stream showing sequential and parallel executions of tool configurations. Tools are served from separate python micro-service files mapping values to soil chemistry, carbon offsetting, or web citations grounding.
              </p>
            </div>

            <McpLogsPane logs={simResult?.mcp_logs || []} />
          </div>
        )}

        {/* 6. LANGSMITH TRACES PANEL */}
        {activeTab === "langsmith" && (
          <LangSmithPane report={simResult?.evaluation || null} />
        )}

      </main>

      {/* Footer credits lines */}
      <footer className="bg-white border-t border-stone-200 py-6 mt-auto text-xs text-stone-400 shrink-0">
        <div className="max-w-7xl mx-auto px-4 text-center font-mono space-y-1">
          <div>SUSTAINAI DECISION INTELLIGENCE CLIENT MVP</div>
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            Enterprise Decarbonization & Scientific Adaptation Advisory Platform - Continuous Intelligence Stream
          </div>
        </div>
      </footer>

    </div>
  );
}
