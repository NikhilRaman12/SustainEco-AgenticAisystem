import logging
from typing import Dict, Any, List
# FastMCP serves as the modern Python API for constructing Model Context Protocol servers
from mcp.server.fastmcp import FastMCP

# Define weather server module
mcp = FastMCP("Weather Server")
logger = logging.getLogger("mcp_weather")

@mcp.tool()
def get_weather(location: str) -> Dict[str, Any]:
    """
    Retrieves current active micro-climatic indicators: temperature, atmospheric pressure, humidity,
    evapotranspiration indexes, and cloud coverage indices.
    """
    logger.info(f"Retrieving current weather for geographic point: {location}")
    # Simulating micro-weather models for dry agricultural land
    if "california" in location.lower() or "valley" in location.lower():
        return {
            "temperature_c": 34.2,
            "humidity_pct": 22.0,
            "et0_evapotranspiration_mm_day": 7.8,
            "wind_speed_kmh": 12.5,
            "uv_index": 9.0,
            "conditions": "Arid, Extreme solar incidence"
        }
    elif "tuscany" in location.lower() or "italy" in location.lower():
        return {
            "temperature_c": 24.5,
            "humidity_pct": 54.0,
            "et0_evapotranspiration_mm_day": 4.1,
            "wind_speed_kmh": 8.0,
            "uv_index": 6.0,
            "conditions": "Moderate Mediterranean"
        }
    # General fallback
    return {
        "temperature_c": 20.0,
        "humidity_pct": 60.0,
        "et0_evapotranspiration_mm_day": 3.5,
        "wind_speed_kmh": 10.0,
        "uv_index": 5.0,
        "conditions": "Temperate overcast"
    }

@mcp.tool()
def get_rainfall_history(location: str, years_back: int = 5) -> List[Dict[str, Any]]:
    """
    Extracts multi-year rain histories, detecting dry spells or monsoon extensions.
    """
    logger.info(f"Extracting precipitation charts for: {location}")
    if "california" in location.lower():
        return [
            {"year": 2021, "annual_precipitation_mm": 280, "deviation_pct": -30},
            {"year": 2022, "annual_precipitation_mm": 310, "deviation_pct": -22},
            {"year": 2023, "annual_precipitation_mm": 480, "deviation_pct": 20}, # Anomalous rain
            {"year": 2024, "annual_precipitation_mm": 265, "deviation_pct": -34},
            {"year": 2025, "annual_precipitation_mm": 220, "deviation_pct": -45}
        ]
    # Standard Mediterranean profile
    return [
        {"year": 2021, "annual_precipitation_mm": 650, "deviation_pct": -5},
        {"year": 2022, "annual_precipitation_mm": 590, "deviation_pct": -14},
        {"year": 2023, "annual_precipitation_mm": 710, "deviation_pct": 4},
        {"year": 2024, "annual_precipitation_mm": 550, "deviation_pct": -20},
        {"year": 2025, "annual_precipitation_mm": 630, "deviation_pct": -8}
    ]

if __name__ == "__main__":
    mcp.run()
