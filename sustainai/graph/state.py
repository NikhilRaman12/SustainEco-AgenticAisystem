from typing import TypedDict, List, Dict, Any, Optional

class SustainabilityState(TypedDict):
    """
    Complete state dictionary maintained throughout the SustainAI LangGraph workflow.
    Ensures seamless communication, memory consolidation, and structured evaluation.
    """
    user_request: str
    farm_data: Dict[str, Any]
    
    # Analytical outputs from our specialized scientific agents
    soil_results: Optional[Dict[str, Any]]
    climate_results: Optional[Dict[str, Any]]
    water_results: Optional[Dict[str, Any]]
    crop_results: Optional[Dict[str, Any]]
    carbon_results: Optional[Dict[str, Any]]
    biodiversity_results: Optional[Dict[str, Any]]
    research_results: Optional[Dict[str, Any]]
    
    # Internal collaboration variables
    agent_messages: List[Dict[str, Any]]  # Format: {"agent": "SoilAgent", "message": "...", "timestamp": "..."}
    confidence_scores: Dict[str, float]   # Confidence level for each analysis
    critic_feedback: Optional[Dict[str, Any]]  # Scientific audit, conflicts, missing variables
    
    # Client-facing advisor output
    final_recommendation: Optional[Dict[str, Any]]  # Structured roadmap, priority actions, KPI improvements
    
    # Persistent context across execution runs
    memory_context: Dict[str, Any]
