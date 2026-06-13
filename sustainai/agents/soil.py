import json
from typing import Dict, Any
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class SoilAgent:
    """
    Soil Scientist Agent.
    Analyzes physical, chemical, and biological layers of the soil.
    Incorporate tools to calculate organic carbon trends and suggest corrective actions.
    """
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def analyze(self, state: SustainabilityState) -> Dict[str, Any]:
        soil_input = state["farm_data"].get("soil_data", {})
        location = state["farm_data"].get("location", "Unknown Location")
        
        prompt = f"""
        You are a highly acclaimed Soil Scientist and Agronomist. 
        Your task is to analyze the following soil diagnostic metrics for a farm in {location}:
        {json.dumps(soil_input, indent=2)}

        Analyze:
        1. Soil pH levels and potential nutrient lockouts.
        2. Soil Organic Carbon (SOC) and its implications for soil structure, water holding, and biology.
        3. Primary (N-P-K) and secondary nutrient balances.
        4. Microbial active scoring & biological soil degradation warning indicators.
        5. Actionable restoration techniques (e.g., biochar, cover cropping, minimum tillage).

        Consult the simulated Soil MCP server outputs where:
        - pH < 5.8: high aluminum/manganese toxicity risk, low phosphorus availability
        - SOC < 1.5%: severely depleted, poor biology
        - Nutrient N-P-K balances compared to optimal standards

        Prepare a strict soil diagnostics scientific report with the following JSON schema:
        {{
            "soil_health_score": 85.0, // Float out of 100
            "primary_deficiencies": ["List of nutrient or property deficiencies"],
            "degradation_risk": "Low/Medium/High",
            "microbial_activity_status": "Status of soil microbiology based on organic carbon",
            "detailed_findings": "Comprehensive scientific explanation of soil chemical/physical states",
            "recommendations": [
                {{
                    "practice": "e.g., Cover cropping with legumes",
                    "scientific_rationale": "Why this fixes the specific deficiency",
                    "expected_kpi_impact": "e.g., +0.3% Soil Organic Carbon in 2 seasons"
                }}
            ],
            "confidence_score": 0.92 // Out of 1.0
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
                "soil_health_score": 60.0,
                "primary_deficiencies": ["Unknown soil parameters"],
                "degradation_risk": "Medium",
                "microbial_activity_status": "Insufficient data to index microbial activity",
                "detailed_findings": "Failed to parse soil report structure",
                "recommendations": [{"practice": "Verify basic soil profile properties", "scientific_rationale": "Establish correct baseline", "expected_kpi_impact": "Establishes accurate intervention map"}],
                "confidence_score": 0.5
            }
        return report
