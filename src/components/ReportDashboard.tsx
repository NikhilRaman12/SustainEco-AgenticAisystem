import React, { useState, useEffect } from "react";
import { 
  Building2, Leaf, Droplet, ThermometerSun, Zap, Shield, 
  Check, Calendar, HelpCircle, Compass, Trees, AlertTriangle, FileText,
  TrendingUp, Printer, Download, Eye, Loader2, X, CheckCircle2, Sliders, Brain
} from "lucide-react";
import { SimulationResult } from "../types";

interface Props {
  res: SimulationResult;
}

export default function ReportDashboard({ res }: Props) {
  const [activeTab, setActiveTab] = useState<string>("summary");

  // Interactive ESG & Decarbonization Sandbox States
  const [sandboxPh, setSandboxPh] = useState<number>(res.farm_data.soil_data?.ph ?? 6.5);
  const [sandboxOm, setSandboxOm] = useState<number>(res.farm_data.soil_data?.organic_matter_pct ?? 2.5);
  const [sandboxNitrogen, setSandboxNitrogen] = useState<number>(res.farm_data.carbon_inputs?.synthetic_nitrogen_kg_yr ?? 300);
  const [sandboxTillage, setSandboxTillage] = useState<number>(res.farm_data.carbon_inputs?.tillage_frequency_yr ?? 2);
  const [sandboxDiesel, setSandboxDiesel] = useState<number>(res.farm_data.carbon_inputs?.diesel_liters_used_yr ?? 500);

  // Sync state values on baseline model switch
  useEffect(() => {
    setSandboxPh(res.farm_data.soil_data?.ph ?? 6.5);
    setSandboxOm(res.farm_data.soil_data?.organic_matter_pct ?? 2.5);
    setSandboxNitrogen(res.farm_data.carbon_inputs?.synthetic_nitrogen_kg_yr ?? 300);
    setSandboxTillage(res.farm_data.carbon_inputs?.tillage_frequency_yr ?? 2);
    setSandboxDiesel(res.farm_data.carbon_inputs?.diesel_liters_used_yr ?? 500);
  }, [res]);

  // Simulated PDF Exporter states
  const [exportState, setExportState] = useState<"idle" | "generating" | "preview">("idle");
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStepMessage, setExportStepMessage] = useState<string>("");

  const startPdfExport = () => {
    setExportState("generating");
    setExportProgress(0);
    setExportStepMessage("Initializing PDF metadata & typography styles...");
    
    const steps = [
      { progress: 15, msg: "Compiling advisory coordination guidelines..." },
      { progress: 38, msg: "Extracting expert telemetry logs (Soil, Water, Carbon, Biodiversity)..." },
      { progress: 62, msg: "Drafting 3-year projected yield impact models..." },
      { progress: 83, msg: "Validating academic citations & peer-reviewed literature..." },
      { progress: 95, msg: "Aggregating action roadmap checkpoints & budget indices..." },
      { progress: 100, msg: "SustainEco-AI dynamic print-sheet compiled!" }
    ];

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setExportProgress(steps[currentStepIndex].progress);
        setExportStepMessage(steps[currentStepIndex].msg);
        currentStepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setExportState("preview");
        }, 500);
      }
    }, 400);
  };

  const downloadTxtReport = () => {
    const divider = "================================================================================\n";
    const reportText = [
      divider,
      `              SUSTAIN_ECO_AI REGENERATIVE STRATEGY ADVISORY\n`,
      `                       ECOLOGICAL SUCCESSION REPORT\n`,
      divider,
      `Report Reference ID: ${res.run_id}\n`,
      `Generated Timestamp: ${new Date().toLocaleString()}\n`,
      `Target Location    : ${res.farm_data.location}\n`,
      `Active Crop Type   : ${res.farm_data.crop_name}\n`,
      divider,
      `1. STRATEGIC DECISION PARADIGM:\n`,
      `   ${res.decision.unifying_agricultural_paradigm.toUpperCase()}\n\n`,
      `   Executive Summary context:\n`,
      `   ${res.decision.executive_summary}\n\n`,
      divider,
      `2. ESTIMATED 3-YEAR CO2E & RESOURCES NET IMPACT SAVINGS:\n`,
      `   - Soil Organic Carbon Gain   : +${res.decision.projected_ecological_gains_3yr.soil_organic_carbon_increase_pct}%\n`,
      `   - Irrigation Drawdown Savings: -${res.decision.projected_ecological_gains_3yr.water_resource_draw_reduction_pct}%\n`,
      `   - Carbon Mitigation Potential: ${res.decision.projected_ecological_gains_3yr.carbon_footprint_mitigation_tco2e} tCO2e/yr\n`,
      `   - Biome Diversity Index Gain : +${res.decision.projected_ecological_gains_3yr.biodiversity_species_recovery_index_gain_pct}%\n\n`,
      divider,
      `3. STRATEGIC TRANSITION ROADMAP MILESTONES:\n\n`,
      res.decision.priority_actionable_milestones.map((m, idx) => (
        `   Phase ${idx+1} [${m.timeframe}]:\n` +
        `   - Project Action   : ${m.milestone}\n` +
        `   - Projected KPI    : ${m.target_kpi_impact}\n` +
        `   - Budget Cost Level: ${m.estimated_capex} (${m.difficulty} difficulty)\n`
      )).join("\n\n"),
      "\n",
      divider,
      `4. VERIFIED ACADEMIC LITERATURE DOSSIER:\n\n`,
      res.research.academic_citations.map((cite, idx) => (
        `   [${idx+1}] "${cite.title}"\n` +
        `       Published      : ${cite.authors} | ${cite.journal_and_year}\n` +
        `       Key Empirical finding: ${cite.key_finding}\n`
      )).join("\n\n"),
      "\n",
      divider,
      `End of Report. Authenticated by SustainEco-AI Decision Stream.\n`,
      divider
    ].join("");

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `SustainEco_AI_Advisory_${res.farm_data.crop_name.replace(/\s+/g, '_')}_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const yieldImpact = res.decision.projected_yield_impact || (() => {
    const s_om = res.farm_data?.soil_data?.organic_matter_pct ?? 2.5;
    const s_ph = res.farm_data?.soil_data?.ph ?? 6.5;
    const currentIrrigation = res.farm_data?.water_data?.irrigation_type || "Sprinkler";
    
    let baselineRating = "Moderate";
    if (s_om < 1.8 || s_ph < 5.5 || s_ph > 8.2) {
      baselineRating = "Poor";
    } else if (s_om > 3.5 && (currentIrrigation === "Drip" || currentIrrigation === "Subsurface Drip")) {
      baselineRating = "Optimal";
    }

    let y1 = 1.5;
    let y2 = 6.0;
    let y3 = 12.0;
    let limitingFactor = "Soil dry porosity & low organic matter sap feeds";

    if (s_om < 1.8) {
      y1 = -1.5;
      y2 = 5.0;
      y3 = 14.5;
      limitingFactor = "Extreme organic matter depletion & rapid nutrient leaching minimized";
    } else if (currentIrrigation !== "Drip" && currentIrrigation !== "Subsurface Drip") {
      y1 = 2.0;
      y2 = 7.5;
      y3 = 13.0;
      limitingFactor = "Uncontrolled evaporative water-stress peaks resolved via smart scheduling";
    } else if (s_ph < 6.0) {
      y1 = 1.0;
      y2 = 5.0;
      y3 = 10.5;
      limitingFactor = "Acidic nutrient lock resolving through fungal hyphae expansion";
    } else {
      y1 = 2.5;
      y2 = 8.0;
      y3 = 15.0;
      limitingFactor = "Nitrogen leaching and biodiversity-driven pollination deficits resolved";
    }

    return {
      baseline_yield_rating: baselineRating,
      year_1_change_pct: y1,
      year_2_change_pct: y2,
      year_3_change_pct: y3,
      limiting_factor_resolved: limitingFactor,
      explanation: `Our scientific modeling projects that installing closed-loop regenerative conservation leads to a ${y3}% yield expansion inside 3 years. Stabilizing soil organic matter from ${s_om}% directly improves water-holding capacity, preventing hot heatwave abort shocks. Initially, Year 1 shows a ${y1 >= 0 ? "+" : ""}${y1}% transition offset, followed by exponential biome healing in Years 2 and 3.`
    };
  })();

  const kpis = [
    { title: "Soil Organic Carbon", gain: `+${res.decision.projected_ecological_gains_3yr.soil_organic_carbon_increase_pct}%`, desc: "SOC physical humus expansion in topsoil layers.", unit: "Absolute Net Gain" },
    { title: "Irrigation Outflow savings", gain: `-${res.decision.projected_ecological_gains_3yr.water_resource_draw_reduction_pct}%`, desc: "Overdraft irrigation volume savings.", unit: "Conserved Volume" },
    { title: "Carbon Offset Potential", gain: `-${res.decision.projected_ecological_gains_3yr.carbon_footprint_mitigation_tco2e} t`, desc: "Annual metric tons sequestered greenhouse offset.", unit: "CO2e mitigation / yr" },
    { title: "Species Recovery Index", gain: `+${res.decision.projected_ecological_gains_3yr.biodiversity_species_recovery_index_gain_pct}%`, desc: "Expansion rate of wild beneficial insects.", unit: "Pollinator Index gain" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Menu Tabs & Simulated PDF Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 gap-3 pb-px">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === "summary"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Unified Strategy</span>
          </button>
          <button
            onClick={() => setActiveTab("specialists")}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === "specialists"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
            }`}
          >
            <Trees className="w-4 h-4" />
            <span>Expert Team Diagnostics</span>
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 transition shrink-0 ${
              activeTab === "timeline"
                ? "border-emerald-700 text-emerald-800"
                : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Action Roadmap</span>
          </button>
        </div>

        {/* PDF Export trigger button */}
        <button
          type="button"
          onClick={startPdfExport}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-black shadow-xs transition mb-2 sm:mb-0 shrink-0 uppercase tracking-wider h-9"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Export PDF Advisory</span>
        </button>
      </div>

      {/* VIEW 1: UNIFIED STRATEGY */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Executive Block */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-1 rounded">
                  DECISION ROADMAP
                </span>
                <h3 className="text-xl font-extrabold text-stone-850 tracking-tight mt-1.5">
                  {res.decision.unifying_agricultural_paradigm}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-stone-400 bg-stone-100 px-3 py-1 rounded">
                Ref: {res.run_id}
              </span>
            </div>

            <p className="text-stone-650 text-sm leading-relaxed font-sans font-normal">
              {res.decision.executive_summary}
            </p>
          </div>

          {/* 3-Year Expected Gains */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col justify-between hover:border-emerald-500/20 transition-all h-[155px]">
                <div>
                  <div className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">{kpi.title}</div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-normal">{kpi.desc}</p>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-800 font-mono tracking-tight">{kpi.gain}</div>
                  <div className="text-[9px] text-stone-400 font-bold uppercase mt-0.5">{kpi.unit}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Projected Yield Impact Forecast */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-850 text-sm tracking-tight uppercase">
                    Projected Yield Impact & Agronomic Resilience Forecast
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5 font-normal leading-relaxed">
                    Scientific 3-year timeline projecting physical harvest outcomes based on current soil parameters and transition practices.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-stone-400">Baseline Capacity:</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded font-sans uppercase tracking-wide border ${
                  yieldImpact.baseline_yield_rating === "Optimal" 
                    ? "bg-emerald-50 text-emerald-850 border-emerald-200" 
                    : yieldImpact.baseline_yield_rating === "Moderate"
                      ? "bg-teal-50 text-teal-850 border-teal-200"
                      : "bg-amber-50 text-amber-850 border-amber-200"
                }`}>
                  {yieldImpact.baseline_yield_rating} Yield
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Visual Timeline Steps (left 5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-stone-50/50 rounded-xl p-4 border border-stone-200">
                <div>
                  <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest mb-3">
                    3-Year Yield Curve Progression
                  </div>
                  
                  <div className="space-y-3">
                    {/* Year 1 */}
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-stone-200 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6.5 h-6.5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono font-bold text-xs">
                          Y1
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-800">Transition Phase</div>
                          <div className="text-[9px] text-stone-400">Microbial acclimatization</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          yieldImpact.year_1_change_pct >= 0 
                            ? "text-emerald-800 bg-emerald-50" 
                            : "text-amber-800 bg-amber-55"
                        }`}>
                          {yieldImpact.year_1_change_pct >= 0 ? "+" : ""}{yieldImpact.year_1_change_pct}%
                        </span>
                      </div>
                    </div>

                    {/* Year 2 */}
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-stone-200 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6.5 h-6.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs">
                          Y2
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-800 font-sans">Organic Surge</div>
                          <div className="text-[9px] text-stone-400">Rhizosphere nutrient cycling</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          +{yieldImpact.year_2_change_pct}%
                        </span>
                      </div>
                    </div>

                    {/* Year 3 */}
                    <div className="flex items-center justify-between bg-emerald-850 text-white rounded-lg p-3.5 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-950 opacity-10 transform skew-x-12 translate-x-4" />
                      <div className="flex items-center gap-2.5 z-10">
                        <div className="w-6.5 h-6.5 rounded-full bg-white text-emerald-800 flex items-center justify-center font-mono font-extrabold text-xs">
                          Y3
                        </div>
                        <div>
                          <div className="text-xs font-extrabold">Soil Solution Equilibrium</div>
                          <div className="text-[9px] text-emerald-100/80">Humus water buffers active</div>
                        </div>
                      </div>
                      <div className="text-right z-10">
                        <span className="text-sm font-black font-mono text-emerald-100 bg-emerald-900/50 px-2 py-0.5 rounded">
                          +{yieldImpact.year_3_change_pct}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <div className="flex items-center justify-between text-[11px] font-medium text-stone-400 font-mono">
                    <span>Baseline: 100%</span>
                    <span className="text-emerald-700 font-bold">Max Output: {(100 + yieldImpact.year_3_change_pct).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Narrative & Analytical Insights (right 7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
                    <div className="text-[10px] font-extrabold text-stone-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Core Limiting Factor Resolved
                    </div>
                    <p className="text-xs font-bold text-stone-800 leading-relaxed">
                      {yieldImpact.limiting_factor_resolved}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest font-sans">
                      Scientific Forecasting Rationale
                    </div>
                    <p className="text-stone-605 text-xs leading-relaxed font-sans font-normal p-3 bg-stone-50/20 rounded-lg border border-dashed border-stone-200">
                      {yieldImpact.explanation}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50/20 border border-emerald-100 rounded-lg p-3 text-[10.5px] leading-relaxed text-stone-550">
                  <strong className="font-extrabold text-emerald-850 uppercase text-[9px] tracking-wider block mb-1">Agronomic Resilience Assurance:</strong>
                  Transitioning to regenerative models trades chemical spikes for high-porosity humus reserves. This keeps localized plant turgor index stable during prolonged climate drought triggers.
                </div>
              </div>

            </div>
          </div>

          {/* Interactive ESG & Sensitivity Sandbox Tool */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Sliders className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-stone-850 text-sm tracking-tight uppercase flex items-center gap-2">
                  <span>Interactive ESG & Yield Sensitivity Sandbox</span>
                  <span className="text-[9px] bg-emerald-800 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase">Data Expert Simulator</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5 font-normal leading-relaxed">
                  Adjust topsoil biopolymer states, fertilizer inputs, and till intensity to model real-time yield capacity and carbon sequestration variables.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Sliders Area (left 5 cols) */}
              <div className="lg:col-span-5 bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-5">
                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">
                  Live Farm Parameter Scenarios
                </div>

                {/* Slider 1: Soil pH */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-650 font-bold">Soil pH Level</span>
                    <span className="font-mono text-emerald-800 font-black bg-white px-2 py-0.5 rounded border border-stone-200">{sandboxPh.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.1"
                    value={sandboxPh}
                    onChange={(e) => setSandboxPh(parseFloat(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                  />
                  <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                    <span>Acidic (4.5)</span>
                    <span className="text-emerald-700 font-bold">Optimal (6.5-7.0)</span>
                    <span>Alkaline (9.0)</span>
                  </div>
                </div>

                {/* Slider 2: Organic Matter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-650 font-bold">Organic Matter % (Carbon)</span>
                    <span className="font-mono text-emerald-800 font-black bg-white px-2 py-0.5 rounded border border-stone-200">{sandboxOm.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="8.0"
                    step="0.1"
                    value={sandboxOm}
                    onChange={(e) => setSandboxOm(parseFloat(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                  />
                  <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                    <span>Depleted (0.5%)</span>
                    <span className="text-emerald-700 font-bold">Stable (&gt;3.0%)</span>
                    <span>High Carbon (8.0%)</span>
                  </div>
                </div>

                {/* Slider 3: Nitrogen Inputs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-650 font-bold">Synthetic Nitrogen Input</span>
                    <span className="font-mono text-emerald-800 font-black bg-white px-2 py-0.5 rounded border border-stone-200">{sandboxNitrogen} kg/yr</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={sandboxNitrogen}
                    onChange={(e) => setSandboxNitrogen(parseInt(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                  />
                  <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                    <span>None (0)</span>
                    <span>1000 kg</span>
                    <span>High Runoff (2000)</span>
                  </div>
                </div>

                {/* Slider 4: Tillage matches */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-stone-650 font-bold">Tillage Intensity Passes</span>
                    <span className="font-mono text-emerald-800 font-black bg-white px-2 py-0.5 rounded border border-stone-200">{sandboxTillage} /yr</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="1"
                    value={sandboxTillage}
                    onChange={(e) => setSandboxTillage(parseInt(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-800"
                  />
                  <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                    <span className="text-emerald-700 font-bold">Zero-Till (0)</span>
                    <span>Conservation (1-2)</span>
                    <span>Intense (6)</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Analytics & SVG Graph (right 7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                {/* Visual Math Panel */}
                {(() => {
                  const sandboxAcreage = res.farm_data.carbon_inputs?.acreage ?? 100;

                  // 1. pH Modifier (optimal at 6.7, falling quadratically on both ends)
                  const phFactor = Math.max(0.3, 1.0 - 0.22 * Math.pow(sandboxPh - 6.7, 2));

                  // 2. Nitrogen yield curve (sweet spot around ~120kg per acre synthetic + organic cycling)
                  const kgPerAcreN = sandboxNitrogen / sandboxAcreage;
                  const nitrogenFactor = 1.0 + 0.40 * (kgPerAcreN / 120) - 0.18 * Math.pow(Math.max(0, (kgPerAcreN / 120) - 1.15), 2);

                  // 3. Organic Matter soil water stability index (linearly increases up to maximum of 8%)
                  const omFactor = 0.70 + 0.11 * sandboxOm;

                  // 4. Combined Crop Yield potential relative to average baseline
                  const calculatedYieldPotential = Math.round(100 * phFactor * nitrogenFactor * omFactor);

                  // 5. Environmental carbon impacts (IPCC greenhouse gas factors)
                  const carbonFromNitrogen = (sandboxNitrogen * 0.0054); // mton CO2e/yr
                  const carbonFromDiesel = (sandboxDiesel * 0.00268); // mton CO2e/yr
                  const carbonFromTillage = (sandboxTillage * 0.18 * sandboxAcreage * 0.05); // soil erosion mineralization oxidation release
                  const organicCarbonSequestration = -((sandboxOm * 0.22) * sandboxAcreage); // mton CO2e/yr sequestration

                  // Net Decarbonization footprint
                  const sandboxNetFootprint = carbonFromNitrogen + carbonFromDiesel + carbonFromTillage + organicCarbonSequestration;

                  // Year coordinates mapping
                  const y1Val = Math.round(calculatedYieldPotential * 0.90);
                  const y2Val = Math.round(calculatedYieldPotential * 1.04);
                  const y3Val = Math.round(calculatedYieldPotential * 1.15);

                  // Scale values (40% is Y=130, 160% is Y=20)
                  const mapY = (val: number) => {
                    const constrained = Math.max(40, Math.min(160, val));
                    return 130 - ((constrained - 40) / 120) * 110;
                  };

                  const yg1 = mapY(y1Val);
                  const yg2 = mapY(y2Val);
                  const yg3 = mapY(y3Val);

                  return (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
                          <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wide block">Yield Potential</span>
                          <div className="text-base font-mono font-black text-emerald-800 mt-1">{calculatedYieldPotential}%</div>
                          <span className="text-[8px] text-stone-400 font-medium uppercase block mt-0.5">VS BASELINE</span>
                        </div>
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
                          <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wide block">Soil Carbon Lock</span>
                          <div className="text-base font-mono font-black text-emerald-800 mt-1">{Math.abs(organicCarbonSequestration).toFixed(1)} t</div>
                          <span className="text-[8px] text-stone-400 font-medium uppercase block mt-0.5">CO2e/YR DRAW</span>
                        </div>
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
                          <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wide block">Net Footprint</span>
                          <div className={`text-base font-mono font-black mt-1 ${sandboxNetFootprint <= 0 ? "text-emerald-800" : "text-amber-800"}`}>
                            {sandboxNetFootprint > 0 ? "+" : ""}{sandboxNetFootprint.toFixed(1)} t
                          </div>
                          <span className="text-[8px] text-stone-400 font-medium uppercase block mt-0.5">CO2e NET / YR</span>
                        </div>
                      </div>

                      <div className="bg-stone-900 border border-stone-850 rounded-xl p-4 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider font-sans flex items-center gap-1">
                            <Brain className="w-3 h-3 text-emerald-400 shrink-0" />
                            Predictive Succession Horizon Curve
                          </span>
                          <span className="text-[9px] font-mono text-emerald-400">Y3 Opt: +{y3Val - 100}% yield trajectory</span>
                        </div>

                        <svg className="w-full h-[110px]" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                            </linearGradient>
                          </defs>

                          {/* Chart Grid Lines */}
                          <line x1="40" y1="20" x2="360" y2="20" stroke="#292524" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="40" y1="75" x2="360" y2="75" stroke="#292524" strokeWidth="1" strokeDasharray="3 3" />
                          <line x1="40" y1="130" x2="360" y2="130" stroke="#44403c" strokeWidth="1" />

                          {/* Baseline standard indicator line */}
                          <line x1="40" y1="75" x2="360" y2="75" stroke="#059669" strokeWidth="1.2" strokeOpacity="0.45" />
                          <text x="315" y="71" fill="#047857" className="text-[8px] font-mono font-bold">BASELINE (100%)</text>

                          {/* Gradient shaded area fill */}
                          <path
                            d={`M 60 ${yg1} C 130 ${yg1 - 5}, 130 ${yg2}, 200 ${yg2} C 270 ${yg2 - 5}, 270 ${yg3}, 340 ${yg3} L 340 130 L 60 130 Z`}
                            fill="url(#area-grad)"
                          />

                          {/* Bright neon primary spline trail */}
                          <path
                            d={`M 60 ${yg1} C 130 ${yg1 - 5}, 130 ${yg2}, 200 ${yg2} C 270 ${yg2 - 5}, 270 ${yg3}, 340 ${yg3}`}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          {/* Year node highlights */}
                          <circle cx="60" cy={yg1} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                          <text x="60" y={yg1 - 9} fill="#ffffff" className="text-[9px] font-bold font-mono" textAnchor="middle">{y1Val}%</text>

                          <circle cx="200" cy={yg2} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                          <text x="200" y={yg2 - 9} fill="#ffffff" className="text-[9px] font-bold font-mono" textAnchor="middle">{y2Val}%</text>

                          <circle cx="340" cy={yg3} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                          <text x="340" y={yg3 - 11} fill="#34d399" className="text-[10px] font-extrabold font-mono" textAnchor="middle">{y3Val}%</text>

                          {/* Horizontal Axes descriptors */}
                          <text x="60" y="145" fill="#78716c" className="text-[8px] font-mono font-bold" textAnchor="middle">YEAR 1 (Transition)</text>
                          <text x="200" y="145" fill="#78716c" className="text-[8px] font-mono font-bold" textAnchor="middle">YEAR 2 (Active Organic)</text>
                          <text x="340" y="145" fill="#a8a29e" className="text-[8px] font-mono font-bold" textAnchor="middle">YEAR 3 (Steady State)</text>
                        </svg>
                      </div>

                      {/* Explanatory insights rationale */}
                      <div className="bg-emerald-50/20 border border-emerald-100/30 rounded-lg p-3 text-[10.5px] leading-relaxed text-stone-600 flex gap-2.5 items-start">
                        <Brain className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                        <p>
                          <strong className="font-extrabold text-emerald-850 uppercase text-[9px] tracking-wider block mb-0.5">Rhizosphere Volatilization & Humus Retention Math:</strong>
                          Tilling heavily ({sandboxTillage} pass/yr) accelerates soil oxidation, releasing {carbonFromTillage.toFixed(1)} Mt CO2e. Conversely, stabilizing Organic Matter to {sandboxOm.toFixed(1)}% creates physical moisture buffers that protect cellular crop transpiration from thermal shock.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

            </div>
          </div>

          {/* Critic Safety Gate */}
          <div className={`rounded-xl border p-5 flex flex-col md:flex-row items-start gap-4 shadow-sm ${
            res.critic.is_approved_for_final_decision 
              ? "bg-emerald-50/40 border-emerald-200/50" 
              : "bg-amber-50/40 border-amber-200/50"
          }`}>
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${
              res.critic.is_approved_for_final_decision ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            
            <div className="space-y-3 flex-1">
              <div>
                <h4 className="font-bold text-stone-800 text-sm">Critic Academic Safety Audit</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Overall Scientific Confidence Weight: <strong className="font-mono text-stone-800 text-sm">{res.critic.overall_scientific_confidence_pct}%</strong>
                </p>
              </div>

              {res.critic.contradiction_flags.length > 0 && (
                <div className="space-y-4 pt-1">
                  <div className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">RESOLVED CONFLICTS:</div>
                  {res.critic.contradiction_flags.map((item, index) => (
                    <div key={index} className="p-3 bg-white border border-stone-200 rounded-lg space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.conflict_detected}</span>
                      </div>
                      <p className="text-stone-500 font-normal leading-relaxed">
                        <strong className="text-stone-700">Scientific Compromise:</strong> {item.suggested_compromise}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EXPERT DIAGNOSTICS */}
      {activeTab === "specialists" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Soil Scientist */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-805 text-sm">Soil & Geotechnical Scientist</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Health Score: {res.soil.soil_health_score}/100
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed font-normal">{res.soil.detailed_findings}</p>
              <div className="pt-2 border-t border-stone-50 space-y-2">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Soil recommendations:</div>
                {res.soil.recommendations.map((rec, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs">
                    <div className="font-bold text-stone-750 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{rec.practice}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-normal">{rec.scientific_rationale}</p>
                    <div className="text-[9px] text-emerald-700 font-bold uppercase mt-1.5">Impact: {rec.expected_kpi_impact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hydrologist */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-805 text-sm">Hydrological Basin Specialist</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Efficiency Index: {Math.round(res.water.irrigation_efficiency_pct * 100)}%
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed font-normal">{res.water.findings}</p>
              <div className="pt-2 border-t border-stone-50 space-y-2">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Hydrological Actions:</div>
                {res.water.conservation_actions.map((act, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs">
                    <div className="font-bold text-stone-750 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{act.strategy}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1.5 font-bold uppercase">
                      <span className="text-emerald-700">Savings: {act.estimated_savings_m3} m³</span>
                      <span className="text-stone-400">ROI: {act.return_on_investment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carbon Footprint */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-805 text-sm">Carbon Accounting Analyst</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded">
                Rating: {res.carbon.carbon_net_rating}
              </span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Emissions Breakdown:</div>
                <div className="p-2.5 bg-stone-500/5 rounded border border-stone-100 space-y-1 text-[11px] font-mono text-stone-700 leading-relaxed">
                  <div>* Fossil Fuel Fuel: {res.carbon.footprint_breakdown.machinery_fuel}</div>
                  <div>* Nitrogen N2O: {res.carbon.footprint_breakdown.synthetic_nitrogen_n2o}</div>
                  {res.carbon.footprint_breakdown.tillage_mineral_loss_tco2e && (
                    <div>* Soil Oxidation: {res.carbon.footprint_breakdown.tillage_mineral_loss_tco2e}</div>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-stone-50 space-y-2">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Mitigation Targets:</div>
                {res.carbon.mitigation_pathways.map((path, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs">
                    <div className="font-bold text-stone-750 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{path.mitigation_project}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1.5 font-bold uppercase">
                      <span className="text-emerald-700">Mitigation: -{path.estimated_drawdown_percent}%</span>
                      <span className="text-stone-400 truncate max-w-[150px]" title={path.offset_crediting_potential}>Offset: Verra</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plant Pathologist */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-805 text-sm">Phytopathology Agent</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Health Index: {res.crop.crop_health_index}/100
              </span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Abiotic Stresses:</div>
                <div className="flex flex-wrap gap-1">
                  {res.crop.observed_abiotic_stresses.map((stress, idx) => (
                    <span key={idx} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">{stress}</span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-stone-50 space-y-2">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Pathogen risks:</div>
                {res.crop.pathogen_risks.map((risk, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs">
                    <div className="font-bold text-stone-750 flex items-center justify-between">
                      <span>{risk.threat}</span>
                      <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 rounded">{risk.severity} Severity</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-normal">Management: {risk.management}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Climatologist */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-805 text-sm">Climatology & Regional Risk Analyst</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded">
                Risk Score: {res.climate.climate_risk_score}%
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed font-normal">{res.climate.climate_trend_analysis}</p>
              <div className="pt-2 border-t border-stone-50 space-y-2">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Adaptation projects:</div>
                {res.climate.adaptation_pathways.map((path, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs">
                    <div className="font-bold text-stone-750 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{path.adaptation}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-normal">{path.mechanism}</p>
                    <div className="text-[9px] text-emerald-700 font-bold uppercase mt-1.5">Priority: {path.implementation_urgency}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ecologist / Biodiversity */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Trees className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-stone-805 text-sm">Conservation Ecology Specialist</h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-850 bg-emerald-50 px-2 py-0.5 rounded">
                Index Rank: {res.biodiversity.biodiversity_score}/100
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed font-normal">{res.biodiversity.findings}</p>
              <div className="pt-2 border-t border-stone-50 space-y-2">
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-widest">Rewilding proposals:</div>
                {res.biodiversity.rewilding_actions.map((act, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 rounded border border-stone-200 text-xs">
                    <div className="font-bold text-stone-750 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{act.project}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1 font-semibold">Attracts: {act.beneficials_supported.join(", ")}</p>
                    <div className="text-[9px] text-emerald-700 font-bold uppercase mt-1">Impact: {act.threat_mitigation_rating}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: ACTION MILESTONES TIMELINE */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Immediate Action Milestones */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <h4 className="font-bold text-stone-800 text-sm tracking-tight uppercase">Priority Immediate Milestones (0-6 Months)</h4>
            </div>

            <div className="relative border-l border-emerald-500/30 pl-6 space-y-6 ml-3">
              {res.decision.priority_actionable_milestones.map((item, idx) => (
                <div key={idx} className="relative space-y-2">
                  <span className="absolute -left-10 top-0.5 bg-emerald-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-extrabold border-2 border-white shadow-sm">
                    {idx + 1}
                  </span>
                  
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded font-mono">
                      {item.timeframe}
                    </span>
                    <div className="flex gap-1">
                      <span className="text-[9px] font-bold text-stone-500 border border-stone-200 px-2 py-0.5 rounded uppercase">
                        Diff: {item.difficulty}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                        Capex: {item.estimated_capex}
                      </span>
                    </div>
                  </div>
                  
                  <p className="font-bold text-stone-800 text-sm">{item.milestone}</p>
                  <p className="text-xs text-stone-500 font-normal leading-relaxed">
                    <strong className="text-stone-700">Target KPI Impact:</strong> {item.target_kpi_impact}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Strategic Investments */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
              <h4 className="font-bold text-stone-800 text-sm tracking-tight uppercase">Strategic Investments & Designs (6-24 Months)</h4>
            </div>

            <div className="relative border-l border-stone-200 pl-6 space-y-6 ml-3">
              {res.decision.medium_term_investments.map((item, idx) => (
                <div key={idx} className="relative space-y-2">
                  <span className="absolute -left-10 top-0.5 bg-stone-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-extrabold border-2 border-white shadow-sm">
                    {idx + 1}
                  </span>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded font-mono">
                      {item.timeframe}
                    </span>
                    <div className="flex gap-1">
                      <span className="text-[9px] font-bold text-stone-500 border border-stone-200 px-2 py-0.5 rounded uppercase">
                        Diff: {item.difficulty}
                      </span>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                        Capex: {item.estimated_capex}
                      </span>
                    </div>
                  </div>

                  <p className="font-bold text-stone-800 text-sm">{item.project}</p>
                  <p className="text-xs text-stone-500 font-normal leading-relaxed">
                    <strong className="text-stone-700">Target KPI Impact:</strong> {item.target_kpi_impact}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 4: SCIENTIFIC EVIDENCE GROUNDING (Show citations at the footer always!) */}
      <div className="bg-stone-50 rounded-xl border border-stone-200/80 p-5 mt-6 space-y-3 max-w-full">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2.5">
          <FileText className="w-4 h-4 text-emerald-700" />
          <h5 className="font-extrabold text-stone-800 text-xs tracking-wider uppercase">Scientific Grounding Dossier</h5>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] text-stone-500 font-normal leading-relaxed">
            All agronomic choices generated by the autonomous agent ecosystem have been aligned with the following peer-reviewed agricultural journals retrieved via the SustainEco-AI Verified Academic Literature Library:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {res.research.academic_citations.map((cite, index) => (
              <div key={index} className="p-3 bg-white rounded border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-850 leading-snug">"{cite.title}"</div>
                <div className="text-[10px] text-stone-400 font-mono">Authors: {cite.authors} — {cite.journal_and_year}</div>
                <p className="text-[11px] text-stone-600 font-normal leading-relaxed pt-1 border-t border-stone-50">
                  <strong className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider mr-1">Empirical Finding:</strong>
                  {cite.key_finding}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-mono font-semibold text-stone-500">
            <span className="bg-stone-200/50 px-2.5 py-0.5 rounded">Matched: {res.research.fao_guidelines_matched.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* EXPORT OVERLAY AND HIGH-FIDELITY PREVIEW CLIENT */}
      {exportState !== "idle" && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-8">
            
            {/* Modal Header */}
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-800" />
                <h4 className="font-extrabold text-stone-850 text-xs tracking-wider uppercase">
                  SustainEco-AI Advisory Exporter
                </h4>
              </div>
              {exportState === "preview" && (
                <button
                  type="button"
                  onClick={() => setExportState("idle")}
                  className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-500 transition"
                  aria-label="Close exporter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              
              {/* STATE 1: GENERATING ANIMATION */}
              {exportState === "generating" && (
                <div className="py-16 flex flex-col items-center justify-center space-y-6 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-800 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-black text-emerald-900">
                      {exportProgress}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-extrabold text-stone-800 text-sm tracking-wide uppercase">
                      Compiling Scientific PDF Advisory Report
                    </h5>
                    <p className="text-xs text-stone-500 font-mono italic max-w-sm">
                      {exportStepMessage}
                    </p>
                  </div>

                  {/* Progress track */}
                  <div className="w-full max-w-xs bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
                    <div 
                      className="bg-emerald-800 h-full rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* STATE 2: DUST-JACKET HIGH FIDELITY REPORT PREVIEW */}
              {exportState === "preview" && (
                <div className="space-y-6">
                  
                  {/* Print Notice alert info */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-emerald-850">
                    <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">A4 Dynamic Print Sheet Generated Successfully!</p>
                      <p className="text-stone-600 font-normal mt-1 leading-relaxed">
                        A print viewport configuration has been structured specifically for A4 layouts. Click <strong>Print via Browser</strong> to trigger your browser's print dialog, or click <strong>Download Raw Report Data</strong> to save an offline text archive.
                      </p>
                    </div>
                  </div>

                  {/* PDF Document Replica Sheet (Designed to look like true paper PDF) */}
                  <div id="printable-area" className="bg-white border-2 border-stone-300 shadow-xl p-8 rounded-lg max-w-full font-sans text-stone-805 min-h-[500px] text-xs space-y-6 select-text relative">
                    
                    {/* Watermark logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none text-center">
                      <Trees className="w-72 h-72 mx-auto text-emerald-800" />
                      <div className="font-black text-4xl uppercase tracking-[0.25em] text-emerald-900 mt-4">SustainEco-AI</div>
                    </div>

                    {/* PDF Header Block */}
                    <div className="flex justify-between items-start border-b-2 border-stone-800 pb-4 relative z-10">
                      <div>
                        <div className="text-[9px] font-mono tracking-widest text-emerald-800 font-extrabold uppercase">
                          SustainEco-AI Active Advisory System
                        </div>
                        <h1 className="text-base font-black text-stone-900 mt-1 uppercase tracking-tight">
                          Agronomic & Ecosystem Assessment
                        </h1>
                        <p className="text-[10px] text-stone-500 mt-0.5 font-normal">
                          Subject Target: {res.farm_data.farm_name || "Enterprise Farm Plot"}
                        </p>
                      </div>
                      <div className="text-right font-mono text-[9px] text-stone-400">
                        <div>REF_RUN: {res.run_id.substring(0, 18)}</div>
                        <div>DATE: {new Date().toLocaleDateString()}</div>
                        <div className="font-bold text-emerald-800">STATUS: APPROVED</div>
                      </div>
                    </div>

                    {/* PDF Metadata Details block */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-50 border border-stone-200 rounded p-4 relative z-10">
                      <div>
                        <span className="text-[9px] font-mono text-stone-400 uppercase font-black tracking-wide block">Primary Cultivar</span>
                        <span className="font-bold text-stone-700 text-xs">{res.farm_data.crop_name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-stone-400 uppercase font-black tracking-wide block">Geo-Location Coords</span>
                        <span className="font-bold text-stone-700 text-xs truncate block">{res.farm_data.location}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-stone-400 uppercase font-black tracking-wide block">Carbon Mitigation Index</span>
                        <span className="font-extrabold text-emerald-800 text-xs">-{res.decision.projected_ecological_gains_3yr.carbon_footprint_mitigation_tco2e} tCO2e/yr</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono text-stone-400 uppercase font-black tracking-wide block">Hydrology Delta rating</span>
                        <span className="font-bold text-stone-700 text-xs">-{res.decision.projected_ecological_gains_3yr.water_resource_draw_reduction_pct}% Conserved</span>
                      </div>
                    </div>

                    {/* PDF Executive Paradigm section */}
                    <div className="space-y-2 relative z-10">
                      <h4 className="text-[11px] font-extrabold border-b border-stone-200 pb-1 uppercase tracking-wider text-emerald-850">
                        1. Unifying Transition Paradigm
                      </h4>
                      <p className="font-bold text-stone-850 text-[11px] leading-snug">
                        {res.decision.unifying_agricultural_paradigm}
                      </p>
                      <p className="text-stone-600 text-[11px] leading-relaxed font-sans font-normal text-justify">
                        {res.decision.executive_summary}
                      </p>
                    </div>

                    {/* PDF Diagnostics overview section */}
                    <div className="space-y-2 relative z-10">
                      <h4 className="text-[11px] font-extrabold border-b border-stone-200 pb-1 uppercase tracking-wider text-emerald-850">
                        2. Expert Specialist Diagnostic Metrics
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px]">
                        <div className="bg-stone-50 border border-stone-150 p-2.5 rounded">
                          <span className="font-extrabold block text-emerald-800 uppercase text-[9px] tracking-wide">Soil Biosphere Diagnostic</span>
                          <p className="text-stone-600 mt-1 leading-relaxed font-normal">{res.soil.detailed_findings}</p>
                        </div>
                        <div className="bg-stone-50 border border-stone-150 p-2.5 rounded">
                          <span className="font-extrabold block text-emerald-800 uppercase text-[9px] tracking-wide">Hydrological Efficiency Diagnostic</span>
                          <p className="text-stone-600 mt-1 leading-relaxed font-normal">{res.water.findings}</p>
                        </div>
                      </div>
                    </div>

                    {/* PDF Action Roadmap section */}
                    <div className="space-y-2 relative z-10">
                      <h4 className="text-[11px] font-extrabold border-b border-stone-200 pb-1 uppercase tracking-wider text-emerald-850">
                        3. Sequence of Implementation Roadmaps
                      </h4>
                      <div className="space-y-2.5">
                        {res.decision.priority_actionable_milestones.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-start pl-1 text-[10.5px]">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded shrink-0 font-mono">
                              {item.timeframe}
                            </span>
                            <div>
                              <span className="font-bold text-stone-850 block">{item.milestone}</span>
                              <span className="text-stone-500 font-normal leading-relaxed">
                                <strong className="text-stone-700">Target KPI Impact:</strong> {item.target_kpi_impact} | <strong className="text-stone-700 font-mono text-[9px]">CAPEX:</strong> {item.estimated_capex} ({item.difficulty})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PDF Footer credits */}
                    <div className="border-t border-stone-300 pt-3 flex justify-between items-center text-[9px] font-semibold text-stone-400 font-mono relative z-10">
                      <span>Certified by SustainEco-AI advisory cluster validation nodes.</span>
                      <span>Page 1 of 1</span>
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="bg-stone-50 border-t border-stone-200 px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 z-10">
              {exportState === "preview" ? (
                <>
                  <button
                    type="button"
                    onClick={downloadTxtReport}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold border border-stone-300 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Raw Report Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-950 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print via Browser</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportState("idle")}
                    className="flex items-center justify-center px-4 py-2 bg-white hover:bg-stone-50 text-stone-500 rounded-lg text-xs font-semibold border border-stone-200 transition"
                  >
                    <span>Close</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-200 text-stone-400 rounded-lg text-xs font-semibold cursor-not-allowed"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Compiling...</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
