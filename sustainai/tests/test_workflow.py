import pytest
from sustainai.graph.state import SustainabilityState
from sustainai.graph.workflow import SustainAIGraphBuilder

def test_state_initialization():
    """Verifies state structures compile properly."""
    state: SustainabilityState = {
        "user_request": "Sustain citrus farm soil quality",
        "farm_data": {"crop_name": "Orange", "location": "Riverside, CA"},
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
        "memory_context": {}
    }
    assert state["user_request"] == "Sustain citrus farm soil quality"
    assert state["soil_results"] is None


def test_graph_compilation():
    """Asserts that state nodes, edge configurations and branches assemble without breaking."""
    gemini_key = "test_key"
    builder = SustainAIGraphBuilder(gemini_key)
    graph = builder.build_graph()
    assert graph is not None
    # Verify nodes are attached correctly
    assert "supervisor" in graph.nodes
    assert "soil" in graph.nodes
    assert "critic" in graph.nodes
    assert "decision" in graph.nodes
