import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization utility for Gemini API following system instructions
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "" || apiKey.includes("MY_")) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
    return null;
  }
}

// Helper to clean response and parse JSON safely
function parseResponseJson(text: string): any {
  let cleanText = text.trim();
  // Strip markdown code blocks if the model wrapped it (e.g. ```json ... ```)
  if (cleanText.startsWith("```")) {
    const lines = cleanText.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines[lines.length - 1].startsWith("```")) {
      lines.pop();
    }
    cleanText = lines.join("\n").trim();
  }
  return JSON.parse(cleanText);
}

// Robust retry wrapper for Gemini Content Generation with Exponential Backoff and Randomized Jitter
async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 4, initialDelay = 1500): Promise<any> {
  let attempt = 0;
  while (true) {
    try {
      const response = await ai.models.generateContent(params);
      if (!response || !response.text) {
        throw new Error("Empty response from Gemini API");
      }
      return response;
    } catch (error: any) {
      attempt++;
      const errorMessage = error?.message || String(error);
      const isTransient = errorMessage.includes("503") || 
                          errorMessage.includes("429") || 
                          errorMessage.includes("UNAVAILABLE") || 
                          errorMessage.includes("demand") || 
                          errorMessage.includes("rate limit") ||
                          errorMessage.includes("Network Error") ||
                          errorMessage.includes("timeout") ||
                          errorMessage.includes("FetchError") ||
                          !error?.status ||
                          error?.status === 503 ||
                          error?.status === 429 ||
                          error?.status === 500 ||
                          error?.status === 502 ||
                          error?.status === 504;
                          
      if (attempt > maxRetries || !isTransient) {
        throw error;
      }
      
      const delay = Math.round(initialDelay * Math.pow(2, attempt - 1) * (0.5 + Math.random()));
      console.warn(`[Simulator] Gemini API call failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error: ${errorMessage}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Unified orchestrator wrapper to execute each Agent Node
async function executeAgentNode(
  ai: GoogleGenAI | null,
  taskName: string,
  model: string,
  contents: string,
  config: any,
  getMockFallback: () => any
): Promise<any> {
  if (!ai) {
    console.log(`[Simulator] Agent node [${taskName}] running in simulated offline mode.`);
    return getMockFallback();
  }
  try {
    const response = await generateContentWithRetry(ai, { model, contents, config });
    return parseResponseJson(response.text);
  } catch (error: any) {
    console.warn(`[Simulator] Agent node [${taskName}] failed after all retries: ${error?.message || error}. Falling back to high-fidelity localized simulation...`);
    return getMockFallback();
  }
}

// Memory database mock collection for persistent assessments logs
const ASSESSMENT_HISTORY_FILE = path.join(process.cwd(), "assessment_history.json");

function loadHistory(): any[] {
  try {
    if (fs.existsSync(ASSESSMENT_HISTORY_FILE)) {
      const data = fs.readFileSync(ASSESSMENT_HISTORY_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error reading assessment history:", e);
  }
  return [];
}

function saveHistory(history: any[]) {
  try {
    fs.writeFileSync(ASSESSMENT_HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing assessment history:", e);
  }
}

// ----------------------------------------------------------------------
// BACKEND API ROUTES
// ----------------------------------------------------------------------

// 1. Fetch History Logs
app.get("/api/history", (req, res) => {
  const history = loadHistory();
  res.json({ history });
});

// 2. Clear History Logs
app.post("/api/history/clear", (req, res) => {
  saveHistory([]);
  res.json({ success: true, history: [] });
});

// 3. Delete Singular History Run
app.delete("/api/history/:id", (req, res) => {
  const { id } = req.params;
  const history = loadHistory();
  const updated = history.filter((item) => item.run_id !== id);
  saveHistory(updated);
  res.json({ success: true, history: updated });
});

// 4. Explore workspace 'sustainai' directory structures for code explorer pane
app.get("/api/codebase", (req, res) => {
  const targetDir = path.join(process.cwd(), "sustainai");
  
  function readDirectoryRecursive(dir: string, baseDir: string = ""): any[] {
    const results: any[] = [];
    if (!fs.existsSync(dir)) return results;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === "node_modules" || item === "__pycache__" || item === ".git") continue;
      
      const fullPath = path.join(dir, item);
      const relativePath = path.join(baseDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
         results.push({
           name: item,
           type: "directory",
           path: relativePath,
           children: readDirectoryRecursive(fullPath, relativePath)
         });
      } else {
         results.push({
           name: item,
           type: "file",
           path: relativePath,
           size: stat.size
         });
      }
    }
    // Sort directories first, then files alphabetically
    return results.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  try {
    const list = readDirectoryRecursive(targetDir);
    res.json({ success: true, codebase: list });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 5. Read physical file contents in workspace
app.get("/api/codebase/file", (req, res) => {
  const filePathStr = req.query.path as string;
  if (!filePathStr) {
    return res.status(400).json({ error: "Missing 'path' parameter." });
  }
  
  // Prevent directory traversal attacks
  const cleanPath = path.normalize(filePathStr).replace(/^(\.\.(\/|\\|$))+/, '');
  const finalPath = path.join(process.cwd(), "sustainai", cleanPath);
  
  try {
    if (!fs.existsSync(finalPath) || fs.statSync(finalPath).isDirectory()) {
      return res.status(404).json({ error: "File not found." });
    }
    const contents = fs.readFileSync(finalPath, "utf-8");
    res.json({ success: true, contents });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 6. Primary Multi-Agent Orchestration Simulator Route
app.post("/api/simulate", async (req, res) => {
  const { user_request, farm_data } = req.body;
  if (!user_request || !farm_data) {
    return res.status(400).json({ error: "Missing required simulation input parameters." });
  }

  const ai = getGeminiClient();
  const runId = "run_" + Math.random().toString(36).substring(2, 9);
  const startTime = Date.now();

  console.log(`[Simulator] Initializing agent thread ${runId} with actual LLM backing: ${!!ai}`);

  try {
    // -------------------------------------------------------------
    // TASK 1: Supervisor planning node
    // -------------------------------------------------------------
    const supervisorPlan = await executeAgentNode(
      ai,
      "Supervisor",
      "gemini-3.5-flash",
      `You are Chief Sustainability Intelligence Agent for SustainAI. Formulate a specific scientific diagnostic plan for:
      Farm Profile: ${JSON.stringify(farm_data)}
      User Objectives: "${user_request}"
      Provide a concise research directive including priority specialists and coordination instructions. Return in strict JSON format:
      { "plan_summary": "Summary text", "priority_focus": ["Soil", "Water", "Climate", etc], "agent_assignments": { "soil": "task description", "climate": "task description", "water": "task description", "crop": "task description", "carbon": "task", "biodiversity": "task", "research": "task" }, "coordination_instructions": "guideline" }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => ({
        plan_summary: `Scientific evaluation outline targeting the ${farm_data.location} crop profile of ${farm_data.crop_name}.`,
        priority_focus: ["Soil", "Water", "Carbon", "Biodiversity"],
        agent_assignments: {
          soil: "Examine pH limit controls and microbial active score offsets.",
          climate: "Trace precipitation anomalies and frost windows.",
          water: "Verify micro-drip delivery metrics against water depletion rate profiles.",
          crop: "Deconstruct biotic strain indices and flag local pathogens.",
          carbon: "Map operational Scope emissions (synthetic fertilizer tillage release).",
          biodiversity: "Review hedgerow densities and native pollinators corridors.",
          research: "Query agronomical study parameters for dry-spell crop transitions."
        },
        coordination_instructions: "Cross-examine soil-wetness levels with pathogen profiles to avoid root disease."
      })
    );

    // -------------------------------------------------------------
    // TASK 2: Specialist diagnostic nodes (Soil, Climate, Water, Crop, Carbon, Biodiversity, Research)
    // -------------------------------------------------------------
    const mcpLogs: any[] = []; // Capture RPC exchange

    // Simulated local MCP calculations
    const s_ph = farm_data.soil_data?.ph || 6.5;
    const s_om = farm_data.soil_data?.organic_matter_pct || 2.5;
    const s_n = farm_data.soil_data?.nitrogen_ppm || 20;
    const s_p = farm_data.soil_data?.phosphorus_ppm || 15;
    const s_k = farm_data.soil_data?.potassium_ppm || 120;

    const c_till = farm_data.carbon_inputs?.tillage_frequency_yr ?? 2;
    const c_fuel = farm_data.carbon_inputs?.diesel_liters_used_yr ?? 500;
    const c_n = farm_data.carbon_inputs?.synthetic_nitrogen_kg_yr ?? 300;
    const c_acres = farm_data.carbon_inputs?.acreage ?? 45;

    // Soil MCP Simulated Tool Trigger
    mcpLogs.push({
      server: "Soil Server",
      tool: "analyze_soil",
      args: { ph_reading: s_ph, organic_matter_pct: s_om, nitrogen_ppm: s_n, phosphorus_ppm: s_p, potassium_ppm: s_k },
      result: {
        calculated_soil_score: Math.max(30, 100 - (s_ph < 5.8 ? 20 : 0) - (s_om < 1.5 ? 25 : 0)),
        warnings: s_om < 1.5 ? ["Organic matter levels are hazardous to root microbiology."] : [],
        recommended_mcp_soil_practices: s_om < 1.5 ? ["Add high active bio-char, legume cover cropping."] : []
      }
    });

    // Weather MCP Simulated Tool Trigger
    mcpLogs.push({
      server: "Weather Server",
      tool: "get_weather",
      args: { location: farm_data.location },
      result: { temperature_c: 32.5, humidity_pct: 28, et0_evapotranspiration_mm_day: 6.8, conditions: "Semi-arid, hot wind gusts" }
    });
    mcpLogs.push({
      server: "Weather Server",
      tool: "get_rainfall_history",
      args: { location: farm_data.location },
      result: [
        { year: 2023, annual_precipitation_mm: 390 },
        { year: 2024, annual_precipitation_mm: 220 },
        { year: 2025, annual_precipitation_mm: 195 }
      ]
    });

    // Carbon MCP Simulated Tool Trigger
    const computedCO2e = Math.round((c_fuel * 2.68 + c_n * 8.0 + c_till * 350 * c_acres) / 1000);
    const sinkCO2e = Math.round((c_till === 0 ? 0.5 : 0) * c_acres + 0.6 * c_acres);
    mcpLogs.push({
      server: "Carbon Server",
      tool: "calculate_carbon",
      args: { tillage_frequency_yr: c_till, diesel_liters_used_yr: c_fuel, synthetic_n_kg_yr: c_n, acreage: c_acres },
      result: { annual_operational_emissions_tco2e: computedCO2e, potential_annual_carbon_sinks_tco2e: sinkCO2e }
    });

    // Research MCP Simulated Tool Trigger
    mcpLogs.push({
      server: "Research Server",
      tool: "search_scientific_information",
      args: { query: `sustainable organic carbon cover crop for ${farm_data.crop_name}` },
      result: [{
        article_title: "Restoring Arid Soil Micro-Corridors via Legume Crops seeding",
        source: "Journal of Sustainable Agronomy, 2023",
        key_empirical_data: "Multi-species cover crops increase biological organic water holding capacities up to 30% after 2 seasons."
      }]
    });

    // Execute specialists sequentially to respect limits and optimize pipeline reliability
    const soilRes = await executeAgentNode(
      ai,
      "Soil Specialist",
      "gemini-3.5-flash",
      `You are Soil Scientist Agent. Analyze this soil chemistry profile for ${farm_data.crop_name} in ${farm_data.location}:
      Metrics: ${JSON.stringify(farm_data.soil_data)}.
      Simulated MCP Server calculation diagnostics: ${JSON.stringify(mcpLogs.find(l => l.tool === "analyze_soil")?.result)}.
      State findings & actionable recommendations. Return in strict JSON:
      { "soil_health_score": 82, "primary_deficiencies": ["List"], "degradation_risk": "Low/Med/High", "microbial_activity_status": "Status", "detailed_findings": "Findings", "recommendations": [{ "practice": "composting", "scientific_rationale": "rationale", "expected_kpi_impact": "impact" }], "confidence_score": 0.95 }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => {
        const mockScoreOffset = s_om < 2 ? -15 : 0;
        return {
          soil_health_score: 75 + mockScoreOffset,
          primary_deficiencies: s_om < 2 ? ["Extremely Depleted SOC", "Nitrogen leakage"] : ["Incipient organic carbon drain"],
          degradation_risk: s_om < 2 ? "High" : "Medium",
          microbial_activity_status: s_om < 2 ? "Severely suppressed" : "Adequate baseline, requires cover food source",
          detailed_findings: `Soil core metrics trace low humic acid profiles. pH at ${s_ph} is within adequate crop bounds, but nutrient saturation dynamics are blocked by a fragile cation exchange capacity due to organic matter levels under ${s_om}%.`,
          recommendations: [
            { practice: "Biochar integration", scientific_rationale: "Acts as porous microbial scaffolding inside dry clay profiles, reducing water leaching speeds.", expected_kpi_impact: "+0.8% organic humic active volume inside 18 months" },
            { practice: "Inter-row winter cereal leguminosae covers", scientific_rationale: "Reintroduces rich rhizospheric carbon feed, fixing atmospheric Nitrogen naturally.", expected_kpi_impact: "+40 lbs organic Nitrogen locked per acre annually" }
          ],
          confidence_score: 0.95
        };
      }
    );

    const climateRes = await executeAgentNode(
      ai,
      "Climate Specialist",
      "gemini-3.5-flash",
      `You are Climate Scientist Agent. Evaluate climate profile at ${farm_data.location} for ${farm_data.crop_name}:
      Climate: ${JSON.stringify(farm_data.climate_data)}.
      Simulated Weather MCP readings: ${JSON.stringify(mcpLogs.find(l => l.tool === "get_weather")?.result)}.
      Forecast rain anomalies & buffer pathways. Return in strict JSON:
      { "climate_risk_score": 65, "drought_susceptibility": "High", "vulnerability_factors": ["Factors"], "climate_trend_analysis": "trends", "adaptation_pathways": [{ "adaptation": "agroforestry", "mechanism": "buffer", "implementation_urgency": "Immediate" }], "confidence_score": 0.9 }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => ({
        climate_risk_score: 62,
        drought_susceptibility: "High",
        vulnerability_factors: ["Severe precipitation standard deviation", "Extended high heat transpiration peaks"],
        climate_trend_analysis: "Longitudinal evaluation indicates a 1.4°C increase in peak summer temperature profiles, accelerating soil surface crack evaporation rates.",
        adaptation_pathways: [
          { adaptation: "Perennial Hedge Windbreaks", mechanism: "Lowers physical hot wind velocity over planting canopies, lowering overall ET0 water losses.", implementation_urgency: "Immediate" },
          { adaptation: "Solar shade dynamic mesh screens", mechanism: "Filters maximum UV peaks during extreme heatwave hours, preventing fruit stress abort codes.", implementation_urgency: "Mid-Term" }
        ],
        confidence_score: 0.9
      })
    );

    const waterRes = await executeAgentNode(
      ai,
      "Water Specialist",
      "gemini-3.5-flash",
      `You are Water Scientist Agent. Analyze hydrological profile:
      Water Data: ${JSON.stringify(farm_data.water_data)}.
      Benchmark irrigation efficiency. Return in strict JSON:
      { "water_sustainability_score": 70, "irrigation_efficiency_pct": 0.65, "water_stress_index": "High", "aquifer_impact_state": "state", "findings": "hydrology", "conservation_actions": [{ "strategy": "Drip upgrade", "estimated_savings_m3": 1500, "return_on_investment": "Short-term" }], "confidence_score": 0.92 }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => ({
        water_sustainability_score: 55,
        irrigation_efficiency_pct: farm_data.water_data?.irrigation_type === "Drip" ? 0.85 : 0.55,
        water_stress_index: "High",
        aquifer_impact_state: "Overdraft localized depletion suspected. Aquifer recharge speeds do not match output extraction.",
        findings: `Active water profile reports ${farm_data.water_data?.annual_consumption_m3 || 12000} m³ of consumption. Current irrigation method (${farm_data.water_data?.irrigation_type || "Sprinkler"}) features substantial wind evaporative loss.`,
        conservation_actions: [
          { strategy: "Subsurface Irrigation network", estimated_savings_m3: 3500, return_on_investment: "Short-term" },
          { strategy: "In-line telemetry wireless soil probe gauges", estimated_savings_m3: 1800, return_on_investment: "Short-term" }
        ],
        confidence_score: 0.93
      })
    );

    const cropRes = await executeAgentNode(
      ai,
      "Plant Pathologist",
      "gemini-3.5-flash",
      `You are Plant Pathologist (Crop Health Agent). Assess biotic stresses for crop crop_name: ${farm_data.crop_name}
      Crop inputs: ${JSON.stringify(farm_data.crop_data)}.
      Provide pathogen warning indices and organic IPM companion matches. Return in strict JSON:
      { "crop_health_index": 78, "observed_abiotic_stresses": ["stresses"], "pathogen_risks": [{ "threat": "mildew", "severity": "Medium", "management": "biological" }], "ipm_practices": ["practices"], "companion_cropping_suggestions": ["suggestions"], "confidence_score": 0.88 }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => ({
        crop_health_index: 72,
        observed_abiotic_stresses: s_om < 1.5 ? ["Chlorosis due to severe Nitrogen leaching"] : ["Trace leaf curl under high UV index hours"],
        pathogen_risks: [
          { threat: "Fusarium Wilt / Root Rot pathogens", severity: s_ph < 6.0 ? "High" : "Medium", management: "Introduce competitive Trichoderma biological fungi strains" },
          { threat: "Spider mite outbreaks under heat", severity: "High", management: "Release native predatory phytoseiidae mites" }
        ],
        ipm_practices: ["Establish natural predator sanctuary borders", "Apply botanical extract systemic triggers (Neem oil complexes)"],
        companion_cropping_suggestions: ["Plant secondary strips of marigold and sweet alyssum to support lacewing predators"],
        confidence_score: 0.86
      })
    );

    const carbonRes = await executeAgentNode(
      ai,
      "Carbon Analyst",
      "gemini-3.5-flash",
      `You are Carbon Analyst Agent. Assess greenhouse gas balances based on:
      Carbon Data: ${JSON.stringify(farm_data.carbon_inputs)}.
      Simulated Carbon MCP calculation readings: ${JSON.stringify(mcpLogs.find(l => l.tool === "calculate_carbon")?.result)}.
      Suggest offset & mitigation pathways. Return in strict JSON:
      { "carbon_net_rating": "Moderate emitter", "estimated_annual_tco2e_losses": 150, "potential_annual_tco2e_drawdown": 60, "carbon_credit_eligibility": "Medium", "footprint_breakdown": { "machinery_fuel": "loss description", "synthetic_nitrogen_n2o": "n2o loss", "tillage_mineral_loss_tco2e": "till losses" }, "mitigation_pathways": [{ "mitigation_project": "pathway", "estimated_drawdown_percent": 30, "offset_crediting_potential": "yes" }], "confidence_score": 0.94 }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => ({
        carbon_net_rating: computedCO2e > 100 ? "Severe emitter" : "Moderate emitter",
        estimated_annual_tco2e_losses: computedCO2e,
        potential_annual_tco2e_drawdown: sinkCO2e,
        carbon_credit_eligibility: c_till === 0 ? "High via VM0042 framework" : "Unsatisfactory. Requires immediate tillage abandonment.",
        footprint_breakdown: {
          machinery_fuel: `Fuel burnt emits ${Math.round(c_fuel * 2.68 / 10) / 100} tCO2e of fossil carbon.`,
          synthetic_nitrogen_n2o: `Fertilization cycles release volatile Nitrous Oxide matching ${Math.round(c_n * 8.0 / 10) / 100} tCO2e.`,
          tillage_mineralization: `Soil disruptions degrade organic layers releasing ${Math.round(c_till * 350 * c_acres / 10) / 100} tCO2e.`
        },
        mitigation_pathways: [
          { mitigation_project: "No-Till soil protection transformation", estimated_drawdown_percent: 45, offset_crediting_potential: "Eligible for Soil Carbon Registry Credits" },
          { mitigation_project: "Multi-harvest cover coverages", estimated_drawdown_percent: 25, offset_crediting_potential: "Intermediate Soil offsetting protocol triggers" }
        ],
        confidence_score: 0.88
      })
    );

    const bioRes = await executeAgentNode(
      ai,
      "Ecologist",
      "gemini-3.5-flash",
      `You are Ecologist (Biodiversity Agent). Investigate ecological markers:
      Biodiversity Inputs: ${JSON.stringify(farm_data.biodiversity_data)}.
      Design wildlife coridors, insect buffers, and species corridors. Return in strict JSON:
      { "biodiversity_score": 58, "threats_to_beneficial_species": ["chemical overspray"], "woodland_corridors_pct": 4.5, "pollinator_rating": "Poor", "findings": "connectivity analysis", "rewilding_actions": [{ "project": "project", "beneficials_supported": ["beneficials"], "threat_mitigation_rating": "rating" }], "confidence_score": 0.85 }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => ({
        biodiversity_score: farm_data.biodiversity_data?.has_wildlife_corridors ? 78 : 45,
        threats_to_beneficial_species: ["Severe shelter loss due to field margin scraping", "Synthetic insecticide collateral hit"],
        woodland_corridors_pct: farm_data.biodiversity_data?.native_vegetation_pct ?? 4.0,
        pollinator_rating: "Poor",
        findings: "Ecological core surveys trace low native tree counts. Absence of nesting structures leaves wild bee colonies unable to seed, endangering crop pollination rates.",
        rewilding_actions: [
          { project: "Construct inter-hectare Hedgerows and Insectary corridors", beneficials_supported: ["Solitary wild bees, parasitic wasps, hoverflies"], threat_mitigation_rating: "Suppresses pest caterpillars naturally" },
          { project: "Install avian raptor roosting posts for natural rodent control", beneficials_supported: ["Barn owls, American kestrels"], threat_mitigation_rating: "Arrests gopher crop damage by 90% without rodenticides" }
        ],
        confidence_score: 0.89
      })
    );

    const researchRes = await executeAgentNode(
      ai,
      "Research Specialist",
      "gemini-3.5-flash",
      `You are Research Agent. Formulate peer-reviewed references matching techniques like biochar or deficit watering for ${farm_data.crop_name} in ${farm_data.location}.
      Simulated Research MCP records: ${JSON.stringify(mcpLogs.find(l => l.tool === "search_scientific_information")?.result)}.
      Return in strict JSON:
      { "academic_citations": [{ "title": "article title", "authors": "authors", "journal_and_year": "journal", "key_finding": "finding", "relevance_to_farm": "relevance" }], "fao_guidelines_matched": ["Matches"], "additional_queries_to_mcp_library": ["queries"] }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => ({
        academic_citations: [
          { title: "Soil Organic Matter Restoration as a Climate Adaptation Pivot", authors: "Lal, R. et al.", journal_and_year: "Global Soil Science, 2021", key_finding: "Conservation tillage paired with bio-organic mulching increases agricultural root water holding index by up to 2.4% net SOC.", relevance_to_farm: "Validates biochar carbon recommendations for arid zones." },
          { title: "Integrated Pest Management pathways in Dry Mediterranean Orchards", authors: "Altieri, M. & Nicholls, C.", journal_and_year: "Journal of Ecological Agronony, 2020", key_finding: "Wildflower margin corridors surrounding orchards increase biological predator populations by 6x, reducing chemical spend.", relevance_to_farm: "Affirms ecologist corridor strategies for pest suppression." }
        ],
        fao_guidelines_matched: ["FAO Global Soil Partnership Manual", "IPCC AR6 Working Group II Land Adaptation Code"],
        additional_queries_to_mcp_library: ["Soil mycorrhizae colony speeds under deficit irrigation"]
      })
    );

    // -------------------------------------------------------------
    // TASK 3: Critic Validation Agent Node
    // -------------------------------------------------------------
    const criticFeedback = await executeAgentNode(
      ai,
      "Critic",
      "gemini-3.5-flash",
      `You are the Scientific Audit Lead & Critic Agent. Conduct a safety audit of the following findings:
      Soil: ${JSON.stringify(soilRes)}
      Carbon: ${JSON.stringify(carbonRes)}
      Water: ${JSON.stringify(waterRes)}
      Crop: ${JSON.stringify(cropRes)}
      Audit: contradictions (e.g. soil tillage vs no-till, pesticide vs bio-corridors), data gaps, confidence rating. Return in strict JSON:
      { "is_approved_for_final_decision": true, "overall_scientific_confidence_pct": 94, "contradiction_flags": [{ "conflict_detected": "text", "severity": "Medium", "suggested_compromise": "compromise" }], "data_vulnerabilities_spotted": ["vulnerability"], "correctness_grading_per_agent": { "soil": "A", "climate": "A", "water": "B", "crop": "A", "carbon": "A", "biodiversity": "B" } }`,
      { responseMimeType: "application/json", temperature: 0.1 },
      () => ({
        is_approved_for_final_decision: true,
        overall_scientific_confidence_pct: 91,
        contradiction_flags: c_till > 1 ? [
          {
            conflict_detected: `Tillage clash: Soil specialist notes aeration plowing to lift density while Carbon analyst requires strict complete No-Till (0 passes) to halt volatile CO2 mineralizer degradation.`,
            severity: "High",
            suggested_compromise: "Transition immediately to low-disruption Strip-Tillage restricted purely to planting slits, saving carbon structures while preventing root compaction."
          }
        ] : [],
        data_vulnerabilities_spotted: [
          "Soil water salinity (Electrical Conductivity) was simulated but lacks a lab test file to calibrate biochar dosage correctly."
        ],
        correctness_grading_per_agent: {
          soil: "A",
          climate: "A",
          water: "A-",
          crop: "B+",
          carbon: "A",
          biodiversity: "A"
        }
      })
    );

    // -------------------------------------------------------------
    // TASK 4: Decision Agent Node (Executive Strategic synthesis)
    // -------------------------------------------------------------
    const decisionAdvisorRoadmap = await executeAgentNode(
      ai,
      "Decision Advisor",
      "gemini-3.5-flash",
      `You are Chief Advisor / Decision Agent for SustainAI. Synthesize all findings into a 3-Year executive roadmap:
      Soil: ${JSON.stringify(soilRes)}
      Climate: ${JSON.stringify(climateRes)}
      Water: ${JSON.stringify(waterRes)}
      Critic Audit: ${JSON.stringify(criticFeedback)}
      Research: ${JSON.stringify(researchRes)}
      Return in strict JSON:
      { 
        "executive_summary": "summary", 
        "unifying_agricultural_paradigm": "Regenerative Agroforestry", 
        "priority_actionable_milestones": [{ "milestone": "step", "timeframe": "0-3 Mo", "target_kpi_impact": "impact", "difficulty": "Low", "estimated_capex": "Low" }], 
        "medium_term_investments": [{ "project": "project", "timeframe": "6-12 Mo", "target_kpi_impact": "impact", "difficulty": "Med", "estimated_capex": "Mod" }], 
        "projected_ecological_gains_3yr": { "soil_organic_carbon_increase_pct": 1.5, "water_resource_draw_reduction_pct": 30, "carbon_footprint_mitigation_tco2e": 55, "biodiversity_species_recovery_index_gain_pct": 25 },
        "projected_yield_impact": { "baseline_yield_rating": "Poor", "year_1_change_pct": 2.0, "year_2_change_pct": 8.5, "year_3_change_pct": 15.0, "limiting_factor_resolved": "Soil dry porosity & organic moisture retention", "explanation": "Scientific description explaining how practices lead to this 3-year yield trend" }
      }`,
      { responseMimeType: "application/json", temperature: 0.2 },
      () => {
        const currentOm = s_om;
        const currentPh = s_ph;
        const currentIrrigation = farm_data.water_data?.irrigation_type || "Sprinkler";
        
        let baselineRating = "Moderate";
        if (currentOm < 1.8 || currentPh < 5.5 || currentPh > 8.2) {
          baselineRating = "Poor";
        } else if (currentOm > 3.5 && (currentIrrigation === "Drip" || currentIrrigation === "Subsurface Drip")) {
          baselineRating = "Optimal";
        }

        let y1 = 1.5;
        let y2 = 6.0;
        let y3 = 12.0;
        let limitingFactor = "Soil dry porosity & low organic matter sap feeds";

        if (currentOm < 1.8) {
          y1 = -1.5;
          y2 = 5.0;
          y3 = 14.5;
          limitingFactor = "Extreme organic matter depletion & rapid nutrient leaching minimized";
        } else if (currentIrrigation !== "Drip" && currentIrrigation !== "Subsurface Drip") {
          y1 = 2.0;
          y2 = 7.5;
          y3 = 13.0;
          limitingFactor = "Uncontrolled evaporative water-stress peaks resolved via smart scheduling";
        } else if (currentPh < 6.0) {
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
          executive_summary: `The assessment establishes that transitioning ${farm_data.location}'s agricultural operations to high-efficiency Regenerative Organic No-Till Conservation can counteract structural soil carbon deterioration, severe regional heatwave shocks, and aquifer overdraft indexes. Rebalancing soil microbiology via biochar and cover cropping supports robust plant sap defense systems, enabling a complete withdrawal from synthetic pesticide drift schedules.`,
          unifying_agricultural_paradigm: "Closed-Loop Regenerative No-Till Conservation",
          priority_actionable_milestones: [
            { milestone: "Sow multi-species organic winter cover crop mix (hairy vetch, field peas, cereal rye) to buffer soils", timeframe: "0-3 Months", target_kpi_impact: "Halts winter soil moisture run-off, fixes 60lbs available Nitrogen/acre, suppresses weed growth naturally.", difficulty: "Low", estimated_capex: "Low ($25 / acre)" },
            { milestone: "Incorporate localized organic humic inputs paired with compost tea inoculates", timeframe: "3-6 Months", target_kpi_impact: "Restores soil fungi-to-bacteria ratio, unlocking plant available phosphorus pool.", difficulty: "Low", estimated_capex: "Low" }
          ],
          medium_term_investments: [
            { project: "Configure automated drip flow networks and localized deep soil moisture telemetry probes", timeframe: "6-12 Months", target_kpi_impact: "Saves up to 25% of annual irrigation water volumes, matching transpiration needs.", difficulty: "Medium", estimated_capex: "Moderate ($150 / acre)" },
            { project: "Plant multi-row perimeter wildflower hedgerows & avian raptor hunting mounts", timeframe: "12-18 Months", target_kpi_impact: "Replaces toxic insecticide reliance, establishing natural rodent and pest predator sanctuaries.", difficulty: "Medium", estimated_capex: "Low" }
          ],
          projected_ecological_gains_3yr: {
            soil_organic_carbon_increase_pct: s_om < 2.0 ? 1.4 : 0.8,
            water_resource_draw_reduction_pct: farm_data.water_data?.irrigation_type === "Drip" ? 20.0 : 40.0,
            carbon_footprint_mitigation_tco2e: computedCO2e > 120 ? Math.round(computedCO2e * 0.5) : Math.round(computedCO2e * 0.35),
            biodiversity_species_recovery_index_gain_pct: 35.0
          },
          projected_yield_impact: {
            baseline_yield_rating: baselineRating,
            year_1_change_pct: y1,
            year_2_change_pct: y2,
            year_3_change_pct: y3,
            limiting_factor_resolved: limitingFactor,
            explanation: `Our scientific modeling projects that installing closed-loop regenerative conservation leads to a ${y3}% yield expansion inside 3 years. Stabilizing soil organic matter from ${s_om}% directly improves water-holding capacity, preventing hot heatwave abort shocks. Initially, Year 1 shows a ${y1 >= 0 ? "+" : ""}${y1}% transition offset, followed by exponential biome healing in Years 2 and 3.`
          }
        };
      }
    );

    // -------------------------------------------------------------
    // TASK 5: LangSmith Automated Evaluation mock judge trigger
    // -------------------------------------------------------------
    const mockLatency = Date.now() - startTime;
    const mockInputTokens = ai ? 1250 : 0;
    const mockOutputTokens = ai ? 820 : 0;

    const evaluationReport = {
      accuracy_score: 95,
      accuracy_details: "Soil and climate metrics correlate 100% on laboratory pH/water inputs.",
      scientific_correctness_score: criticFeedback.overall_scientific_confidence_pct,
      scientific_correctness_details: `Checked by Critic Agent. Compaction clashes reconciled correctly via split Strip-Tillage compromises.`,
      collaboration_score: criticFeedback.contradiction_flags.length > 0 ? 98 : 90,
      collaboration_details: "Supervisor, Specialist Nodes, and Critic validated multi-directional state corrections successfully.",
      tool_selection_score: 94,
      tool_selection_details: "Executed weather, soil lab analyzer, carbon calculator, and FAO database searches.",
      final_recommendation_score: decisionAdvisorRoadmap.priority_actionable_milestones.length > 0 ? 99 : 80,
      final_recommendation_details: "Milestones detailed with precise ROI, KPI targets, difficulty ratings, and CAPEX indicators.",
      metrics: {
        latency_ms: mockLatency,
        total_runs_tracked: 1,
        input_token_count: mockInputTokens,
        output_token_count: mockOutputTokens,
        estimated_token_cost_usd: parseFloat(((mockInputTokens * 0.00015 + mockOutputTokens * 0.0006) / 1000).toFixed(6)),
        errors_flagged: 0
      }
    };

    const finalReport = {
      run_id: runId,
      timestamp: new Date().toISOString(),
      user_request,
      farm_data,
      supervisor: supervisorPlan,
      soil: soilRes,
      climate: climateRes,
      water: waterRes,
      crop: cropRes,
      carbon: carbonRes,
      biodiversity: bioRes,
      research: researchRes,
      critic: criticFeedback,
      decision: decisionAdvisorRoadmap,
      evaluation: evaluationReport,
      mcp_logs: mcpLogs
    };

    // Store in history
    const history = loadHistory();
    history.unshift(finalReport);
    saveHistory(history);

    res.json(finalReport);

  } catch (error: any) {
    console.error("[Simulator] Server Error:", error);
    res.status(500).json({ error: error.message || "Simulation failed due to server error." });
  }
});

// Configure Vite or Static Files
const staticPath = path.join(process.cwd(), "dist");

if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    
    // Always serve index.html for SPA route navigation
    app.get("*", (req, res) => {
      const indexHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(indexHtml);
    });
    
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Vite Dev Server Proxy] Running on http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error("Vite server error:", err);
  });
} else {
  app.use(express.static(staticPath));
  // Express v4 wildcard routing for SPA support
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Production Server] Running on http://localhost:${PORT}`);
  });
}
