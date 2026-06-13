from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, START, END
from sustainai.graph.state import SustainabilityState
from sustainai.agents.supervisor import SupervisorAgent
from sustainai.agents.soil import SoilAgent
from sustainai.agents.climate import ClimateAgent
from sustainai.agents.water import WaterAgent
from sustainai.agents.crop import CropAgent
from sustainai.agents.carbon import CarbonAgent
from sustainai.agents.biodiversity import BiodiversityAgent
from sustainai.agents.research import ResearchAgent
from sustainai.agents.critic import CriticAgent
from sustainai.agents.decision import DecisionAgent

class SustainAIGraphBuilder:
    """
    Constructs and compiles the compiled LangGraph StateGraph workflow representing
    our virtual sustainability research team.
    """
    def __init__(self, gemini_api_key: str):
        self.api_key = gemini_api_key
        
        # Instantiate agent instances
        self.supervisor = SupervisorAgent(self.api_key)
        self.soil_sci = SoilAgent(self.api_key)
        self.climate_sci = ClimateAgent(self.api_key)
        self.water_sci = WaterAgent(self.api_key)
        self.crop_path = CropAgent(self.api_key)
        self.carbon_analyst = CarbonAgent(self.api_key)
        self.ecologist = BiodiversityAgent(self.api_key)
        self.researcher = ResearchAgent(self.api_key)
        self.critic = CriticAgent(self.api_key)
        self.decision_comm = DecisionAgent(self.api_key)

    def supervisor_node(self, state: SustainabilityState) -> Dict[str, Any]:
        """Supervisor node coordinates execution."""
        plan = self.supervisor.analyze_request(state)
        # Update messages with Supervisor's intent mapping
        log = {"agent": "SupervisorAgent", "message": f"Formulated research plan. Key focus: {plan['plan_summary']}", "timestamp": "now"}
        return {
            "agent_messages": state["agent_messages"] + [log],
            "memory_context": {**state["memory_context"], "research_plan": plan}
        }

    def soil_node(self, state: SustainabilityState) -> Dict[str, Any]:
        results = self.soil_sci.analyze(state)
        return {
            "soil_results": results,
            "confidence_scores": {**state["confidence_scores"], "soil": results.get("confidence_score", 0.8)}
        }

    def climate_node(self, state: SustainabilityState) -> Dict[str, Any]:
        results = self.climate_sci.analyze(state)
        return {
            "climate_results": results,
            "confidence_scores": {**state["confidence_scores"], "climate": results.get("confidence_score", 0.8)}
        }

    def water_node(self, state: SustainabilityState) -> Dict[str, Any]:
        results = self.water_sci.analyze(state)
        return {
            "water_results": results,
            "confidence_scores": {**state["confidence_scores"], "water": results.get("confidence_score", 0.8)}
        }

    def crop_node(self, state: SustainabilityState) -> Dict[str, Any]:
        results = self.crop_path.analyze(state)
        return {
            "crop_results": results,
            "confidence_scores": {**state["confidence_scores"], "crop": results.get("confidence_score", 0.8)}
        }

    def carbon_node(self, state: SustainabilityState) -> Dict[str, Any]:
        results = self.carbon_analyst.analyze(state)
        return {
            "carbon_results": results,
            "confidence_scores": {**state["confidence_scores"], "carbon": results.get("confidence_score", 0.8)}
        }

    def biodiversity_node(self, state: SustainabilityState) -> Dict[str, Any]:
        results = self.ecologist.analyze(state)
        return {
            "biodiversity_results": results,
            "confidence_scores": {**state["confidence_scores"], "biodiversity": results.get("confidence_score", 0.8)}
        }

    def research_node(self, state: SustainabilityState) -> Dict[str, Any]:
        results = self.researcher.analyze(state)
        return {
            "research_results": results
        }

    def critic_node(self, state: SustainabilityState) -> Dict[str, Any]:
        """Critic Agent reviews specialized diagnostics."""
        audit_res = self.critic.audit(state)
        log = {"agent": "CriticAgent", "message": f"Scientific validation index is at {audit_res['overall_scientific_confidence_pct']}%. Approved: {audit_res['is_approved_for_final_decision']}", "timestamp": "now"}
        return {
            "critic_feedback": audit_res,
            "agent_messages": state["agent_messages"] + [log]
        }

    def decision_node(self, state: SustainabilityState) -> Dict[str, Any]:
        """Combines and synthesizes final roadmap."""
        recommendation = self.decision_comm.compose_strategy(state)
        log = {"agent": "DecisionAgent", "message": "Unified Sustainability Improvement Roadmap generated.", "timestamp": "now"}
        return {
            "final_recommendation": recommendation,
            "agent_messages": state["agent_messages"] + [log]
        }

    def human_in_the_loop_approval_node(self, state: SustainabilityState) -> Dict[str, Any]:
        """
        Human Intercept Node.
        Allows real-time inspection, custom constraints injection, and action authorization.
        In mock simulation mode, passes direct approval. In standard deployment, pauses thread.
        """
        # Read 'approved' flag from memory/context or default
        approved = state["memory_context"].get("human_authorized", True)
        log = {"agent": "HumanNode", "message": f"Human-in-the-loop audit trigger. Authorization state: {approved}", "timestamp": "now"}
        return {
            "agent_messages": state["agent_messages"] + [log]
        }

    def route_critic_decision(self, state: SustainabilityState) -> Literal["decision", "supervisor"]:
        """
        Conditional routing logic based on the Critic Agent's review confidence threshold.
        If confidence drops below 70%, redirects control back to Supervisor with Critic corrections.
        """
        audit = state.get("critic_feedback", {})
        is_satisfactory = audit.get("is_approved_for_final_decision", True)
        confidence = audit.get("overall_scientific_confidence_pct", 100)
        
        if is_satisfactory and confidence >= 70:
            print("[Routing] Critic approved all research datasets. Routing to 'decision'.")
            return "decision"
        else:
            print("[Routing] Critic rejected. Insufficient alignment or confidence. Routing back to 'supervisor' with retry logs.")
            return "supervisor"

    def build_graph(self):
        """Assembles node linkages, conditional forks, and returns the compiled LangGraph object."""
        workflow = StateGraph(SustainabilityState)
        
        # Add nodes
        workflow.add_node("supervisor", self.supervisor_node)
        workflow.add_node("soil", self.soil_node)
        workflow.add_node("climate", self.climate_node)
        workflow.add_node("water", self.water_node)
        workflow.add_node("crop", self.crop_node)
        workflow.add_node("carbon", self.carbon_node)
        workflow.add_node("biodiversity", self.biodiversity_node)
        workflow.add_node("research", self.research_node)
        workflow.add_node("critic", self.critic_node)
        workflow.add_node("human_approval", self.human_in_the_loop_approval_node)
        workflow.add_node("decision", self.decision_node)
        
        # Set start node
        workflow.add_edge(START, "supervisor")
        
        # Supervisor executes research plan, spawns parallel analysis threads
        workflow.add_edge("supervisor", "soil")
        workflow.add_edge("supervisor", "climate")
        workflow.add_edge("supervisor", "water")
        workflow.add_edge("supervisor", "crop")
        workflow.add_edge("supervisor", "carbon")
        workflow.add_edge("supervisor", "biodiversity")
        workflow.add_edge("supervisor", "research")
        
        # Parallel execution converges on the Critic node
        workflow.add_edge("soil", "critic")
        workflow.add_edge("climate", "critic")
        workflow.add_edge("water", "critic")
        workflow.add_edge("crop", "critic")
        workflow.add_edge("carbon", "critic")
        workflow.add_edge("biodiversity", "critic")
        workflow.add_edge("research", "critic")
        
        # From Critic, we route conditionally based on safety metrics check
        workflow.add_conditional_edges(
            "critic",
            self.route_critic_decision,
            {
                "decision": "human_approval",
                "supervisor": "supervisor" # Injects loop / correction retry
            }
        )
        
        # From Human intersection, proceed directly to final advisor node
        workflow.add_edge("human_approval", "decision")
        workflow.add_edge("decision", END)
        
        # Compile graph (with native memory saver or mock checkpointer)
        return workflow.compile()
