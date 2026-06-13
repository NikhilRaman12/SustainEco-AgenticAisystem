import React, { useState, useEffect } from "react";
import { 
  ChevronRight, Cpu, GitFork, Server, Activity, Users, 
  MessageSquare, Terminal, Eye, Play, Sparkles, UserCheck, 
  Sliders, ArrowUpRight, BarChart3, Clock, AlertTriangle, ShieldCheck, 
  Database, RefreshCw, FileCode, CheckCircle, Compass, HelpCircle,
  TrendingUp, ArrowRight, Zap, Target, BookOpen, AlertCircle
} from "lucide-react";
import { FarmData, SimulationResult, McpLog } from "../types";
import { BLUEPRINTS } from "../data";
import ReportDashboard from "./ReportDashboard";

interface Props {
  farmData: FarmData;
  simulationStep: "idle" | "supervisor" | "specialists" | "critic" | "human" | "decision" | "completed";
  simLoading: boolean;
  systemLogs: string[];
  simResult: SimulationResult | null;
  onCustomFieldChange: (section: string, field: string, value: any) => void;
  onStartSimulation: () => void;
  onAuthorizeSimulation: () => void;
  humanRule: string;
  setHumanRule: (val: string) => void;
  selectedBlueprintId: string;
  onBlueprintSelect: (id: string) => void;
}

export default function CommandCenterView({
  farmData,
  simulationStep,
  simLoading,
  systemLogs,
  simResult,
  onCustomFieldChange,
  onStartSimulation,
  onAuthorizeSimulation,
  humanRule,
  setHumanRule,
  selectedBlueprintId,
  onBlueprintSelect
}: Props) {
  
  const [activePane, setActivePane] = useState<"workspace" | "chat" | "mcp" | "memory">("workspace");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("supervisor");

  // Generate dynamic inter-agent messaging depending on active blueprint
  const getAgentMessages = () => {
    const isAg = selectedBlueprintId === "ca_tomato";
    const isChem = selectedBlueprintId === "chemical_remediation";
    const isWater = selectedBlueprintId === "thermal_watershed";
    
    if (isAg) {
      return [
        { sender: "Supervisor", role: "Chief Coordinator", text: "Waking up All specialized agents. Dispatching multi-acre Fresno tomato crop profiles.", time: "14:02:11" },
        { sender: "SoilAgent", role: "Soil Chemistry Analyst", text: "FastMCP Soil Server triggered. ph: 7.9 is alkaline, organic matter: 1.1% reports CRITICAL warning levels.", time: "14:02:12" },
        { sender: "WaterAgent", role: "Hydrology Expert", text: "Irrigation method overhead sprinkler features major water waste. Recommending urgent transition to subsurface drip networks.", time: "14:02:12" },
        { sender: "ClimateAgent", role: "NASA Weather Specialist", text: "Historical regional climate archives downloaded. Prolonged drought warnings are flagged for Fresno County.", time: "14:02:13" },
        { sender: "CarbonAgent", role: "Footprint Auditor", text: "Tillage operations carbon release computed at 45.0 tCO2e/yr. No-Till VM0042 framework recommended.", time: "14:02:13" },
        { sender: "CriticAgent", role: "Scientific Audit Lead", text: "CRITIC INTERCEPT: Soil specialist tillage plowing plan conflicts with carbon analyst's zero-tillage rules. Solution: Deploy narrow Strip-Tillage restricted to tomato planting lines.", time: "14:02:14" },
        { sender: "HumanNode", role: "Corporate HIL Gateway", text: "State cached. Thread execution paused. Awaiting certified stakeholder signature...", time: "14:02:15" },
        { sender: "DecisionAgent", role: "Strategy Compiler", text: "Approval confirmed. Generating 3-year regenerative roadmap with exact budget CaPex variables.", time: "14:02:17" }
      ];
    } else if (isChem) {
      return [
        { sender: "Supervisor", role: "Chief Coordinator", text: "Initializing Germany petrochemical buffer zone remediation scan.", time: "14:11:02" },
        { sender: "SoilAgent", role: "Soil Chemistry Analyst", text: "FastMCP Soil Server query: ph is at 5.8 (acidic). Soil heavy clay density blocking microbial nutrient channels.", time: "14:11:03" },
        { sender: "BiodiversityAgent", role: "Ecosystem Ecologist", text: "Current buffer native vegetation stands at 14.5% (High relative to monocultures). Recommended wildflower margins to mitigate adjacent contamination drift.", time: "14:11:04" },
        { sender: "CarbonAgent", role: "Footprint Auditor", text: "Calculated existing organic carbon sink sequestering 4.5 tCO2e/acre annually. Seeding bio-remediation covers will double target levels.", time: "14:11:05" },
        { sender: "CriticAgent", role: "Scientific Audit Lead", text: "Review: Chemical effluent risk limits evaluated. Heavy metals need robust bio-phytoremediation coverages. No conflicts noted.", time: "14:11:05" },
        { sender: "HumanNode", role: "Corporate HIL Gateway", text: "State serialized. Awaiting physical signature approvals...", time: "14:11:06" }
      ];
    } else if (isWater) {
      return [
        { sender: "Supervisor", role: "Chief Coordinator", text: "Activating Ohio Power Thermal Watershed discharge basin telemetry.", time: "14:15:33" },
        { sender: "WaterAgent", role: "Hydrology Expert", text: "Fluvial cooling discharge loops report 310,000 m³ of annual throughput. Severe thermal-shock risk identified at outflow zone.", time: "14:15:34" },
        { sender: "CropAgent", role: "Plant Pathologist", text: "Saturated hypoxic conditions detected in soil margins. Algal and organic root-rot pathogens active.", time: "14:15:35" },
        { sender: "CriticAgent", role: "Scientific Audit Lead", text: "Audit: Thermal cooling rates verified. Riparian Vetiver & deep-rooted cordgrass specified to prevent erosion degradation. Approved.", time: "14:15:36" }
      ];
    } else {
      return [
        { sender: "Supervisor", role: "Chief Coordinator", text: "Waking up Eurasian Restorative Steppe reserve agents.", time: "14:18:21" },
        { sender: "ClimateAgent", role: "NASA Weather Specialist", text: "Drought risk rating is HIGH. Passive ice snowmelt captures recommended inside swales.", time: "14:18:22" },
        { sender: "BiodiversityAgent", role: "Ecosystem Ecologist", text: "Native baseline vegetation is 82.0%. High biological recovery indicators active.", time: "14:18:23" }
      ];
    }
  };

  const agentMessages = getAgentMessages();

  // Selected StateGraph Node Details dictionary
  const graphNodesDict: Record<string, { label: string; role: string; mcp: string; stateImpact: string; desc: string; systemPrompt: string }> = {
    supervisor: {
      label: "supervisor_node",
      role: "Chief Coordinator & Agent Dispatcher",
      mcp: "Database Server (historical profiles lookup)",
      stateImpact: "user_request, industry_type, location, target_objectives",
      desc: "Triggers execution, designs overall plan, delegates analytical domains to specialized agents, maps operational coordinates, and writes primary strategy parameters directly into the graph state.",
      systemPrompt: `system_instructions = """You are Chief Supervisor of SustainEco-AI's Multi-Agent OS. Read user farm requirements, load memory context records, schedule parallel analyst nodes, and monitor Critic scores."""`
    },
    soil: {
      label: "soil_node",
      role: "Topsoil Health & Microbial biochemist",
      mcp: "Soil Server (analyze_soil tool)",
      stateImpact: "soil_results, soil_health_score, core_nutrient_metrics",
      desc: "Calls specialized soil lab simulations via FastMCP, measures cations exchange ratios, calculates organic carbon humification index, and recommends cover formulations.",
      systemPrompt: `soil_diagnostics = """Access local lab data via analyze_soil() tool. Formulate targeted biochar / organic amendment ratios to lock topsoil carbon profiles and offset synthetic Nitrogen usage."""`
    },
    climate_water: {
      label: "climate_&_water_nodes",
      role: "Meteorologist & Water Resources Expert",
      mcp: "Weather Server (get_weather, get_rainfall_history tools)",
      stateImpact: "climate_results, water_results, irrigation_efficiency_pct, water_stress_index",
      desc: "Queries real-time and structural climatology databases. Cross-references water consumption rates against crop transpiration curves to calculate drought risk scales.",
      systemPrompt: `weather_water_directive = """Establish local drought probability metrics. Match irrigation layouts to crop species transpiration indexes to isolate water waste indicators."""`
    },
    carbon: {
      label: "carbon_node",
      role: "GHG Footprint & ESG Auditor",
      mcp: "Carbon Server (calculate_carbon tool)",
      stateImpact: "carbon_results, total_annual_emissions_tco2e, offset_registry_eligibility",
      desc: "Aggregates machine fuel, tillage releases, and nitrous oxide synthetic fertilizer volatizations to build detailed GHG Scope 1/2/3 profiles.",
      systemPrompt: `carbon_audit_prompt = """Calculate overall greenhouse gas ledger. Compare tillage pass variables with carbon sequestration targets to trace offset crediting feasibility."""`
    },
    critic: {
      label: "critic_node",
      role: "Scientific Integrity & Safety Board",
      mcp: "Research Server (literature validations matches)",
      stateImpact: "critic_feedback, overall_scientific_confidence_pct, contradiction_flags",
      desc: "Validates all expert outputs. Check for agronomic clashes (e.g. soil plowing vs no-till, synthetics vs bio-habitats) and outputs standard confidence scores.",
      systemPrompt: `scientific_critic_audit = """Cross-examine all spatial suggestions. Check the database for conflicts with environmental limits. Require revision if overall confidence score drops under 70%."""`
    },
    human: {
      label: "human_review_node",
      role: "Interactive Thread Intercept & Signature",
      mcp: "None (Synchronous Thread Intercept)",
      stateImpact: "human_feedback_text, authorized_signature_flag",
      desc: "Invokes LangGraph's native thread pause capability. Serializes active variables to disk and opens human-in-the-loop input gates, resuming only upon confirmation.",
      systemPrompt: `hil_interrupt_directive = "Awaiting physical enterprise signature & target CaPex adjustments to serialize unified recommendations."`
    },
    decision: {
      label: "decision_node",
      role: "3-Year Strategic Roadmap Compiler",
      mcp: "Database Adapter (report serialization)",
      stateImpact: "final_recommendations, year_1_2_3_milestones, projected_gain_indexes",
      desc: "Merges authorized parameters. Translates chemical, water, climate, and carbon goals into 3-Year landmark roadmaps styled in strict compliance JSON formats.",
      systemPrompt: `synthesis_prompt = """Compile final unified strategic advisory dossier. Style milestones by difficulty and CAPEX ratings, attaching empirical FAO academic citations."""`
    }
  };

  const selectedNode = graphNodesDict[selectedNodeId] || graphNodesDict.supervisor;

  // Custom simulation logging step tracking
  const getStepHeadline = () => {
    switch(simulationStep) {
      case "supervisor": return "Chief Supervisor: Policy Orchestration";
      case "specialists": return "Parallel Analysts: Diagnostic Gathering";
      case "critic": return "Scientific Critic: Contradiction Check";
      case "human": return "Executive Threshold: Paused for Authorization";
      case "decision": return "Decision Agent: Strategic Compiler";
      case "completed": return "Multi-Agent Workflow Serialized";
      default: return "Multi-Agent System Dormant";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sector & Blueprint Selection Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-emerald-800 font-extrabold uppercase tracking-wider block">
              Active Enterprise System Context
            </span>
            <h2 className="text-base font-extrabold text-stone-850 mt-1 uppercase font-sans-display tracking-tight">
              Select Sustainability Domain Sector & Site Facility
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            {BLUEPRINTS.map((bp) => {
              const isActive = selectedBlueprintId === bp.id;
              let sectorLabel = "🌾 AGRI";
              if (bp.id === "chemical_remediation") sectorLabel = "🧪 CHEM";
              if (bp.id === "thermal_watershed") sectorLabel = "🏭 MANU";
              if (bp.id === "grassland_reserve") sectorLabel = "🌍 CLIM";

              return (
                <button
                  key={bp.id}
                  onClick={() => onBlueprintSelect(bp.id)}
                  disabled={simLoading || simulationStep !== "idle" && simulationStep !== "completed"}
                  className={`px-3 py-2 rounded-lg text-xs font-bold font-sans tracking-wide transition border uppercase ${
                    isActive 
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                      : "bg-stone-50 text-stone-500 hover:text-stone-800 hover:bg-stone-100 border-stone-200"
                  } disabled:opacity-50`}
                >
                  <span className="block text-[8px] font-mono opacity-80">{sectorLabel}</span>
                  <span className="block font-sans-display font-extrabold mt-0.5 max-w-[120px] truncate">{bp.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Active Facility Subtitle */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <p className="text-stone-550 leading-relaxed max-w-2xl">
            <strong className="text-emerald-800 font-bold uppercase mr-1">Facility Description:</strong> 
            {BLUEPRINTS.find(b => b.id === selectedBlueprintId)?.description}
          </p>
          <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-3 py-1 rounded font-mono text-[10.5px]">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-stone-600 font-bold">{farmData.location}</span>
          </div>
        </div>
      </div>

      {/* Main Command Center Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hand: INPUT PARAMETERS CONFIGURATOR & CONTROLS */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-5 flex-1">
            <div className="border-b border-stone-150 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-800" />
                <h3 className="font-extrabold text-stone-850 text-xs tracking-tight uppercase">
                  State Variables Configurator
                </h3>
              </div>
              <span className="text-[9px] font-mono text-stone-400 uppercase">State Registers</span>
            </div>

            {/* Config Fields Form depending on industry selected */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1">
                  Primary Enterprise Asset / Cultivar:
                </label>
                <input
                  type="text"
                  value={farmData.crop_name}
                  onChange={(e) => onCustomFieldChange("", "crop_name", e.target.value)}
                  disabled={simLoading}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-1.5 text-xs text-stone-800 font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1">
                  Chemical Target Active pH:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.1"
                    value={farmData.soil_data.ph}
                    onChange={(e) => onCustomFieldChange("soil_data", "ph", parseFloat(e.target.value))}
                    disabled={simLoading}
                    className="flex-1 accent-emerald-800 h-1"
                  />
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-11 text-center">
                    {farmData.soil_data.ph}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1">
                  Organic Matter / Active Carbon Carbon %:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={farmData.soil_data.organic_matter_pct}
                    onChange={(e) => onCustomFieldChange("soil_data", "organic_matter_pct", parseFloat(e.target.value))}
                    disabled={simLoading}
                    className="flex-1 accent-emerald-800 h-1"
                  />
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-11 text-center">
                    {farmData.soil_data.organic_matter_pct}%
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1">
                  Annual Irrigation Drawdown volume (m³):
                </label>
                <input
                  type="number"
                  value={farmData.water_data.annual_consumption_m3}
                  onChange={(e) => onCustomFieldChange("water_data", "annual_consumption_m3", parseInt(e.target.value) || 0)}
                  disabled={simLoading}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-1.5 text-xs text-stone-800 font-mono focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1 col-span-1">
                    Tillage Passes (/yr):
                  </label>
                  <select
                    value={farmData.carbon_inputs.tillage_frequency_yr}
                    onChange={(e) => onCustomFieldChange("carbon_inputs", "tillage_frequency_yr", parseInt(e.target.value))}
                    disabled={simLoading}
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-850 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-emerald-700 transition"
                  >
                    <option value={0}>0 (Strict No-Till)</option>
                    <option value={1}>1 (Minimum till)</option>
                    <option value={2}>2 (Rotational till)</option>
                    <option value={3}>3 (Frequent tillage)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1 col-span-1">
                    Organic Corridors:
                  </label>
                  <select
                    value={farmData.biodiversity_data.has_wildlife_corridors ? "true" : "false"}
                    onChange={(e) => onCustomFieldChange("biodiversity_data", "has_wildlife_corridors", e.target.value === "true")}
                    disabled={simLoading}
                    className="w-full bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-xs text-stone-850 font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-emerald-700 transition"
                  >
                    <option value="true">Active corridors</option>
                    <option value="false">No buffers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1">
                  Synthetic Nitro / Chemistry inputs (kg/yr):
                </label>
                <input
                  type="number"
                  value={farmData.carbon_inputs.synthetic_nitrogen_kg_yr}
                  onChange={(e) => onCustomFieldChange("carbon_inputs", "synthetic_nitrogen_kg_yr", parseInt(e.target.value) || 0)}
                  disabled={simLoading}
                  className="w-full bg-stone-50 border border-stone-200 rounded px-3 py-1.5 text-xs text-stone-800 font-mono focus:bg-white focus:ring-1 focus:ring-emerald-700 outline-none transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider block mb-1">
                  Active Directives to virtual staff:
                </label>
                <textarea
                  value={humanRule ? `Focus directive: ${humanRule}` : "Analyze localized ecological balances, verify carbon mitigation profiles, challenge structural soil organic indicators and execute 3-Year Unified Transition recommendations."}
                  readOnly
                  className="w-full bg-stone-105 border border-stone-200 rounded p-2 text-[10.5px] leading-relaxed text-stone-500 font-mono h-24 select-all resize-none outline-none"
                />
              </div>

            </div>
          </div>

          {/* Core Run Action Button Trigger */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
            <button
              onClick={onStartSimulation}
              disabled={simLoading || simulationStep === "human" || ["supervisor", "specialists", "critic", "decision"].includes(simulationStep)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-800 hover:bg-emerald-850 text-white font-extrabold uppercase tracking-widest text-[11px] rounded-lg shadow-sm hover:shadow transition disabled:opacity-50 font-mono cursor-pointer"
            >
              {simLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>Executing Graph Nodes...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-350 fill-emerald-350" />
                  <span>Boot SustainEco-AI Agent OS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Hand: AI AGENT COMMAND DECK */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="bg-stone-900 border border-stone-950 text-stone-200 rounded-xl overflow-hidden flex flex-col justify-between flex-1 min-h-[520px] shadow-lg">
            
            {/* Command bar header tabs */}
            <div className="bg-stone-950 border-b border-stone-850 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-900" />
                <h4 className="text-[11px] font-mono font-bold tracking-wider text-stone-300 uppercase">
                  AI Agent Command Deck: {getStepHeadline()}
                </h4>
              </div>

              {/* Sub tabs selectors */}
              <div className="flex items-center bg-stone-900 p-1 rounded-lg border border-stone-850 shrink-0 self-start text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setActivePane("workspace")}
                  className={`px-3 py-1.5 rounded font-bold transition uppercase ${
                    activePane === "workspace" ? "bg-stone-800 text-emerald-400 border border-stone-750" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Workflow DAG
                </button>
                <button
                  type="button"
                  onClick={() => setActivePane("chat")}
                  className={`px-3 py-1.5 rounded font-bold transition uppercase ${
                    activePane === "chat" ? "bg-stone-800 text-emerald-400 border border-stone-750" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  A2A Chatter
                </button>
                <button
                  type="button"
                  onClick={() => setActivePane("mcp")}
                  className={`px-3 py-1.5 rounded font-bold transition uppercase ${
                    activePane === "mcp" ? "bg-stone-800 text-emerald-400 border border-stone-750" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  FastMCP Tools
                </button>
                <button
                  type="button"
                  onClick={() => setActivePane("memory")}
                  className={`px-3 py-1.5 rounded font-bold transition uppercase ${
                    activePane === "memory" ? "bg-stone-800 text-emerald-400 border border-stone-750" : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Memory Sinks
                </button>
              </div>
            </div>

            {/* Pane Content body container */}
            <div className="p-5 flex-1 overflow-y-auto">
              
              {/* PANE 1: WORKSPACE STATEGRAPH SYSTEM */}
              {activePane === "workspace" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch h-full">
                  
                  {/* Virtual flow (7 cols) */}
                  <div className="md:col-span-7 bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between min-h-[300px] relative select-none">
                    
                    {/* Subtle grid pattern background */}
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:14px_14px]" />
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-stone-500 font-bold uppercase tracking-widest block">
                        StateGraph DAG Layout & Active Variable Streams
                      </span>
                      {simulationStep !== "idle" && (
                        <span className="flex items-center gap-1 text-[8.5px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/30 font-mono uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-0.5" />
                          RUNNING: {simulationStep}
                        </span>
                      )}
                    </div>

                    {/* Nodes flow visual layout map */}
                    <div className="relative z-10 my-6 py-4 flex flex-col space-y-4 justify-center items-center">
                      
                      {/* Node row 1 - supervisor / chief */}
                      <button
                        type="button"
                        onClick={() => setSelectedNodeId("supervisor")}
                        className={`p-3 rounded-lg border text-left transition-all w-full max-w-[200px] flex flex-col ${
                          selectedNodeId === "supervisor"
                            ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/20"
                            : "border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600"
                        } ${simulationStep === "supervisor" ? "animate-pulse border-emerald-400 ring-2 ring-emerald-500/10" : ""}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">1. Policy Supervisor</span>
                        </div>
                        <span className="text-[8.5px] text-stone-500 font-mono mt-0.5">@supervisor_node</span>
                      </button>

                      <ArrowRight className="w-4 h-4 text-stone-700 rotate-90" />

                      {/* Node row 2 - Specialists parallel cluster */}
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId("soil")}
                          className={`p-2.5 rounded border text-left transition-all w-28 flex flex-col ${
                            selectedNodeId === "soil"
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/20"
                              : "border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600"
                          } ${simulationStep === "specialists" ? "animate-pulse border-emerald-400" : ""}`}
                        >
                          <span className="text-[9.5px] font-bold uppercase leading-none">Chemistry</span>
                          <span className="text-[8px] text-stone-500 mt-1">@soil_node</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedNodeId("climate_water")}
                          className={`p-2.5 rounded border text-left transition-all w-28 flex flex-col ${
                            selectedNodeId === "climate_water"
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/20"
                              : "border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600"
                          } ${simulationStep === "specialists" ? "animate-pulse border-emerald-400" : ""}`}
                        >
                          <span className="text-[9.5px] font-bold uppercase leading-none">Climate/Water</span>
                          <span className="text-[8px] text-stone-500 mt-1">@expert_nodes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedNodeId("carbon")}
                          className={`p-2.5 rounded border text-left transition-all w-28 flex flex-col ${
                            selectedNodeId === "carbon"
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/20"
                              : "border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600"
                          } ${simulationStep === "specialists" ? "animate-pulse border-emerald-400" : ""}`}
                        >
                          <span className="text-[9.5px] font-bold uppercase leading-none">ESG Carbon</span>
                          <span className="text-[8px] text-stone-500 mt-1">@carbon_node</span>
                        </button>
                      </div>

                      <ArrowRight className="w-4 h-4 text-stone-700 rotate-90" />

                      {/* Node row 3 - Critic Board auditor / loop and retry */}
                      <button
                        type="button"
                        onClick={() => setSelectedNodeId("critic")}
                        className={`p-3 rounded-lg border text-left transition-all w-full max-w-[200px] flex flex-col relative ${
                          selectedNodeId === "critic"
                            ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/20"
                            : "border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600"
                        } ${simulationStep === "critic" ? "animate-pulse border-emerald-400" : ""}`}
                      >
                        <span className="absolute -top-2 left-2 text-[8px] bg-red-950/70 text-red-400 font-extrabold px-1 rounded uppercase border border-red-900/50 tracking-wider">
                          Critic Safety override check
                        </span>
                        <div className="flex items-center gap-1.5 pt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">3. Critic Validator</span>
                        </div>
                        <span className="text-[8.5px] text-stone-500 font-mono mt-0.5">@critic_node</span>
                      </button>

                      <ArrowRight className="w-4 h-4 text-stone-700 rotate-90" />

                      {/* Node row 4 - Human block & Decision Compiler */}
                      <div className="flex items-center gap-4 justify-center">
                        <button
                          type="button"
                          onClick={() => setSelectedNodeId("human")}
                          className={`p-2.5 rounded border text-left transition-all w-28 flex flex-col ${
                            selectedNodeId === "human"
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/20"
                              : "border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600"
                          } ${simulationStep === "human" ? "animate-bounce border-amber-500 text-amber-300 bg-amber-950/10" : ""}`}
                        >
                          <span className="text-[9.5px] font-bold uppercase leading-none">4. Human HIL</span>
                          <span className="text-[8px] text-stone-500 mt-1">@human_review</span>
                        </button>

                        <ChevronRight className="w-3.5 h-3.5 text-stone-800 shrink-0" />

                        <button
                          type="button"
                          onClick={() => setSelectedNodeId("decision")}
                          className={`p-2.5 rounded border text-left transition-all w-28 flex flex-col ${
                            selectedNodeId === "decision"
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500/20"
                              : "border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-600"
                          } ${simulationStep === "decision" ? "animate-pulse border-emerald-400" : ""}`}
                        >
                          <span className="text-[9.5px] font-bold uppercase leading-none">5. Strategic compilation</span>
                          <span className="text-[8px] text-stone-500 mt-1">@decision_node</span>
                        </button>
                      </div>

                    </div>

                    <div className="pt-2 border-t border-stone-850 text-center">
                      <span className="text-[8.5px] text-stone-500 font-mono">
                        💡 Click variables / nodes inside the DAG graph to inspect physical state parameters.
                      </span>
                    </div>

                  </div>

                  {/* Metadata inspector side (5 cols) */}
                  <div className="md:col-span-5 bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between font-mono h-full">
                    <div className="space-y-4">
                      <div className="border-b border-stone-850 pb-2.5">
                        <span className="text-[8px] text-emerald-400 block font-bold uppercase tracking-widest">
                          STATEGRAPH INSTANCE EXAMINER
                        </span>
                        <h5 className="text-xs font-black text-stone-200 mt-0.5 uppercase tracking-wide">
                          {selectedNode.label}
                        </h5>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        <div>
                          <strong className="text-[8.5px] text-stone-500 block uppercase tracking-wide">Operational Domain Role:</strong>
                          <span className="text-stone-300 font-bold">{selectedNode.role}</span>
                        </div>

                        <div>
                          <strong className="text-[8.5px] text-stone-500 block uppercase tracking-wide">Write State Registers:</strong>
                          <code className="text-[9.5px] bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded text-emerald-400 block mt-1 overflow-x-auto select-all">
                            {selectedNode.stateImpact}
                          </code>
                        </div>

                        <div>
                          <strong className="text-[8.5px] text-stone-500 block uppercase tracking-wide">FastMCP Servers connection:</strong>
                          <span className="text-[10px] text-stone-400 block mt-0.5">{selectedNode.mcp}</span>
                        </div>

                        <div>
                          <strong className="text-[8.5px] text-stone-500 block uppercase tracking-wide">Action Description:</strong>
                          <p className="text-stone-400 text-[10.5px] leading-relaxed mt-1 select-text">
                            {selectedNode.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-900 border border-stone-850 p-2.5 rounded font-mono text-[8.5px] text-emerald-350 leading-relaxed overflow-x-auto mt-4 shrink-0">
                      <span className="text-stone-500 block mb-1 font-sans font-bold text-[7.5px] tracking-wider uppercase">UNDERLYING PYTHON RULES PROMPT:</span>
                      <pre className="whitespace-pre-wrap select-all">{selectedNode.systemPrompt}</pre>
                    </div>

                  </div>

                </div>
              )}

              {/* PANE 2: A2A AGENT TEXT MESSENGER INTERFACE */}
              {activePane === "chat" && (
                <div className="border border-stone-800 rounded-xl bg-stone-950 overflow-hidden flex flex-col justify-between h-[420px]">
                  
                  {/* Chat banner headers */}
                  <div className="bg-stone-900 border-b border-stone-850 px-4 py-2 flex items-center justify-between text-[11px] shrink-0 font-mono">
                    <div className="flex items-center gap-1.5 text-stone-300">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>SustainEco-AI Inter-Agent A2A Comms Console</span>
                    </div>
                    <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-wider bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">
                      Secured Tunnel
                    </span>
                  </div>

                  {/* Messages list panel stream */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-3.5 select-text">
                    {agentMessages.map((msg, idx) => {
                      const isActiveStep = 
                        (simulationStep === "supervisor" && msg.sender === "Supervisor") ||
                        (simulationStep === "specialists" && ["SoilAgent", "WaterAgent", "ClimateAgent", "CarbonAgent", "BiodiversityAgent"].includes(msg.sender)) ||
                        (simulationStep === "critic" && msg.sender === "CriticAgent") ||
                        (simulationStep === "human" && msg.sender === "HumanNode") ||
                        (simulationStep === "decision" && msg.sender === "DecisionAgent") ||
                        (simulationStep === "completed" && msg.sender === "DecisionAgent");

                      return (
                        <div 
                          key={idx} 
                          className={`flex items-start gap-3 transition-opacity ${
                            isActiveStep ? "opacity-100 ring-1 ring-emerald-500/20 p-2 bg-emerald-950/10 rounded" : "opacity-60"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                            msg.sender === "Supervisor" ? "bg-emerald-800 text-white" :
                            msg.sender === "CriticAgent" ? "bg-red-950 text-red-300 border border-red-900" :
                            msg.sender === "HumanNode" ? "bg-amber-950 text-amber-300 border border-amber-800 animate-pulse" :
                            "bg-stone-800 text-emerald-400"
                          }`}>
                            {msg.sender.substring(0, 2).toUpperCase()}
                          </div>
                          
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <span className="font-extrabold text-stone-200">{msg.sender}</span>
                                <span className="text-[9px] text-stone-500 bg-stone-900 px-1.5 py-0.2 rounded">
                                  {msg.role}
                                </span>
                              </div>
                              <span className="text-[8.5px] text-stone-600 font-mono">{msg.time}</span>
                            </div>
                            
                            <p className="text-stone-300 text-[11px] leading-relaxed font-sans font-normal">
                              {msg.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Operational placeholder typing indicator */}
                  {(simulationStep !== "idle" && simulationStep !== "completed") ? (
                    <div className="bg-stone-900/40 px-4 py-2 border-t border-stone-850 font-mono text-[9.5px] text-emerald-450 italic flex items-center gap-2 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>{simulationStep.toUpperCase()}_node is active and serializing variables to StateGraph channel memory...</span>
                    </div>
                  ) : null}

                </div>
              )}

              {/* PANE 3: FAST_MCP SERVERS DECLARATIONS LIST */}
              {activePane === "mcp" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  
                  {/* Server 1 - Weather */}
                  <div className="bg-stone-950 border border-stone-805 rounded-xl p-4 space-y-3 font-mono">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-stone-200 uppercase leading-none">Weather Server</h4>
                        <span className="text-[9px] text-emerald-500 mt-1 block">mcp_server_nasa_climatology.py</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="text-emerald-400 font-bold">tools.get_weather(lat, lon)</div>
                      <div className="text-emerald-400 font-bold">tools.get_rainfall_history(location)</div>
                      <p className="text-stone-400 text-[10px] leading-relaxed font-sans mt-2">
                        Retrieves high-resolution historical precipitation anomalies, heat stresses thresholds, and annual averages directly from spatial weather models.
                      </p>
                    </div>
                  </div>

                  {/* Server 2 - Soil */}
                  <div className="bg-stone-950 border border-stone-805 rounded-xl p-4 space-y-3 font-mono">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-stone-200 uppercase leading-none">Soil Server</h4>
                        <span className="text-[9px] text-emerald-500 mt-1 block">mcp_server_soil.py</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="text-emerald-400 font-bold">tools.analyze_soil(ph, organic_matter)</div>
                      <p className="text-stone-400 text-[10px] leading-relaxed font-sans mt-2">
                        Performs soil laboratory nutrient mapping algorithms, calculates biological respiration index coefficients, and outputs required soil inputs.
                      </p>
                    </div>
                  </div>

                  {/* Server 3 - Carbon */}
                  <div className="bg-stone-950 border border-stone-805 rounded-xl p-4 space-y-3 font-mono">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-stone-200 uppercase leading-none">Carbon ESG Server</h4>
                        <span className="text-[9px] text-emerald-500 mt-1 block">mcp_carbon_audit.py</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="text-emerald-400 font-bold">tools.calculate_carbon(fuels, synthetic_N, tillage)</div>
                      <p className="text-stone-400 text-[10px] leading-relaxed font-sans mt-2">
                        Calculates global GHG Scope 1 fossil and Scope 3 volatile Nitrous Oxide emissions, comparing agricultural processes to standard registries rules.
                      </p>
                    </div>
                  </div>

                  {/* Server 4 - Research */}
                  <div className="bg-stone-950 border border-stone-850 rounded-xl p-4 space-y-3 font-mono">
                    <div className="flex items-center gap-2 border-b border-stone-850 pb-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-stone-200 uppercase leading-none">Academic Library Server</h4>
                        <span className="text-[9px] text-emerald-500 mt-1 block">mcp_scientific_library.py</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="text-emerald-400 font-bold">tools.search_scientific_information(query)</div>
                      <p className="text-stone-400 text-[10px] leading-relaxed font-sans mt-2">
                        Performs smart grounded semantic searches inside agricultural and environmental peer-reviewed study repositories to compile real-world citations.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {/* PANE 4: MEMORY RETRIEVAL & CONTEXT STORAGE */}
              {activePane === "memory" && (
                <div className="space-y-4 font-mono text-xs select-text">
                  <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block border-b border-stone-850 pb-2">
                      MongoDB & LangGraph Long-Term Thread Memory Sinks
                    </span>
                    
                    <div className="space-y-3.5 text-stone-300">
                      <div>
                        <span className="text-[9px] text-stone-500 block">SHORT TERM LOCAL STATE (THREAD CHANNEL KEYS):</span>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span className="text-[10px] px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">run_id: &quot;run_ca_tomato_91&quot;</span>
                          <span className="text-[10px] px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">checkpoint_id: &quot;parent_state_04&quot;</span>
                          <span className="text-[10px] px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">water_stress_index: &quot;High&quot;</span>
                          <span className="text-[10px] px-2 py-0.5 bg-stone-900 border border-stone-800 rounded">critic_validation_signature: &quot;true&quot;</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[9px] text-stone-500 block uppercase">LONG-TERM MEMORY (PERSISTED MongoDB HISTORICAL METRICS):</span>
                        <div className="space-y-2 mt-2">
                          <div className="p-3 bg-stone-900 border border-stone-850 rounded text-[10.5px]">
                            <div className="flex items-center justify-between text-[9px] text-orange-400 font-extrabold mb-1">
                              <span>MATCHED ARCHIVE RETRIEVAL #1</span>
                              <span>94% CONFIDENCE</span>
                            </div>
                            <p className="text-stone-300 leading-relaxed font-sans font-normal">
                              Successfully extracted historical transition records for centralized Central Valley tomato crops. Year 1 transition required strip-tillage to overcome extreme clay consolidations and avoid water runoff index increases.
                            </p>
                          </div>
                          
                          <div className="p-3 bg-stone-900 border border-stone-850 rounded text-[10.5px]">
                            <div className="flex items-center justify-between text-[9px] text-emerald-400 font-extrabold mb-1">
                              <span>CLIENT PREFERENCES MATCHED #2</span>
                              <span>100% REGION COMPLIANCE</span>
                            </div>
                            <p className="text-stone-300 leading-relaxed font-sans font-normal">
                              California Central Valley regional water mandates require strict deep-well aquifer drawing quotas. Recommending drip conversion unlocks 35% water conservation credits qualifying for municipal sub-grants.
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* System Console Logs footer pane */}
            <div className="bg-stone-950 border-t border-stone-850 p-4 font-mono text-[10.5px] shrink-0 font-normal">
              <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-2 select-none">
                <span className="text-stone-450 uppercase tracking-wider text-[8.5px] font-bold">System Runtime Log Telemetry</span>
                <span className="text-[8px] text-stone-500 uppercase">ACTIVE TRACE: {selectedBlueprintId.toUpperCase()}_PIPELINE</span>
              </div>
              <div className="space-y-1 max-h-[100px] overflow-y-auto select-all scrollbar-thin pr-1">
                {systemLogs.length === 0 ? (
                  <div className="text-stone-500 italic">Console inactive. Trigger &quot;Boot SustainEco-AI Agent OS&quot; to inspect logs...</div>
                ) : (
                  systemLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 text-stone-300 text-[10px]">
                      <span className="text-emerald-400 font-bold select-none">&gt;</span>
                      <p>{log}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* HUMAN GATE INTERCEPT BOARD IN SYSTEM */}
          {simulationStep === "human" && (
            <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-4 shadow-sm flex flex-col md:flex-row items-center gap-5 transition duration-300">
              <div className="p-3.5 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0 animate-bounce">
                <UserCheck className="w-6 h-6" />
              </div>
              
              <div className="space-y-2 flex-1 w-full text-xs font-sans">
                <div>
                  <h4 className="font-extrabold text-stone-850 text-xs uppercase font-sans-display tracking-tight">
                    LangGraph State Transition Block: Human Approval Required
                  </h4>
                  <p className="text-stone-550 mt-1 leading-relaxed">
                    The specialists calculations and Science Critic audit rules are locked into thread memory. Click &quot;Authorize &amp; Compile&quot; to authorize the Decision Agent to synthesize the unified roadmap.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 items-stretch">
                  <input
                    type="text"
                    placeholder="Provide optional custom directives (e.g., focus on low-investments)..."
                    value={humanRule}
                    onChange={(e) => setHumanRule(e.target.value)}
                    className="flex-1 bg-white border border-stone-200 rounded px-3 py-2 text-stone-800 font-mono outline-none focus:ring-1 focus:ring-amber-500 transition"
                  />
                  
                  <button
                    onClick={onAuthorizeSimulation}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold uppercase text-[10px] tracking-widest rounded-lg transition shrink-0 cursor-pointer font-mono"
                  >
                    Authorize &amp; Compile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EMPTY EXPECTANT VIEW CONTAINER */}
          {simulationStep === "idle" && (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-stone-200 rounded-xl h-[130px] shadow-xs">
              <Compass className="w-7 h-7 text-emerald-800/20 mb-2" />
              <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mt-1">Awaiting Control Inception</p>
              <p className="text-stone-400 text-xs font-sans font-normal mt-1 leading-relaxed max-w-md">
                Configure your state registers, select a facility context, and boot the operating system system to initiate analyses.
              </p>
            </div>
          )}

          {/* DYNAMIC PIPELINE SPINNING LOADER */}
          {simLoading && ["supervisor", "specialists", "critic", "decision"].includes(simulationStep) && (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-stone-200 rounded-xl h-[130px] shadow-xs">
              <div className="w-6 h-6 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mb-2.5" />
              <h4 className="text-[10px] font-extrabold text-stone-800 uppercase tracking-widest animate-pulse">
                Active LangGraph Node Stage: {simulationStep.toUpperCase()}...
              </h4>
              <p className="text-[10.5px] text-stone-400 mt-1 font-sans font-normal">
                Querying python FastMCP servers, evaluating risk indicators, and assembling variables.
              </p>
            </div>
          )}

          {/* ADVISORY REPORT VIEW */}
          {simulationStep === "completed" && simResult && (
            <div className="pt-1">
              <ReportDashboard res={simResult} />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
