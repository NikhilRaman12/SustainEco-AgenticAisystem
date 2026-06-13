import os
import pymongo
from typing import Dict, Any, List

class MongoMemoryManager:
    """
    Handles connection to the cluster, user profiles fetching, conversational history caching,
    and agent feedback records saving.
    """
    def __init__(self, connection_uri: str = None):
        # Allow falling back to mock driver if MongoDB uri is absent
        self.uri = connection_uri or os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.is_connected = False
        try:
            self.client = pymongo.MongoClient(self.uri, serverSelectionTimeoutMS=1000)
            # Query server to verify state
            self.client.admin.command('ping')
            self.db = self.client["sustainai_db"]
            self.profiles = self.db["farm_profiles"]
            self.runs = self.db["sustainability_runs"]
            self.conversations = self.db["agent_conversations"]
            self.is_connected = True
            print("[MongoMemory] Successfully mounted connection pool to cluster.")
        except Exception:
            print("[MongoMemory] Connection refused. Mounting transient in-memory database adapter instead.")
            self._mock_db_setup()

    def _mock_db_setup(self):
        self._mock_profiles = {}
        self._mock_runs = []
        self._mock_convs = []

    def get_farm_profile(self, farm_id: str) -> Dict[str, Any]:
        """Loads physical profile variables of a given farm."""
        if self.is_connected:
            return self.profiles.find_one({"farm_id": farm_id}) or {}
        return self._mock_profiles.get(farm_id, {})

    def save_assessment_run(self, run_doc: Dict[str, Any]) -> str:
        """Stores the agent state diagnostics."""
        if self.is_connected:
            res = self.runs.insert_one(run_doc)
            return str(res.inserted_id)
        self._mock_runs.append(run_doc)
        return f"mock_run_{len(self._mock_runs)}"

    def cache_agent_conversation(self, thread_id: str, messages: List[Dict[str, Any]]):
        """Retains agent-to-agent collaborative discussion files."""
        if self.is_connected:
            self.conversations.update_one(
                {"thread_id": thread_id},
                {"$set": {"messages": messages}},
                upsert=True
            )
        else:
            self._mock_convs.append({"thread_id": thread_id, "messages": messages})
