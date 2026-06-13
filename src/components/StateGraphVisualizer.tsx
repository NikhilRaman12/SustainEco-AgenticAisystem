import React, { useState } from "react";
import { 
  Cpu, GitFork, Settings, ArrowRight, Layers, FileJson, 
  Server, Activity, Compass, ShieldCheck, Heart, UserCheck, 
  Database, HelpCircle, RefreshCw, BarChart2
} from "lucide-react";
import { FarmData } from "../types";

interface Props {
  farmData: FarmData;
  simulationStep: "idle" | "supervisor" | "specialists" | "critic" | "human" | "decision" | "completed";
}

export default function StateGraphVisualizer({ farmData, simulationStep }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<"dag" | "state" | "mcp">("dag");
  const [selectedNode, setSelectedNode] = useState<string>("supervisor");

  // LangGraph Node definition map
  const nodes = [
    {
      id: "supervisor",
      label: "1. Policy Director Node",
      role: "Strategy Synthesis / Chief Coordinator",
      stateImpact: "planning_directives, task_queue, primary_objective",
      mcpCalled: "None (Orchestratonal Core)",
      description: "Acts as SustainEco-AI's orchestrator. It receives raw agronomic attributes (pH, precipitation, acreage) along with client request strings, drafts a high-level research plan, dynamically populates the LangGraph state channel, and delegates execution tokens to specialized field advisor agents.",
      prompt: `system_instructions = """You are SustainEco-AI's Chief Orchestrator. Assess the client's historical crop profile, soil parameters, and climate shocks. Dispatch parallel research sub-tasks to Specialist MCP Nodes."""`
    },
    {
      id: "specialists",
      label: "2. Field Experts Cluster",
      role: "Parallel Diagnosticians & Advisories",
      stateImpact: "soil_diagnostics, hydrology_report, carbon_calculus, bio_metrics",
      mcpCalled: "Soil Server, Weather Server, Carbon Server, Biodiversity Server",
      description: "Coordinates six independent, parallel specialist agents. These agents utilize model context protocol (MCP) server endpoints as tools to fetch regional precipitation histories, estimate biochar carbon sequestration ratios, evaluate nitrogen run-off rates, and identify pest infestation thresholds, storing structured recommendations directly into the graph state.",
      prompt: `specialist_context = """Each specialist is mapped to a dedicated Python FastMCP Server. Trigger investigate_soil(), calculate_carbon_sequestration() and query_rainfall() to gather grounded facts."""`
    },
    {
      id: "critic",
      label: "3. Audit Validator Node",
      role: "Scientific Integrity Board / Safety Gate",
      stateImpact: "critic_verdict, confidence_rating, corrective_requirements",
      mcpCalled: "Ground Research Server",
      description: "A specialized critic agent that intercepts the aggregated field advisories. It validates advice consistency (e.g. ensuring organic cover mix directives do not conflict with soil moisture deficit indexes), computes scientific confidence indicators, and issues hard override directives if recommendations fail standard academic safety rules.",
      prompt: `critic_directive = """Cross-examine all agronomic recommendations. Check for safety, feasibility, Capex boundaries, and local regulatory drift. Approve or route back to Supervisor."""`
    },
    {
      id: "human",
      label: "4. Executive Gateway",
      role: "Corporate Stakeholder Human-in-the-Loop Intercept",
      stateImpact: "human_override_directives, validation_signatures",
      mcpCalled: "None (Interactive Thread Pause)",
      description: "Uses LangGraph StateGraph's pause/resume mechanics. When the critic triggers approval, SustainEco-AI halts thread execution, serializes the state to disk, and waits for a stakeholder signature. The human can inspect telemetry feeds, add custom override instructions, and click Authorize to dispatch final compilation edges.",
      prompt: `interrupt_reason = "Awaiting authorized corporate human credentials to accept sustainable transition Capex estimates."`
    },
    {
      id: "decision",
      label: "5. Roadmap Synthesis Node",
      role: "Output Generator / Decision compiler",
      stateImpact: "unifying_paradigm, priority_actionable_milestones, final_assessment",
      mcpCalled: "Historical Database Adapter",
      description: "Compiles all authorized parameters, validates the final 3-year yield impact curves against organic soil health, drafts milestone timeframes with detailed budget coefficients, and serializes SustainEco-AI's final diagnostic report into writeable local storage adapters.",
      prompt: `synthesis_prompt = """Generate strict JSON matching SustainEco-AI's EvaluationReport Schema. Ensure Year 1, 2, and 3 yield deltas correspond mathematically to organic topsoil carbon expansion indices."""`
    }
  ];

  const currentNode = nodes.find(n => n.id === selectedNode) || nodes[0];

  // LangGraph Shared State variables representation
  const stateChannels = [
    { key: "farm_location", type: "str", val: farmData.location, desc: "Geographic coordinate and history timestamp anchoring spatial satellites." },
    { key: "crop_profile", type: "str", val: farmData.crop_name, desc: "Selected asset cultivar subject to environmental validation." },
    { key: "soil_pH", type: "float", val: farmData.soil_data.ph, desc: "Active hydrogen ion index in topsoil layers, directly controlling nutrient absorption." },
    { key: "soil_organic_matter", type: "float", val: farmData.soil_data.organic_matter_pct, desc: "Calculated physical organic carbon percentage, providing carbon buffers." },
    { key: "water_access_type", type: "str", val: farmData.water_data.irrigation_type, desc: "Active hydrology distribution method subject to conservation upgrades." },
    { key: "carbon_co2e_footprint", type: "float", val: "~Tons CO2e", desc: "Calculated annual carbon emissions footprint value, mapped dynamically by especialistas." },
    { key: "critic_approval_status", type: "bool", val: simulationStep === "completed" ? "True" : "Awaiting validation", desc: "Hard safety flag set by the Audit Validator to ensure target compliance." },
    { key: "human_override_text", type: "str", val: "Optional thread parameters", desc: "Stakeholder intervention feedback serialized to control conditional loops." }
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col items-stretch">
      {/* Visual Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-emerald-800" />
            <h3 className="font-extrabold text-stone-850 text-sm tracking-tight uppercase">
              LangGraph StateGraph Engine Map
            </h3>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-sans">
            Inspect the active orchestration architecture. LangGraph binds cyclic state loops, specialized nodes, conditional edges, and FastMCP connectors into a robust sustainability pipeline.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-stone-105 p-1 rounded-lg border border-stone-200 shrink-0 self-start text-xs font-mono">
          <button
            onClick={() => setActiveSubTab("dag")}
            className={`px-3 py-1.5 rounded font-extrabold uppercase text-[10px] tracking-wider transition ${
              activeSubTab === "dag" ? "bg-white text-emerald-850 shadow-xs border border-stone-200" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            Graph DAG
          </button>
          <button
            onClick={() => setActiveSubTab("state")}
            className={`px-3 py-1.5 rounded font-extrabold uppercase text-[10px] tracking-wider transition ${
              activeSubTab === "state" ? "bg-white text-emerald-850 shadow-xs border border-stone-200" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            State Channels
          </button>
          <button
            onClick={() => setActiveSubTab("mcp")}
            className={`px-3 py-1.5 rounded font-extrabold uppercase text-[10px] tracking-wider transition ${
              activeSubTab === "mcp" ? "bg-white text-emerald-850 shadow-xs border border-stone-200" : "text-stone-400 hover:text-stone-700"
            }`}
          >
            FastMCP Tools
          </button>
        </div>
      </div>

      <div className="p-6">
        
        {/* TAB 1: INTERACTIVE DAG GRAPH VISUALIZER */}
        {activeSubTab === "dag" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Visual Flow diagram (7 cols) */}
            <div className="lg:col-span-8 bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col justify-between relative min-h-[360px] overflow-hidden select-none">
              
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#047857_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-stone-400 font-extrabold uppercase tracking-widest block">
                  LangGraph Nodes & Directional Edges
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 uppercase">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Active step: {simulationStep.toUpperCase()}
                </span>
              </div>

              {/* StateGraph Map nodes layout */}
              <div className="relative z-10 my-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                
                {/* START node */}
                <div className="w-11 h-11 rounded-full bg-stone-900 text-white flex items-center justify-center font-mono font-bold text-[9px] uppercase tracking-wider text-center shrink-0 border border-stone-850 shadow-sm">
                  START
                </div>

                <ArrowRight className="w-4 h-4 text-stone-300 hidden md:block" />

                {/* Supervisor Node Button */}
                <button
                  type="button"
                  onClick={() => setSelectedNode("supervisor")}
                  className={`p-3 rounded-lg border-2 text-left transition w-full md:w-[130px] flex flex-col ${
                    selectedNode === "supervisor"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-850 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-stone-200 bg-white hover:border-stone-400 text-stone-550"
                  } ${simulationStep === "supervisor" ? "animate-pulse border-emerald-500" : ""}`}
                >
                  <span className="text-[11px] font-black uppercase text-stone-750">1. Policy</span>
                  <span className="text-[9px] text-stone-400 mt-0.5 leading-none">Supervisor node</span>
                </button>

                <ArrowRight className="w-4 h-4 text-stone-300 hidden md:block" />

                {/* Specialists button */}
                <button
                  type="button"
                  onClick={() => setSelectedNode("specialists")}
                  className={`p-3 rounded-lg border-2 text-left transition w-full md:w-[130px] flex flex-col ${
                    selectedNode === "specialists"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-850 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-stone-200 bg-white hover:border-stone-400 text-stone-550"
                  } ${simulationStep === "specialists" ? "animate-pulse border-emerald-300" : ""}`}
                >
                  <span className="text-[11px] font-black uppercase text-stone-750">2. Experts</span>
                  <span className="text-[9px] text-stone-400 mt-0.5 leading-none">Parallel MCP tools</span>
                </button>

                <ArrowRight className="w-4 h-4 text-stone-300 hidden md:block" />

                {/* Critic button */}
                <button
                  type="button"
                  onClick={() => setSelectedNode("critic")}
                  className={`p-3 rounded-lg border-2 text-left transition w-full md:w-[130px] flex flex-col relative ${
                    selectedNode === "critic"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-850 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-stone-200 bg-white hover:border-stone-400 text-stone-550"
                  } ${simulationStep === "critic" ? "animate-pulse border-emerald-300" : ""}`}
                >
                  {/* Conditional Loop badge */}
                  <span className="absolute -top-2 left-2 text-[8px] bg-red-100 text-red-800 font-extrabold px-1 rounded uppercase border border-red-200 tracking-wider">
                    Conditional loop
                  </span>
                  <span className="text-[11px] font-black uppercase text-stone-750 pt-1">3. Auditor</span>
                  <span className="text-[9px] text-stone-400 mt-0.5 leading-none">Safety Review Node</span>
                </button>

                <ArrowRight className="w-4 h-4 text-stone-300 hidden md:block" />

                {/* Human badge button */}
                <button
                  type="button"
                  onClick={() => setSelectedNode("human")}
                  className={`p-3 rounded-lg border-2 text-left transition w-full md:w-[130px] flex flex-col ${
                    selectedNode === "human"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-850 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-stone-200 bg-white hover:border-stone-400 text-stone-550"
                  } ${simulationStep === "human" ? "animate-bounce border-amber-500 ring-2 ring-amber-400/20" : ""}`}
                >
                  <span className="text-[11px] font-black uppercase text-stone-750">4. Human</span>
                  <span className="text-[9px] text-stone-400 mt-0.5 leading-none">Thread pause node</span>
                </button>

                <ArrowRight className="w-4 h-4 text-stone-300 hidden md:block" />

                {/* Decision button */}
                <button
                  type="button"
                  onClick={() => setSelectedNode("decision")}
                  className={`p-3 rounded-lg border-2 text-left transition w-full md:w-[130px] flex flex-col ${
                    selectedNode === "decision"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-850 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-stone-200 bg-white hover:border-stone-400 text-stone-550"
                  } ${simulationStep === "decision" ? "animate-pulse border-emerald-300" : ""}`}
                >
                  <span className="text-[11px] font-black uppercase text-stone-750">5. Synthesis</span>
                  <span className="text-[9px] text-stone-400 mt-0.5 leading-none">JSON report node</span>
                </button>

                <ArrowRight className="w-4 h-4 text-stone-300 hidden md:block" />

                {/* END node */}
                <div className="w-11 h-11 rounded-full bg-emerald-850 text-white flex items-center justify-center font-mono font-bold text-[9px] uppercase tracking-wider text-center shrink-0 border border-emerald-950 shadow-sm">
                  END
                </div>

              </div>

              {/* Node-click instructional guide */}
              <div className="relative z-10 pt-3 border-t border-stone-200 mt-4">
                <p className="text-[10px] text-stone-405 font-mono text-center block">
                  💡 Click on any Node inside SustainEco-AI's DAG structure to inspect its state schemas & prompt config.
                </p>
              </div>

            </div>

            {/* Selected Node Details sidecard (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4 bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-xs">
              <div className="space-y-4">
                <div className="border-b border-stone-200 pb-2.5">
                  <span className="text-[9px] font-mono text-stone-400 font-extrabold uppercase tracking-widest block">
                    Node Metadata inspector
                  </span>
                  <h4 className="text-xs font-black text-emerald-850 mt-1 uppercase tracking-tight leading-relaxed">
                    {currentNode.label}
                  </h4>
                </div>

                <div className="space-y-3.5 text-xs leading-relaxed">
                  <div>
                    <strong className="text-[10px] font-extrabold block text-stone-500 uppercase tracking-wide">Role & Execution:</strong>
                    <span className="text-stone-700 font-semibold">{currentNode.role}</span>
                  </div>

                  <div>
                    <strong className="text-[10px] font-extrabold block text-stone-500 uppercase tracking-wide">Input/Output State Keys:</strong>
                    <code className="text-[10px] bg-stone-200 border border-stone-250 text-stone-700 px-1.5 py-0.5 rounded font-mono block mt-1 overflow-x-auto truncate">
                      {currentNode.stateImpact}
                    </code>
                  </div>

                  <div>
                    <strong className="text-[10px] font-extrabold block text-stone-500 uppercase tracking-wide">Connected MCP Servers:</strong>
                    <span className="text-[11px] font-semibold text-emerald-800 font-mono block mt-0.5">{currentNode.mcpCalled}</span>
                  </div>

                  <div>
                    <strong className="text-[10px] font-extrabold block text-stone-400 uppercase tracking-wide">Action Description:</strong>
                    <p className="text-stone-550 text-[11px] leading-relaxed mt-1 font-sans">
                      {currentNode.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Underlying Code Prompt block */}
              <div className="bg-stone-900 border border-stone-850 p-3 rounded-lg font-mono text-[9px] text-stone-300 leading-normal overflow-x-auto">
                <span className="text-stone-500 block mb-1 text-[8px] tracking-wide select-none font-sans uppercase">UNDERLYING PYTHON SCHEMA PROMPT:</span>
                <pre className="whitespace-pre-wrap">{currentNode.prompt}</pre>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: SHARED STATE CHANNELS INSPECTOR */}
        {activeSubTab === "state" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-150 pb-2">
              <span className="text-[10px] font-mono text-stone-400 font-extrabold uppercase tracking-widest block">
                LangGraph State Schema channels (In-Memory Thread)
              </span>
              <span className="text-[9px] text-stone-400 font-mono">
                Typed annotation: StateGraph(StateDictSchema)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stateChannels.map((chan, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-2 flex flex-col justify-between h-[135px]">
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-stone-150 pb-1.5">
                      <span className="text-xs font-black text-stone-800 font-mono truncate">{chan.key}</span>
                      <code className="text-[9px] px-1.5 bg-stone-200 text-stone-550 rounded font-mono">{chan.type}</code>
                    </div>
                    <p className="text-[10.5px] text-stone-500 leading-normal mt-2 font-sans line-clamp-3">
                      {chan.desc}
                    </p>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-stone-200 rounded px-2.5 py-1 text-[10.5px]">
                    <span className="font-mono text-stone-400 select-none">Value:</span>
                    <span className="font-bold text-emerald-900 font-mono truncate max-w-[120px]">{chan.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FAST_MCP SERVERS SCHEMATICS */}
        {activeSubTab === "mcp" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* List and tools (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[10px] font-mono text-stone-400 font-extrabold uppercase tracking-widest block border-b border-stone-150 pb-2">
                Active Local Python FastMCP Server Tool Declarations
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Soil server */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-stone-150 pb-2">
                    <Server className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h4 className="text-xs font-black text-stone-800 uppercase leading-none">Soil Server</h4>
                      <code className="text-[8.5px] text-stone-400 font-mono block mt-0.5">mcp_server_soil.py</code>
                    </div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10.5px]">
                    <div className="text-emerald-800 font-bold">🛠️ analyze_soil(ph, organic_matter)</div>
                    <p className="text-stone-500 text-[10px] leading-relaxed font-sans font-normal">
                      Calculates localized soil scores, soil health indices, and outputs recommended topsoil cover mix ratios directly based on active carbon organic levels.
                    </p>
                  </div>
                </div>

                {/* Weather server */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-stone-150 pb-2">
                    <Server className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h4 className="text-xs font-black text-stone-800 uppercase leading-none">Weather Server</h4>
                      <code className="text-[8.5px] text-stone-400 font-mono block mt-0.5">mcp_server_nasa_climatology.py</code>
                    </div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10.5px]">
                    <div className="text-emerald-800 font-bold">🛠️ get_weather(lat, lon)</div>
                    <div className="text-emerald-800 font-bold">🛠️ get_rainfall_history(location)</div>
                    <p className="text-stone-500 text-[10px] leading-relaxed font-sans font-normal">
                      Connects directly to historical regional climate archives to query annual precipitation profiles and drought extreme occurrences.
                    </p>
                  </div>
                </div>

                {/* Carbon server */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-stone-150 pb-2">
                    <Server className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h4 className="text-xs font-black text-stone-800 uppercase leading-none">Carbon Server</h4>
                      <code className="text-[8.5px] text-stone-400 font-mono block mt-0.5">mcp_carbon_audit.py</code>
                    </div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10.5px]">
                    <div className="text-emerald-800 font-bold">🛠️ calculate_carbon_footprint(fuels, acreage)</div>
                    <p className="text-stone-500 text-[10px] leading-relaxed font-sans font-normal">
                      Audits farm operations diesel fuel consumption, tillage metrics, and synthetic nitrogen inputs to compute carbon mitigation tons.
                    </p>
                  </div>
                </div>

                {/* Biodiversity server */}
                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-stone-150 pb-2">
                    <Server className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h4 className="text-xs font-black text-stone-800 uppercase leading-none">Biodiversity Server</h4>
                      <code className="text-[8.5px] text-stone-400 font-mono block mt-0.5">mcp_flora_fauna_server.py</code>
                    </div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10.5px]">
                    <div className="text-emerald-800 font-bold">🛠️ estimate_species_recovery_index()</div>
                    <p className="text-stone-500 text-[10px] leading-relaxed font-sans font-normal">
                      Maps wildlife buffers and native flora percentages to establish biological pollination confidence quotients.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick architectural diagram sidecard (4 cols) */}
            <div className="lg:col-span-4 bg-stone-900 border border-stone-850 rounded-xl p-5 shadow text-xs space-y-4">
              <div className="border-b border-stone-800 pb-3 flex items-center gap-2 text-emerald-400">
                <Settings className="w-4 h-4" />
                <h4 className="font-extrabold uppercase font-sans tracking-wide">Telemetry Router Architecture</h4>
              </div>

              <div className="space-y-3.5 text-stone-300">
                <p className="leading-relaxed text-[11px] font-sans font-normal">
                  SustainEco-AI's agents communicate with environmental databases through secure, lightweight schema routers:
                </p>

                <div className="space-y-3.5 pl-2 font-mono text-[10px]">
                  <div className="flex gap-2">
                    <span className="text-emerald-400">1.</span>
                    <p className="leading-relaxed">
                      Agent detects missing soil carbon offsets data from active graph State.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400">2.</span>
                    <p className="leading-relaxed">
                      Issues JSON-RPC trigger package over stdin/stdout tunnel to mounted MCP Server paths.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400">3.</span>
                    <p className="leading-relaxed">
                      MCP server triggers tool code, scrapes scientific datasets natively, and returns verified values.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400">4.</span>
                    <p className="leading-relaxed">
                      Agent parses output, commits values to graph state registers, and transitions execution tokens to next edge.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
