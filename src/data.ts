import { FarmData } from "./types";

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  data: FarmData;
}

export const BLUEPRINTS: Blueprint[] = [
  {
    id: "ca_tomato",
    name: "Enterprise Farm Facility (Valle Verde)",
    description: "Multi-acre crop block in Fresno County facing critical aquifer depletion & soil carbon degradation.",
    data: {
      farm_name: "Valle Verde Agricultural Hub",
      location: "Fresno, Central Valley, California",
      crop_name: "Processing Tomatoes & Almonds",
      soil_data: {
        ph: 7.9,
        organic_matter_pct: 1.1, // Depleted carbon
        nitrogen_ppm: 12,
        phosphorus_ppm: 8,
        potassium_ppm: 140
      },
      climate_data: {
        annual_temp_c: 18.5,
        annual_precip_mm: 280, // Arid
        drought_risk_rating: "Critical"
      },
      water_data: {
        irrigation_type: "Overhead Sprinkler", // Inefficient
        annual_consumption_m3: 45000,
        source: "Deep Aquifer Well"
      },
      crop_data: {
        observed_abiotic_stresses: ["Leaf roll under mid-afternoon heat", "High sodium soil yellowing"],
        observed_pathogens: ["Fusarium Wilt Susceptibility", "Curly Top Virus threats"]
      },
      carbon_inputs: {
        tillage_frequency_yr: 3, // High tillage
        diesel_liters_used_yr: 3200,
        synthetic_nitrogen_kg_yr: 4800, // Heavy chemical load
        acreage: 120
      },
      biodiversity_data: {
        has_wildlife_corridors: false,
        native_vegetation_pct: 2.1 // Monoculture
      }
    }
  },
  {
    id: "chemical_remediation",
    name: "Industrial Soil & Chemical Buffer Zone",
    description: "Petrochemical plant buffer site targeting heavy-metal soil remediation, carbon sinks, and perimeter run-off filtration.",
    data: {
      farm_name: "Rhineland Bio-Remediation Perimeter",
      location: "Leverkusen Industrial Zone, Germany",
      crop_name: "Remediacre Bio-Phytoremediation Cover",
      soil_data: {
        ph: 5.8,
        organic_matter_pct: 1.5, // Severely structured
        nitrogen_ppm: 25,
        phosphorus_ppm: 14,
        potassium_ppm: 95
      },
      climate_data: {
        annual_temp_c: 10.2,
        annual_precip_mm: 820,
        drought_risk_rating: "Low"
      },
      water_data: {
        irrigation_type: "Sump Runoff Capture & Recirculation",
        annual_consumption_m3: 15000,
        source: "Industrial Sump / Captured Precipitation"
      },
      crop_data: {
        observed_abiotic_stresses: ["Heavy clay consolidation", "Root chemical stress due to historic sulfate levels"],
        observed_pathogens: ["Mycorrhizal suppression from chemical stabilizers", "Rhizosphere oxygen deprivation"]
      },
      carbon_inputs: {
        tillage_frequency_yr: 0, // No-till buffer
        diesel_liters_used_yr: 820,
        synthetic_nitrogen_kg_yr: 0, // No synthetic chemistry
        acreage: 45
      },
      biodiversity_data: {
        has_wildlife_corridors: true,
        native_vegetation_pct: 14.5 // Managed wooded fence lines
      }
    }
  },
  {
    id: "thermal_watershed",
    name: "Thermal Power Watershed & Discharge Basin",
    description: "Thermal cooling water discharge zone needing riparian protection, heat-load buffer marshes, and terrestrial grasslands.",
    data: {
      farm_name: "Ohio River Power Water Reserve",
      location: "Pomeroy Station Basin, Ohio, US",
      crop_name: "Riparian Vetiver & Reed Grassland Buffer",
      soil_data: {
        ph: 6.8,
        organic_matter_pct: 2.8,
        nitrogen_ppm: 19,
        phosphorus_ppm: 35, // High due to river fertilizer loads
        potassium_ppm: 120
      },
      climate_data: {
        annual_temp_c: 12.1,
        annual_precip_mm: 1040,
        drought_risk_rating: "Low"
      },
      water_data: {
        irrigation_type: "Fluvial Flooding & Cooling Outflow",
        annual_consumption_m3: 310000, // River-scale loops
        source: "Thermal Discharge Channel / River Bed"
      },
      crop_data: {
        observed_abiotic_stresses: ["Sustained thermal thermal-shock in roots", "Saturated hypoxic soil zones"],
        observed_pathogens: ["Cyanobacteria/Algal proliferation in stagnation pockets", "Root-rot oomycete hazards"]
      },
      carbon_inputs: {
        tillage_frequency_yr: 0,
        diesel_liters_used_yr: 480,
        synthetic_nitrogen_kg_yr: 0,
        acreage: 180
      },
      biodiversity_data: {
        has_wildlife_corridors: true,
        native_vegetation_pct: 35.0 // Buffer marshland focus
      }
    }
  },
  {
    id: "grassland_reserve",
    name: "Eurasian Grassland & Terrestrial Biodiversity Park",
    description: "Large-scale semi-arid restorative grassland reserve focused on wildlife corridor extensions and soil carbon sinking.",
    data: {
      farm_name: "Altai-Sayan Foothill Reserve",
      location: "East Kazakhstan Steppe",
      crop_name: "Multi-species Native Fescue & Deep-rooted Perennials",
      soil_data: {
        ph: 7.4,
        organic_matter_pct: 1.8, // Historically overgrazed
        nitrogen_ppm: 8,
        phosphorus_ppm: 12,
        potassium_ppm: 180
      },
      climate_data: {
        annual_temp_c: 4.5,
        annual_precip_mm: 310,
        drought_risk_rating: "High"
      },
      water_data: {
        irrigation_type: "Passive Rain-fed & Snowmelt Swales",
        annual_consumption_m3: 0,
        source: "Atmospheric snowmelt & runoff swales"
      },
      crop_data: {
        observed_abiotic_stresses: ["Severe spring desiccating winds", "Root freeze damage"],
        observed_pathogens: ["Fungal localized leaf blight", "Rodent-borne root pruning"]
      },
      carbon_inputs: {
        tillage_frequency_yr: 0, // Natural dry pasture
        diesel_liters_used_yr: 150, // Minimal vehicle patrolling
        synthetic_nitrogen_kg_yr: 0,
        acreage: 2400 // Large scale nature reserve
      },
      biodiversity_data: {
        has_wildlife_corridors: true,
        native_vegetation_pct: 82.0 // Primary prairie
      }
    }
  }
];
