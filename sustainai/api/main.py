import os
import uuid
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sustainai.graph.state import SustainabilityState
from sustainai.graph.workflow import SustainAIGraphBuilder
from sustainai.memory.mongo import MongoMemoryManager
from sustainai.evaluation.langsmith_eval import LangSmithSustainAIEvaluator

app = FastAPI(
    title="SustainAI API Gateway",
    description="Production-grade FastAPI system exposing LangGraph orchestration pathways and MCP integration.",
    version="1.0.0"
)

# Initialize resources
API_KEY = os.getenv("GEMINI_API_KEY", "mock_key")
graph_builder = SustainAIGraphBuilder(API_KEY)
compiled_graph = graph_builder.build_graph()
memory = MongoMemoryManager()
evaluator = LangSmithSustainAIEvaluator(API_KEY)

class AssessmentRequest(BaseModel):
    user_request: str
    farm_data: Dict[str, Any]

@app.post("/api/assessment/run", tags=["Assessment"])
async def trigger_sustainability_assessment(payload: AssessmentRequest):
    """
    Triggers the autonomous multi-agent research team workflow.
    Executes the supervisor, parallel analysis threads, validation audits, and advisory syntheses.
    """
    if "mock_key" in API_KEY and not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=400, detail="GEMINI_API_KEY environment variable is missing on this server instance.")
        
    # Setup initial state dictionary
    initial_state: SustainabilityState = {
        "user_request": payload.user_request,
        "farm_data": payload.farm_data,
        "soil_results": None,
        "climate_results": None,
        "water_results": None,
        "crop_results": None,
        "carbon_results": None,
        "biodiversity_results": None,
        "research_results": None,
        "agent_messages": [],
        "confidence_scores": {},
        "critic_feedback": None,
        "final_recommendation": None,
        "memory_context": {"thread_id": str(uuid.uuid4()), "human_authorized": True}
    }
    
    try:
        # Running compilation graph
        final_state = compiled_graph.invoke(initial_state)
        
        # Save run results in persistency container MongoDB
        run_id = memory.save_assessment_run(final_state)
        
        # Trigger evaluators (Accuracy, correctness, collaboration, tools, rec)
        eval_metrics = evaluator.run_evaluators(final_state)
        
        return {
            "run_id": run_id,
            "status": "COMPLETED",
            "evaluated_metrics": eval_metrics,
            "agent_conversations": final_state["agent_messages"],
            "findings": {
                "soil": final_state["soil_results"],
                "climate": final_state["climate_results"],
                "water": final_state["water_results"],
                "crop": final_state["crop_results"],
                "carbon": final_state["carbon_results"],
                "biodiversity": final_state["biodiversity_results"],
                "research": final_state["research_results"]
            },
            "critic": final_state["critic_feedback"],
            "decision_advisor_roadmap": final_state["final_recommendation"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LangGraph execution exception: {str(e)}")

@app.get("/api/history", tags=["History"])
async def fetch_assessment_history():
    """Retrieves list of previously simulated farm logs."""
    # Queries mock adapter or db instance
    return {"history": ["run_01_central_valley", "run_02_vineyard_tuscany"]}
