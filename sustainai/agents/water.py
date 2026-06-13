import json
from typing import Dict, Any
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class WaterAgent:
    """
    Water Resource Scientist Agent.
    Evaluates irrigation systems efficiency, water stresses index, and consumption baselines.
    """
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def analyze(self, state: SustainabilityState) -> Dict[str, Any]:
        water_input = state["farm_data"].get("water_data", {})
        location = state["farm_data"].get("location", "Unknown Location")
        
        prompt = f"""
        You are an elite Water Resource Scientist specializing in agricultural hydrology.
        Analyze the water usage and source characteristics of a farming operation at {location}:
        {json.dumps(water_input, indent=2)}

        Analyze:
        1. Irrigation type and distribution efficiency (e.g., Flood vs Drip vs Pivot vs Subsurface).
        2. Average consumption compared to crop demand benchmarks (water footprint optimization).
        3. Local water stress rating and aquifer/surface supply sustainability.
        4. Hydrological conservation actions (rainwater capture, greywater reuse, soil cover preservation, tailwater recovery).

        Output a strict JSON matching this schema:
        {{
            "water_sustainability_score": 75.0, // Out of 100
            "irrigation_efficiency_pct": 0.0, // Water efficiency percent (e.g. 0.85 for high drip)
            "water_stress_index": "Low/Medium/High",
            "aquifer_impact_state": "Assessment of source buffer safety",
            "findings": "Analytical Hydrology report on depletion curves and delivery optimization",
            "conservation_actions": [
                {{
                    "strategy": "e.g., Conversion from overhead pivot to smart drip with soil probe sync",
                    "estimated_savings_m3": 1250,
                    "return_on_investment": "Short-term / Medium-term / Prohibitive"
                }}
            ],
            "confidence_score": 0.9
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
                "water_sustainability_score": 50.0,
                "irrigation_efficiency_pct": 0.5,
                "water_stress_index": "High",
                "aquifer_impact_state": "Depleted aquifer extraction suspected",
                "findings": "Hydrological profiles parsing exception.",
                "conservation_actions": [{"strategy": "Install localized soil moisture trackers", "estimated_savings_m3": 400, "return_on_investment": "Short-term"}],
                "confidence_score": 0.5
            }
        return report
