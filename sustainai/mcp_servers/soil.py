from typing import Dict, Any
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Soil Server")

@mcp.tool()
def analyze_soil(ph_reading: float, organic_matter_pct: float, nitrogen_ppm: float, phosphorus_ppm: float, potassium_ppm: float) -> Dict[str, Any]:
    """
    Simulates laboratory soil chemistry test interpretation.
    Returns calculated biological health indicators, nitrogen lockouts or salinization levels.
    """
    warnings = []
    recs = []
    
    # pH triggers
    if ph_reading < 5.5:
        warnings.append("High Soil Acidity Risk: Aluminum toxicity likely. Key nutrients locked.")
        recs.append("Apply agricultural lime (calcium carbonate) at 2-3 tons per acre to buffer pH.")
    elif ph_reading > 8.0:
        warnings.append("Alkaline Soil Stress: Iron, Zinc and Manganese availability severely inhibited.")
        recs.append("Incorporate elemental sulfur or organic composts to gradually acidify rhizosphere.")
        
    # Organic matter buffers
    if organic_matter_pct < 1.5:
        warnings.append("Organic Matter Deficit: Severe microbial attrition. Soil unstable, low water retention.")
        recs.append("Incorporate multi-species green manure crops and multi-layered organic compost.")
    elif organic_matter_pct >= 4.0:
        recs.append("Soil Organic Carbon exceeds threshold. Continue low-till preservation.")
        
    # N-P-K balances
    if nitrogen_ppm < 15.0:
        warnings.append("Nitrogen depletion: Abiotic stunt risks.")
        recs.append("Interplant nitrogen-fixing cover crops (crimson clover, vetch).")
    if phosphorus_ppm < 10.0:
        warnings.append("Phosphorus deficit: Impairs root structural vigor.")
        recs.append("Apply mycorrhizal inoculants to access locked rock phosphate pool.")
        
    score = 100.0 - (len(warnings) * 15.0)
    score = max(30.0, score)
    
    return {
        "calculated_soil_score": score,
        "warnings": warnings,
        "recommended_mcp_soil_practices": recs,
        "microbial_active_index": "Excellent (>8.5)" if organic_matter_pct >= 3.0 else "Struggling (<4.0)",
        "salinity_hazard_electric_conductivity_ds_m": 0.45 if ph_reading < 7.8 else 2.1
    }

if __name__ == "__main__":
    mcp.run()
