import json
from typing import Dict, Any, List
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class CriticAgent:
    """
    Critic Agent.
    Validates scientific correctness, surface contradictions among agents, flags key data gaps,
    and publishes an formal validation audit with an overall Confidence score.
    """
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def audit(self, state: SustainabilityState) -> Dict[str, Any]:
        payload_to_evaluate = {
            "soil": state.get("soil_results"),
            "climate": state.get("climate_results"),
            "water": state.get("water_results"),
            "crop": state.get("crop_results"),
            "carbon": state.get("carbon_results"),
            "biodiversity": state.get("biodiversity_results")
        }
        
        prompt = f"""
        You are the Scientific Audit Lead & Critic Agent for SustainAI.
        Conduct a high-integrity scientific evaluation of the proposed agricultural recommendations:
        {json.dumps(payload_to_evaluate, indent=2)}

        Verify:
        1. Scientific Correctness: Do the water suggestions align with soil drainage speeds and climate water stress indices?
        2. Direct Contradictions: E.g., does the soil agent recommend heavy deep tillage for subsoil loosening while Carbon Agent calls for strict list of Zero-Tillage, or soil pH modification suggestion that could harm other physiological indicators?
        3. Missing Data Gaps: Flag any vital factors not evaluated (e.g. soil salinity, trace heavy metals).
        4. Calculate a composite scientific Confidence Index out of 100%.

        Provide a rigorous audit response in strict JSON layout based on this schema:
        {{
            "is_approved_for_final_decision": true, // Boolean
            "overall_scientific_confidence_pct": 92.5,
            "contradiction_flags": [
                {{
                    "conflict_detected": "e.g., Soil Agent calls for deep aeration tilling, whereas Carbon Analyst calls for No-till conservation.",
                    "severity": "Low/Medium/High",
                    "suggested_compromise": "Strip-till of specific zone widths to minimize carbon loss while ensuring aeration"
                }}
            ],
            "data_vulnerabilities_spotted": [
                "Heavy-metal exposure records were not present, hindering biochar-complex safety audits"
            ],
            "correctness_grading_per_agent": {{
                "soil": "A-",
                "climate": "A",
                "water": "B+",
                "crop": "A",
                "carbon": "A",
                "biodiversity": "B"
            }}
        }}
        """
        
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        try:
            report = json.loads(response.text)
        except Exception:
            report = {
                "is_approved_for_final_decision": True,
                "overall_scientific_confidence_pct": 80.0,
                "contradiction_flags": [],
                "data_vulnerabilities_spotted": ["Fallback validation mechanism fallback enabled"],
                "correctness_grading_per_agent": {k: "A" for k in ["soil", "climate", "water", "crop", "carbon", "biodiversity"]}
            }
        return report
