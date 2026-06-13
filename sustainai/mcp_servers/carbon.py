from typing import Dict, Any
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Carbon Server")

@mcp.tool()
def calculate_carbon(tillage_frequency_yr: int, diesel_liters_used_yr: float, synthetic_n_kg_yr: float, acreage: float) -> Dict[str, Any]:
    """
    Computes greenhouse gas emission outputs and sequestration potential pathways.
    Inputs correspond directly to common agricultural field variables.
    """
    # Industry emission factors
    # 1 L Diesel ~ 2.68 kg CO2
    # 1 kg Synthetic Nitrogen ~ 8.0 kg CO2e (due to production and severe soil nitrous oxide emissions)
    # Conventional tillage releases ~350 kg CO2 per acre per year via organic matter oxidation
    
    fuel_gases = (diesel_liters_used_yr * 2.68) / 1000.0  # tCO2e
    fertilizer_gases = (synthetic_n_kg_yr * 8.0) / 1000.0  # tCO2e
    tillage_gases = (tillage_frequency_yr * 350.0 * acreage) / 1000.0  # tCO2e
    
    total_emissions = fuel_gases + fertilizer_gases + tillage_gases
    
    # Sequestration potential via conservation tillage (+0.5 tCO2e/acre/yr) and biochar addition (+1.2 tCO2e/acre/yr)
    no_till_saving = 0.5 * acreage if tillage_frequency_yr == 0 else 0.0
    cover_crop_drawdown = 0.6 * acreage  # tCO2e/yr sequestered
    
    potential_savings = no_till_saving + cover_crop_drawdown
    
    return {
        "annual_operational_emissions_tco2e": round(total_emissions, 2),
        "emissions_intensities": {
            "tractor_diesel_tco2e": round(fuel_gases, 2),
            "fertilizer_n2o_tco2e": round(fertilizer_gases, 2),
            "tillage_mineral_loss_tco2e": round(tillage_gases, 2)
        },
        "potential_annual_carbon_sinks_tco2e": round(potential_savings, 2),
        "sequestration_eligibility": {
            "eligible_for_offset_issuance": total_emissions > potential_savings and tillage_frequency_yr <= 1,
            "recommended_offset_program": "Verra VM0042 Soil Carbon Sequestration Framework"
        }
    }

if __name__ == "__main__":
    mcp.run()
