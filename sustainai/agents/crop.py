import json
from typing import Dict, Any
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class CropAgent:
    """
    Plant Pathologist and Crop Health Specialist Agent.
    Assesses crop stress levels, pathogen vulnerabilities, pest exposures, and recommends
    Integrated Pest Management (IPM) models and companion cropping strategies.
    """
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def analyze(self, state: SustainabilityState) -> Dict[str, Any]:
        crop_input = state["farm_data"].get("crop_data", {})
        crop_name = state["farm_data"].get("crop_name", "Unknown Crop")
        
        prompt = f"""
        You are an expert Plant Pathologist and Plant Physiology Specialist.
        Analyze the crop stress factors & biological variables for a crop of '{crop_name}':
        {json.dumps(crop_input, indent=2)}

        Evaluate:
        1. Current disease, pathogen, or insect risks based on environment metrics.
        2. Signs of abiotic stress (salinity, nutrient chlorosis, heat stunting).
        3. Biological crop health scores.
        4. Companion plantings, biological pest treatments, and organic IPM strategies to reduce synthetic chemical load.

        Output must be a strict JSON matching this schema:
        {{
            "crop_health_index": 80.0, // Out of 100
            "observed_abiotic_stresses": ["e.g. nitrogen-linked yellowing, drought wilt"],
            "pathogen_risks": [
                {{
                    "threat": "e.g., Downy Mildew / Fusarium Oxysporum",
                    "severity": "Low/Medium/High",
                    "management": "e.g. localized copper spray, bio-fungicides"
                }}
            ],
            "ipm_practices": ["Organic biological controls recommended"],
            "companion_cropping_suggestions": ["e.g. plant marigolds, intercrop with clover"],
            "confidence_score": 0.85
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
                "crop_health_index": 70.0,
                "observed_abiotic_stresses": ["Nutrient imbalances flagged by soil inputs"],
                "pathogen_risks": [],
                "ipm_practices": ["Establish routine crop monitoring schedules"],
                "companion_cropping_suggestions": [],
                "confidence_score": 0.5
            }
        return report
