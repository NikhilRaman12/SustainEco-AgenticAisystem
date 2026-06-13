import json
from typing import Dict, Any
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class BiodiversityAgent:
    """
    Ecologist Agent.
    Evaluates landscape connectivity, beneficial insect species indices, pollinator habitats,
    monoculture hazards, and provides rewilding proposals.
    """
    def __init__(self, api_key: str):
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def analyze(self, state: SustainabilityState) -> Dict[str, Any]:
        biodiversity_inputs = state["farm_data"].get("biodiversity_data", {})
        
        prompt = f"""
        You are a distinguished Agro-Ecologist and Biodiversity Scientist.
        Examine the ecological markers for this farm:
        {json.dumps(biodiversity_inputs, indent=2)}

        Analyze:
        1. Species diversity indices and risks associated with intensive monocropping.
        2. Presence of native pollinator habitat corridors and beneficial predator insects.
        3. Landscape-level ecological connectivity (hedgerows, buffer strips, woodland borders).
        4. Rewilding actions (nest boxes, insectary strips, native tree planting, beetle banks).

        Create a JSON payload structure fitting this schema:
        {{
            "biodiversity_score": 62.0, // out of 100
            "threats_to_beneficial_species": ["Monoculture canopy limit, excessive insecticide drift"],
            "woodland_corridors_pct": 5.2, // Percent landscape cover
            "pollinator_rating": "Poor/Adequate/Rich",
            "findings": "Discussion on bio-complexity metrics and natural predator pest suppressing rates",
            "rewilding_actions": [
                {{
                    "project": "e.g., Planting wildflower insectary strips along irrigation margins",
                    "beneficials_supported": ["Wild solitary bees, hoverflies, predatory wasps"],
                    "threat_mitigation_rating": "Replaces systemic reliance on chemical insecticides by 40%"
                }}
            ],
            "confidence_score": 0.86
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
                "biodiversity_score": 50.0,
                "threats_to_beneficial_species": ["Intense herbicide applications observed"],
                "woodland_corridors_pct": 3.0,
                "pollinator_rating": "Adequate",
                "findings": "Agro-ecological corridor mapping failed to execute.",
                "rewilding_actions": [{"project": "Construct hedgerow borders", "beneficials_supported": ["Ladybugs, lacewings"], "threat_mitigation_rating": "Medium"}],
                "confidence_score": 0.5
            }
        return report
