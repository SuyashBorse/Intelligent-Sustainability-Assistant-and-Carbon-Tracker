/**
 * Emission Calculation Engine
 * Adheres strictly to EMISSION_CALCULATION_SPEC.md:
 * CO2e (kg) = activity quantity × emission factor
 * Enforces validation, factor snapshotting, and unit attribution.
 */

import { getFactorById } from "./emissionFactors.js";

/**
 * Calculates estimated CO2e in kg
 * @param {string} factorId 
 * @param {number} quantity 
 * @returns {Object} Calculation result with full metadata snapshot
 */
export function calculateEmission(factorId, quantity) {
  const factor = getFactorById(factorId);
  if (!factor) {
    throw new Error(`Emission factor with ID "${factorId}" not found.`);
  }

  const numQuantity = Number(quantity);
  if (isNaN(numQuantity) || numQuantity <= 0) {
    return {
      success: false,
      error: "Quantity must be a positive number greater than 0.",
      co2eKg: 0,
      formattedCo2e: "0.00 kg CO₂e"
    };
  }

  // Core formula
  const co2eKg = Number((numQuantity * factor.emissionFactor).toFixed(3));

  return {
    success: true,
    factorId: factor.id,
    category: factor.category,
    activityType: factor.activityType,
    quantity: numQuantity,
    unit: factor.unit,
    emissionFactor: factor.emissionFactor,
    source: factor.source,
    region: factor.region,
    co2eKg: co2eKg,
    formattedCo2e: `${co2eKg.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg CO₂e`,
    formulaText: `${numQuantity} ${factor.unit} × ${factor.emissionFactor} kg CO₂e/${factor.unit} = ${co2eKg} kg CO₂e`
  };
}

/**
 * Format CO2e weight appropriately (e.g. kg or metric tonnes)
 * @param {number} kg 
 * @returns {string}
 */
export function formatCarbonWeight(kg) {
  if (kg >= 1000) {
    const tonnes = (kg / 1000).toFixed(2);
    return `${tonnes} tonnes CO₂e`;
  }
  return `${Number(kg).toFixed(1)} kg CO₂e`;
}
