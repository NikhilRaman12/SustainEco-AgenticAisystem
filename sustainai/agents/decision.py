import json
from typing import Dict, Any
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class DecisionAgent:
    """
    Chief Advisor Agent.
    Converts multi-agent data profiles into a strategic blueprint for the farmer.
    Details immediate high-impact practices and quantifies multi-year ecological gains.
    """
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def compose_strategy(self, state: SustainabilityState) -> Dict[str, Any]:
        full_context = {
            "soil": state.get("soil_results"),
            "climate": state.get("climate_results"),
            "water": state.get("water_results"),
            "crop": state.get("crop_results"),
            "carbon": state.get("carbon_results"),
            "biodiversity": state.get("biodiversity_results"),
            "critic_audit": state.get("critic_feedback"),
            "research_dossier": state.get("research_results")
        }
        
        prompt = f"""
        You are the Chief sustainable Agricultural Decision Advisor at SustainAI.
        Your responsibility is to synthesize the following diverse scientific analyses 
        into a streamlined, masterclass executive agricultural strategy:
        {json.dumps(full_context, indent=2)}

        Identify:
        1. A unifying, cohesive ecological theme for the farm (e.g. regenerative organic transition).
        2. Priority Immediate Actions (0-6 months; low complexity, fast soil/biological returns).
        3. Strategic Interventions (6-24 months; capital investments or systemic design shifts).
        4. Quantifiable Expected Benefits (percentage gains in SOC, water retention, carbon drawdown, and biodiversity indexes).

        Formulate your advisory blueprint in standard, readable JSON conforming to this schema:
        {{
            "executive_summary": "Unified ecological strategy description",
            "unifying_agricultural_paradigm": "e.g., Closed-loop No-Till Agroforestry",
            "priority_actionable_milestones": [
                {{
                    "milestone": "Initiate legume crop cover inter-seeding",
                    "timeframe": "0-3 Months",
                    "target_kpi_impact": "Will arrest soil erosion, inject 50lbs plant-available Nitrogen/acre",
                    "difficulty": "Low",
                    "estimated_capex": "Low"
                }}
            ],
            "medium_term_investments": [
                {{
                    "project": "Drip conversion and automated soil moisture network integration",
                    "timeframe": "6-12 Months",
                    "target_kpi_impact": "Reduces regional water overdraft, decreases mildew susceptibility by 40%",
                    "difficulty": "Medium",
                    "estimated_capex": "Moderate"
                }}
            ],
            "projected_ecological_gains_3yr": {{
                "soil_organic_carbon_increase_pct": 1.2,
                "water_resource_draw_reduction_pct": 35.0,
                "carbon_footprint_mitigation_tco2e": 65.0,
                "biodiversity_species_recovery_index_gain_pct": 28.0
            }}
        }}
        """
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.2
            )
        )
        
        try:
            report = json.loads(response.text)
        except Exception:
            report = {
                "executive_summary": "Failed to synthesize final advisory blueprint.",
                "unifying_agricultural_paradigm": "Standard Best Management Practices",
                "priority_actionable_milestones": [],
                "medium_term_investments": [],
                "projected_ecological_gains_3yr": {
                    "soil_organic_carbon_increase_pct": 0.0,
                    "water_resource_draw_reduction_pct": 0.0,
                    "carbon_footprint_mitigation_tco2e": 0.0,
                    "biodiversity_species_recovery_index_gain_pct": 0.0
                }
            }
        return report
