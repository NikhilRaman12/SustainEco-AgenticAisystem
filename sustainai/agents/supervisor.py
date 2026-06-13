import json
from typing import Dict, Any, List
from google import genai
from google.genai import types
from sustainai.graph.state import SustainabilityState

class SupervisorAgent:
    """
    Chief Sustainability Intelligence Agent.
    Coordinates the work of the specialized agents, assigns tasks, processes user intent,
    and resolves conflicts between specialized recommendations.
    """
    def __init__(self, api_key: str):
        # Initialize Google GenAI client (following @google/genai guidelines)
        self.client = genai.Client(
            api_key=api_key,
            http_options={"headers": {"User-Agent": "aistudio-build"}}
        )
        self.model_name = "gemini-3.5-flash"

    def analyze_request(self, state: SustainabilityState) -> Dict[str, Any]:
        """
        Interprets user intent, parses the farm data, and plans the workflow distribution.
        """
        prompt = f"""
        You are the Chief Sustainability Intelligence Agent (Supervisor) for SustainAI.
        Your goal is to coordinate a highly specialised scientific research team consisting of:
        1. Soil Scientist (analyze pH, organic carbon, microbial active score, nutrients, degradation)
        2. Climate Scientist (analyze temperature trends, rainfall variability, climate risk)
        3. Water Resource Scientist (analyze irrigation efficiency, water stress, consumption metrics)
        4. Plant Pathologist (analyze crop diseases, pathogens, biological stress flags)
        5. Carbon Footprint Analyst (calculate carbon balances, offset pathways, greenhouse gas reduction)
        6. Ecologist (analyze biodiversity corridors, species index, pollinator support)
        7. Scientific Literature Researches (search agricultural literature & peer-reviewed research matches)

        Target Farm Profile:
        {json.dumps(state["farm_data"], indent=2)}

        User Directives:
        "{state["user_request"]}"

        Create a comprehensive research blueprint outlining which specialized focus areas are most critical 
        for this specific farm, what conflicts they must coordinate on, and specific parameters they must look for.
        Return your analysis in strict JSON format matching this schema:
        {{
            "plan_summary": "High-level research plan",
            "priority_focus": ["Soil", "Climate", etc],
            "agent_assignments": {{
                "soil": "Specific parameters of interest based on the farm location/data",
                "climate": "Specific regional climate features to verify",
                "water": "Irrigation system optimization parameters",
                "crop": "Risk profiles to evaluate",
                "carbon": "Specific emissions baselines to check",
                "biodiversity": "Ecological assets or deficits",
                "research": "Topics/concepts that require scientific database grounding"
            }},
            "coordination_instructions": "Guidelines for resolving conflicts (e.g. soil vs water, crop vs soil carbon)"
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
            plan = json.loads(response.text)
        except Exception:
            # Fallback in case of parse issues
            plan = {
                "plan_summary": "Standard agricultural ecosystem evaluation.",
                "priority_focus": ["soil", "water", "climate", "crop", "carbon", "biodiversity"],
                "agent_assignments": {k: "Standard diagnostic run" for k in ["soil", "climate", "water", "crop", "carbon", "biodiversity", "research"]},
                "coordination_instructions": "Ensure carbon sequestration doesn't conflict with irrigation requirements."
            }
            
        print("[SupervisorAgent] Research plan formulated successfully.")
        return plan
