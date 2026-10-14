import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateEmission, formatCarbonWeight } from '../frontend/js/calculator.js';
import { EMISSION_FACTORS, getFactorById, getFactorsByCategory } from '../frontend/js/emissionFactors.js';

describe('Emission Calculation Engine', () => {
  it('should have all 25 standard emission factors loaded', () => {
    assert.equal(EMISSION_FACTORS.length, 25);
  });

  it('should correctly calculate emissions for petrol car (0.21 kg/km)', () => {
    const res = calculateEmission('ef_trans_car_petrol', 100);
    assert.equal(res.success, true);
    assert.equal(res.co2eKg, 21.0);
    assert.equal(res.category, 'transportation');
    assert.equal(res.unit, 'km');
    assert.equal(res.emissionFactor, 0.21);
    assert.ok(res.formulaText.includes('100 km × 0.21'));
  });

  it('should correctly calculate emissions for EV (0.05 kg/km)', () => {
    const res = calculateEmission('ef_trans_car_ev', 200);
    assert.equal(res.success, true);
    assert.equal(res.co2eKg, 10.0);
  });

  it('should correctly calculate grid electricity emissions (0.42 kg/kWh)', () => {
    const res = calculateEmission('ef_energy_grid', 50);
    assert.equal(res.success, true);
    assert.equal(res.co2eKg, 21.0);
  });

  it('should correctly calculate beef meal emissions (6.5 kg/meal)', () => {
    const res = calculateEmission('ef_food_beef', 3);
    assert.equal(res.success, true);
    assert.equal(res.co2eKg, 19.5);
  });

  it('should return error object for zero or negative quantities', () => {
    const resZero = calculateEmission('ef_trans_car_petrol', 0);
    const resNeg = calculateEmission('ef_trans_car_petrol', -15);
    const resNaN = calculateEmission('ef_trans_car_petrol', 'invalid');

    assert.equal(resZero.success, false);
    assert.equal(resZero.co2eKg, 0);

    assert.equal(resNeg.success, false);
    assert.equal(resNeg.co2eKg, 0);

    assert.equal(resNaN.success, false);
    assert.equal(resNaN.co2eKg, 0);
  });

  it('should throw an error for unknown emission factor ID', () => {
    assert.throws(() => {
      calculateEmission('non_existent_id', 50);
    }, /not found/);
  });

  it('should filter factors by category correctly', () => {
    const transFactors = getFactorsByCategory('transportation');
    assert.ok(transFactors.length >= 6);
    transFactors.forEach(f => assert.equal(f.category, 'transportation'));

    const energyFactors = getFactorsByCategory('energy');
    assert.ok(energyFactors.length >= 4);
    energyFactors.forEach(f => assert.equal(f.category, 'energy'));

    const foodFactors = getFactorsByCategory('food');
    assert.ok(foodFactors.length >= 6);
    foodFactors.forEach(f => assert.equal(f.category, 'food'));
  });

  it('should format weight in kg and metric tonnes', () => {
    assert.equal(formatCarbonWeight(10), '10.0 kg CO₂e');
    assert.equal(formatCarbonWeight(0.5), '0.5 kg CO₂e');
    assert.equal(formatCarbonWeight(1250), '1.25 tonnes CO₂e');
  });
});
