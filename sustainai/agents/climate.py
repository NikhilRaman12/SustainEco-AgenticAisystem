import json
from typing import Dict, Any
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class ClimateAgent:
    """
    Climate Scientist Agent.
    Evaluates microclimate patterns, annual rain variance, extreme stress risks (frost, heatwave),
    and adapts farming calendars based on seasonal forecasts.
    """
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def analyze(self, state: SustainabilityState) -> Dict[str, Any]:
        climate_input = state["farm_data"].get("climate_data", {})
        location = state["farm_data"].get("location", "Unknown Location")
        
        prompt = f"""
        You are a seasoned Climate Scientist and Agro-Climatologist.
        Analyze the regional climate variables for the farm located in {location}:
        {json.dumps(climate_input, indent=2)}

        Examine:
        1. Temperature trends and risks of high-heat crop abort events.
        2. Rainfall variability (standard deviations, season shifts, drought windows).
        3. Extreme events index (frost, flooding, hailstorms, heatwaves).
        4. Climate-resilient shifts (planting timeline alteration, shading, windbreak requirements).

        Structure the report as a strict JSON matching this schema:
        {{
            "climate_risk_score": 75.0, // Risk percentage out of 100%
            "drought_susceptibility": "Low/Medium/High",
            "vulnerability_factors": ["Major vulnerabilities, e.g., summer water deficit, spring late frost"],
            "climate_trend_analysis": "Interpretation of local climate warming and rain variance patterns",
            "adaptation_pathways": [
                {{
                    "adaptation": "e.g., Shading nets / Agroforestry setup",
                    "mechanism": "How this buffers climate extremes",
                    "implementation_urgency": "Immediate / Mid-Term / Long-Term"
                }}
            ],
            "confidence_score": 0.88
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
                "climate_risk_score": 50.0,
                "drought_susceptibility": "Medium",
                "vulnerability_factors": ["Unstable regional precipitation"],
                "climate_trend_analysis": "Error analyzing seasonal microclimate files.",
                "adaptation_pathways": [{"adaptation": "Adopt conservation buffer zones", "mechanism": "Insulates soil surfaces", "implementation_urgency": "Mid-Term"}],
                "confidence_score": 0.5
            }
        return report
