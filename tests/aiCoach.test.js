// Mock browser globals for Node test runner before any ESM imports evaluate
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };
}

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateGeminiResponse, generateFallbackRecommendations, buildActivitySummaryPayload } from '../frontend/js/aiCoach.js';

describe('Gemini AI Coach & Schema Engine', () => {
  it('should validate conforming Gemini JSON responses', () => {
    const validData = {
      summary: 'Transportation is your highest emissions driver.',
      overall_priority: 'high',
      recommendations: [
        {
          title: 'Switch Commute to Metro',
          category: 'transportation',
          priority: 'high',
          reason: 'Solo car commutes generated 64 kg CO2e.',
          action: 'Use the metro train twice per week.',
          estimated_impact_kg_co2_per_month: 24.5,
          difficulty: 'easy'
        },
        {
          title: 'Plant-Based Dinners',
          category: 'food',
          priority: 'medium',
          reason: 'Beef meals produce higher relative emissions.',
          action: 'Substitute 2 meals with lentils or chickpeas.',
          estimated_impact_kg_co2_per_month: 15.0,
          difficulty: 'medium'
        }
      ]
    };

    assert.equal(validateGeminiResponse(validData), true);
  });

  it('should reject malformed or non-compliant AI responses', () => {
    // Missing overall_priority
    assert.equal(validateGeminiResponse({ summary: 'Test', recommendations: [] }), false);

    // Invalid category
    assert.equal(validateGeminiResponse({
      summary: 'Test',
      overall_priority: 'medium',
      recommendations: [{
        title: 'Title',
        category: 'space_travel',
        priority: 'high',
        reason: 'Reason',
        action: 'Action',
        estimated_impact_kg_co2_per_month: 10,
        difficulty: 'easy'
      }]
    }), false);

    // Non-numeric impact
    assert.equal(validateGeminiResponse({
      summary: 'Test',
      overall_priority: 'medium',
      recommendations: [{
        title: 'Title',
        category: 'energy',
        priority: 'medium',
        reason: 'Reason',
        action: 'Action',
        estimated_impact_kg_co2_per_month: 'unknown',
        difficulty: 'easy'
      }]
    }), false);

    // Empty recommendations array
    assert.equal(validateGeminiResponse({
      summary: 'Test',
      overall_priority: 'low',
      recommendations: []
    }), false);
  });

  it('should generate valid fallback recommendations matching dominant category', () => {
    const payload = {
      period: 'last_30_days',
      total_co2_kg: 195.4,
      categories: {
        transportation: 95.0,
        energy: 45.0,
        food: 30.0,
        water: 5.4,
        shopping: 20.0
      },
      top_activities: [
        { activity: 'Car (Petrol / Gasoline)', co2_kg: 75.0 }
      ],
      recent_trend: 'increasing'
    };

    const fallback = generateFallbackRecommendations(payload);
    assert.ok(fallback);
    assert.equal(validateGeminiResponse(fallback), true);
    assert.ok(fallback.recommendations.length > 0);
    assert.ok(fallback.summary.includes('transportation'));
  });

  it('should produce a privacy-safe activity summary payload with zero PII', () => {
    const payload = buildActivitySummaryPayload();
    assert.ok(payload);
    assert.ok(payload.period);
    assert.equal(typeof payload.total_co2_kg, 'number');
    assert.ok(payload.categories);
    assert.ok(Array.isArray(payload.top_activities));

    // Strict PII checks
    assert.equal(payload.name, undefined);
    assert.equal(payload.email, undefined);
    assert.equal(payload.user_id, undefined);
    assert.equal(payload.address, undefined);
  });
});
