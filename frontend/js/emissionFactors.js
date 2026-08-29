/**
 * Centralized Emission Factor Database
 * Standards derived from IPCC, EPA, DEFRA, and Our World in Data.
 * Each factor contains unique ID, category, unit, factor (kg CO2e per unit), and source reference.
 */
export const EMISSION_FACTORS = [
  // --- TRANSPORTATION ---
  {
    id: "ef_trans_car_petrol",
    category: "transportation",
    activityType: "Car (Petrol / Gasoline)",
    unit: "km",
    emissionFactor: 0.21,
    source: "DEFRA 2023 / EPA",
    region: "Global Average",
    description: "Standard gasoline passenger car"
  },
  {
    id: "ef_trans_car_diesel",
    category: "transportation",
    activityType: "Car (Diesel)",
    unit: "km",
    emissionFactor: 0.18,
    source: "DEFRA 2023",
    region: "Global Average",
    description: "Standard diesel passenger vehicle"
  },
  {
    id: "ef_trans_car_ev",
    category: "transportation",
    activityType: "Electric Vehicle (EV)",
    unit: "km",
    emissionFactor: 0.05,
    source: "IEA Grid Avg",
    region: "Global Average",
    description: "Grid-charged battery electric car"
  },
  {
    id: "ef_trans_bus",
    category: "transportation",
    activityType: "City Bus / Public Transit",
    unit: "km",
    emissionFactor: 0.08,
    source: "EPA Transit",
    region: "Global Average",
    description: "Average municipal bus per passenger-km"
  },
  {
    id: "ef_trans_train",
    category: "transportation",
    activityType: "Train / Metro / Subway",
    unit: "km",
    emissionFactor: 0.04,
    source: "DEFRA Rail",
    region: "Global Average",
    description: "Electric or high-speed rail per passenger-km"
  },
  {
    id: "ef_trans_flight_domestic",
    category: "transportation",
    activityType: "Flight (Short Haul / Domestic)",
    unit: "km",
    emissionFactor: 0.25,
    source: "ICAO / DEFRA",
    region: "Global",
    description: "Domestic flights with radiative forcing factor"
  },
  {
    id: "ef_trans_flight_long",
    category: "transportation",
    activityType: "Flight (Long Haul)",
    unit: "km",
    emissionFactor: 0.15,
    source: "ICAO / DEFRA",
    region: "Global",
    description: "International long-haul flights (>3700 km)"
  },
  {
    id: "ef_trans_motorbike",
    category: "transportation",
    activityType: "Motorcycle / Scooter",
    unit: "km",
    emissionFactor: 0.11,
    source: "DEFRA 2023",
    region: "Global Average",
    description: "Standard combustion motorcycle"
  },

  // --- ENERGY ---
  {
    id: "ef_energy_grid",
    category: "energy",
    activityType: "Grid Electricity",
    unit: "kWh",
    emissionFactor: 0.42,
    source: "EIA / IEA",
    region: "Average Mixed Grid",
    description: "Residential grid electricity consumption"
  },
  {
    id: "ef_energy_gas",
    category: "energy",
    activityType: "Natural Gas (Heating / Cooking)",
    unit: "kWh",
    emissionFactor: 0.20,
    source: "EPA GHG Factors",
    region: "Global Average",
    description: "Residential pipeline natural gas combustion"
  },
  {
    id: "ef_energy_heating_oil",
    category: "energy",
    activityType: "Heating Oil",
    unit: "liters",
    emissionFactor: 2.70,
    source: "DEFRA Fuel",
    region: "Global Average",
    description: "Fuel oil burned for domestic space heating"
  },
  {
    id: "ef_energy_solar",
    category: "energy",
    activityType: "Rooftop Solar",
    unit: "kWh",
    emissionFactor: 0.02,
    source: "NREL Lifecycle",
    region: "Global",
    description: "Lifecycle embodied carbon for solar energy"
  },

  // --- FOOD ---
  {
    id: "ef_food_beef",
    category: "food",
    activityType: "Beef Meal",
    unit: "meals",
    emissionFactor: 6.50,
    source: "Poore & Nemecek (Science)",
    region: "Global",
    description: "Average meal with red beef protein portion"
  },
  {
    id: "ef_food_chicken",
    category: "food",
    activityType: "Poultry / Chicken Meal",
    unit: "meals",
    emissionFactor: 1.80,
    source: "Our World in Data",
    region: "Global",
    description: "Meal with chicken or turkey portion"
  },
  {
    id: "ef_food_pork",
    category: "food",
    activityType: "Pork Meal",
    unit: "meals",
    emissionFactor: 2.20,
    source: "Our World in Data",
    region: "Global",
    description: "Meal containing pork or bacon"
  },
  {
    id: "ef_food_vegetarian",
    category: "food",
    activityType: "Vegetarian Meal (Eggs/Dairy)",
    unit: "meals",
    emissionFactor: 0.90,
    source: "Oxford Food Study",
    region: "Global",
    description: "Plant-based meal including dairy or eggs"
  },
  {
    id: "ef_food_vegan",
    category: "food",
    activityType: "100% Plant-Based / Vegan Meal",
    unit: "meals",
    emissionFactor: 0.50,
    source: "Oxford Food Study",
    region: "Global",
    description: "Entirely plant-sourced meal"
  },
  {
    id: "ef_food_dairy_milk",
    category: "food",
    activityType: "Dairy Milk",
    unit: "liters",
    emissionFactor: 1.20,
    source: "Poore & Nemecek",
    region: "Global",
    description: "Fresh cows milk"
  },

  // --- WATER ---
  {
    id: "ef_water_shower",
    category: "water",
    activityType: "Hot Shower (8-10 mins)",
    unit: "showers",
    emissionFactor: 0.85,
    source: "Waterwise / Carbon Trust",
    region: "Global Average",
    description: "Heated water energy & treatment impact"
  },
  {
    id: "ef_water_tap",
    category: "water",
    activityType: "Tap Water Supply",
    unit: "liters",
    emissionFactor: 0.0003,
    source: "UK Water Industry",
    region: "Municipal",
    description: "Pumping, treatment, and distribution"
  },
  {
    id: "ef_water_bottled",
    category: "water",
    activityType: "Bottled Water (Plastic 500ml)",
    unit: "bottles",
    emissionFactor: 0.16,
    source: "Beverage Council",
    region: "Global",
    description: "PET bottle manufacturing, transport & cooling"
  },

  // --- SHOPPING & PURCHASES ---
  {
    id: "ef_shop_clothing",
    category: "shopping",
    activityType: "Clothing / Apparel Item",
    unit: "items",
    emissionFactor: 8.50,
    source: "WRAP UK / Textile Exchange",
    region: "Global",
    description: "Average garment lifecycle (cotton/synthetic mix)"
  },
  {
    id: "ef_shop_smartphone",
    category: "shopping",
    activityType: "New Smartphone",
    unit: "units",
    emissionFactor: 60.00,
    source: "Apple / Fairphone Environmental Reports",
    region: "Global",
    description: "Embodied manufacturing & supply chain footprint"
  },
  {
    id: "ef_shop_laptop",
    category: "shopping",
    activityType: "New Laptop Computer",
    unit: "units",
    emissionFactor: 200.00,
    source: "Dell / HP Carbon Disclosures",
    region: "Global",
    description: "Semiconductor, chassis, and transport footprint"
  },
  {
    id: "ef_shop_general",
    category: "shopping",
    activityType: "General Household Consumer Goods",
    unit: "kg",
    emissionFactor: 2.50,
    source: "EPA WARM Model",
    region: "Global",
    description: "Manufactured plastic, paper, and metal goods"
  }
];

export function getFactorsByCategory(category) {
  return EMISSION_FACTORS.filter(f => f.category.toLowerCase() === category.toLowerCase());
}

export function getFactorById(id) {
  return EMISSION_FACTORS.find(f => f.id === id) || null;
}
