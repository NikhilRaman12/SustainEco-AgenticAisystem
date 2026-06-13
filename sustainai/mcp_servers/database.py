import time
from typing import Dict, Any, List
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Database Server")

# Simulated active database store (In-memory representation of MongoDB)
SIMULATED_MONGO_COLLECTION: List[Dict[str, Any]] = [
    {
        "id": "run_01_central_valley",
        "timestamp": time.time() - 86400,
        "farm_profile_name": "Valle Verde Tomato Farm",
        "location": "Fresno county, Central Valley, California",
        "sustainability_grade": "B",
        "recommendations_count": 4
    },
    {
         "id": "run_02_vineyard_tuscany",
         "timestamp": time.time() - 3600 * 12,
         "farm_profile_name": "Poggio d'Oro Chianti Vineyard",
         "location": "Siena, Tuscany, Italy",
         "sustainability_grade": "A-",
         "recommendations_count": 5
    }
]

@mcp.tool()
def store_results(farm_profile_name: str, location: str, metrics: Dict[str, Any]) -> str:
    """
    Stores an compiled sustainability assessment run record inside the MongoDB storage instance.
    Returns status confirmation and unique record ID.
    """
    record_id = f"run_{int(time.time())}_{farm_profile_name.lower().replace(' ', '_')[:10]}"
    new_doc = {
        "id": record_id,
        "timestamp": time.time(),
        "farm_profile_name": farm_profile_name,
        "location": location,
        "metrics": metrics,
        "sustainability_grade": "A" if metrics.get("composite_score", 100) > 85 else "B"
    }
    SIMULATED_MONGO_COLLECTION.append(new_doc)
    return f"SUCCEED: Record compiled securely inserted as MongoDB document ID: {record_id}."

@mcp.tool()
def retrieve_history() -> List[Dict[str, Any]]:
    """
    Queries history files and fetches previous farm profiles and sustainability roadmaps.
    """
    return SIMULATED_MONGO_COLLECTION

if __name__ == "__main__":
    mcp.run()
