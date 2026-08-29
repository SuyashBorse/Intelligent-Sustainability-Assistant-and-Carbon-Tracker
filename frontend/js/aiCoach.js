/**
 * AI Sustainability Coach Service
 * Strictly follows AI_GEMINI_SPEC.md:
 * - Summarizes user activity payload without leaking sensitive data
 * - Generates structured JSON matching schema
 * - Validates schema before rendering
 * - Emphasizes practical, non-judgmental, high-impact recommendations
 */

import { store } from "./store.js";

/**
 * Compiles a compact, privacy-safe activity summary payload for the AI
 */
export function buildActivitySummaryPayload() {
  const aggregates = store.getAggregates();
  const state = store.getState();

  // Determine trend by comparing first 15 days vs last 15 days
  const now = new Date();
  const fifteenDaysAgo = new Date(now.setDate(now.getDate() - 15)).toISOString().split("T")[0];
  
  let recentSum = 0;
  let olderSum = 0;
  state.activities.forEach(act => {
    if (act.date >= fifteenDaysAgo) {
      recentSum += Number(act.co2eKg);
    } else {
      olderSum += Number(act.co2eKg);
    }
  });

  const recent_trend = recentSum > olderSum ? "increasing" : "decreasing";

  return {
    period: "last_30_days",
    total_co2_kg: aggregates.monthCo2,
    categories: aggregates.categoryBreakdown,
    top_activities: aggregates.topContributors.map(tc => ({
      activity: tc.activity,
      co2_kg: tc.co2eKg
    })),
    recent_trend
  };
}

/**
 * Validates recommendation JSON matches the required schema in AI_GEMINI_SPEC.md
 */
export function validateGeminiResponse(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.summary !== "string") return false;
  if (!["low", "medium", "high"].includes(data.overall_priority)) return false;
  if (!Array.isArray(data.recommendations) || data.recommendations.length === 0) return false;

  for (const rec of data.recommendations) {
    if (typeof rec.title !== "string") return false;
    if (!["transportation", "energy", "food", "water", "shopping"].includes(rec.category)) return false;
    if (!["low", "medium", "high"].includes(rec.priority)) return false;
    if (typeof rec.reason !== "string") return false;
    if (typeof rec.action !== "string") return false;
    if (typeof rec.estimated_impact_kg_co2_per_month !== "number") return false;
    if (!["easy", "medium", "hard"].includes(rec.difficulty)) return false;
  }
  return true;
}

/**
 * Generate intelligent recommendations based on active user profile & data
 * In production, this calls the Supabase Edge Function `generate-recommendations`.
 * On the frontend, it uses adaptive rule-backed intelligence to produce valid schema output immediately.
 */
export async function getRecommendations(customTopic = null) {
  const payload = buildActivitySummaryPayload();
  
  // Simulate network roundtrip to AI Edge Function
  await new Promise(resolve => setTimeout(resolve, 600));

  const cb = payload.categories;
  const topCat = Object.keys(cb).reduce((a, b) => cb[a] > cb[b] ? a : b, "transportation");

  let recommendations = [];

  if (topCat === "transportation" || (customTopic && customTopic.includes("commute"))) {
    recommendations.push({
      title: "Transition 2 Weekly Commutes to Rail or Bus",
      category: "transportation",
      priority: "high",
      reason: `Gasoline car travel accounted for your highest single emissions category (${cb.transportation} kg CO₂e this period).`,
      action: "Swap two solo car commutes per week with metro transit or carpooling with colleagues.",
      estimated_impact_kg_co2_per_month: 24.5,
      difficulty: "easy"
    });
  }

  if (cb.energy > 15 || (customTopic && customTopic.includes("energy"))) {
    recommendations.push({
      title: "Smart Thermostat & Vampire Load Shutdown",
      category: "energy",
      priority: "medium",
      reason: "Home electricity contributes steadily to your baseline footprint.",
      action: "Lower heating by 1°C / raise cooling by 1°C and switch off power strips when leaving home.",
      estimated_impact_kg_co2_per_month: 16.0,
      difficulty: "easy"
    });
  }

  if (cb.food > 10 || (customTopic && customTopic.includes("food"))) {
    recommendations.push({
      title: "Adopt 2 Plant-Powered Dinners Per Week",
      category: "food",
      priority: "medium",
      reason: "Beef and ruminant meat generate over 6x more emissions per meal than plant-based proteins.",
      action: "Substitute ground beef or steak with lentil curry, chickpea bowls, or plant-based proteins twice weekly.",
      estimated_impact_kg_co2_per_month: 22.0,
      difficulty: "medium"
    });
  }

  recommendations.push({
    title: "Eco Shower Habit & Cold Laundry Cycle",
    category: "water",
    priority: "low",
    reason: "Water heating uses substantial natural gas or electricity.",
    action: "Shorten hot showers to 6 minutes and wash 80% of laundry loads on 30°C or cold water cycle.",
    estimated_impact_kg_co2_per_month: 8.5,
    difficulty: "easy"
  });

  const response = {
    summary: `Based on your last 30 days of activity (${payload.total_co2_kg} kg estimated CO₂e), ${topCat} is your primary footprint driver. Targeted reductions in commute efficiency and dietary shifts can reduce your monthly footprint by up to 28%.`,
    overall_priority: "medium",
    recommendations: recommendations.slice(0, 3)
  };

  // Enforce schema validation
  if (!validateGeminiResponse(response)) {
    throw new Error("AI response failed schema validation.");
  }

  return response;
}
