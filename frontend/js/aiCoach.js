/**
 * AI Sustainability Coach Service
 * Strictly follows AI_GEMINI_SPEC.md:
 * - Summarizes user activity payload without leaking sensitive data
 * - In production: Invokes Supabase Edge Function `generate-recommendations` (Gemini API)
 * - Offline/Demo mode: Seamlessly falls back to local adaptive rule engine
 * - Enforces strict structured JSON schema validation
 * - Emphasizes practical, non-judgmental, high-impact recommendations
 */

import { store } from "./store.js";
import { supabase } from "./supabaseClient.js";

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
  if (typeof data.summary !== "string" || !data.summary.trim()) return false;
  if (!["low", "medium", "high"].includes(data.overall_priority)) return false;
  if (!Array.isArray(data.recommendations) || data.recommendations.length === 0) return false;

  for (const rec of data.recommendations) {
    if (typeof rec.title !== "string" || !rec.title.trim()) return false;
    if (!["transportation", "energy", "food", "water", "shopping"].includes(rec.category)) return false;
    if (!["low", "medium", "high"].includes(rec.priority)) return false;
    if (typeof rec.reason !== "string" || !rec.reason.trim()) return false;
    if (typeof rec.action !== "string" || !rec.action.trim()) return false;
    if (typeof rec.estimated_impact_kg_co2_per_month !== "number" || isNaN(rec.estimated_impact_kg_co2_per_month)) return false;
    if (!["easy", "medium", "hard"].includes(rec.difficulty)) return false;
  }
  return true;
}

/**
 * Fallback adaptive recommendation generator for offline or unconfigured states
 */
export function generateFallbackRecommendations(payload, customTopic = null) {
  const cb = payload.categories || {};
  const sortedCats = Object.entries(cb)
    .filter(([_, val]) => Number(val) > 0)
    .sort((a, b) => b[1] - a[1]);

  const topCat = sortedCats.length > 0 ? sortedCats[0][0] : "transportation";
  const totalCo2 = Number(payload.total_co2_kg) || 0;

  const catalog = {
    transportation: [
      {
        title: "Transition 2 Weekly Commutes to Rail or Bus",
        category: "transportation",
        priority: "high",
        reason: `Commute and vehicular travel generated ${cb.transportation || 0} kg CO₂e in your logged history.`,
        action: "Swap two solo car commutes per week with metro transit, cycling, or carpooling.",
        estimated_impact_kg_co2_per_month: Math.max(12, Math.round((cb.transportation || 24.5) * 0.3)),
        difficulty: "easy"
      },
      {
        title: "Active Micro-Mobility for Trips Under 3 km",
        category: "transportation",
        priority: "medium",
        reason: "Short urban drives emit disproportionate emissions due to cold engine starts.",
        action: "Walk, cycle, or use an e-bike for neighbourhood errands under 3 kilometers.",
        estimated_impact_kg_co2_per_month: 8.5,
        difficulty: "easy"
      }
    ],
    energy: [
      {
        title: "Smart Thermostat & Vampire Load Shutdown",
        category: "energy",
        priority: "high",
        reason: `Home electricity represents a primary baseline (${cb.energy || 0} kg CO₂e recorded).`,
        action: "Adjust temperature by 1°C and switch off idle electronics using power strips.",
        estimated_impact_kg_co2_per_month: Math.max(10, Math.round((cb.energy || 16) * 0.25)),
        difficulty: "easy"
      },
      {
        title: "Switch to High-Efficiency LED Lighting",
        category: "energy",
        priority: "medium",
        reason: "Lighting upgrades provide immediate, continuous reductions in daily power demand.",
        action: "Replace legacy incandescent bulbs with warm-spectrum LEDs across active rooms.",
        estimated_impact_kg_co2_per_month: 9.0,
        difficulty: "easy"
      }
    ],
    food: [
      {
        title: "Adopt 2 Plant-Powered Dinners Per Week",
        category: "food",
        priority: "high",
        reason: `Dietary choices contributed ${cb.food || 0} kg CO₂e, with ruminant meat emitting over 6x more than plant proteins.`,
        action: "Substitute beef or lamb with lentil curry, chickpea bowls, or plant proteins twice weekly.",
        estimated_impact_kg_co2_per_month: Math.max(14, Math.round((cb.food || 22) * 0.35)),
        difficulty: "medium"
      },
      {
        title: "Zero Food-Waste Meal Planning",
        category: "food",
        priority: "medium",
        reason: "Discarded food decomposing in landfills creates potent methane emissions.",
        action: "Plan weekly grocery purchases with portion control and freeze leftovers promptly.",
        estimated_impact_kg_co2_per_month: 11.5,
        difficulty: "easy"
      }
    ],
    shopping: [
      {
        title: "30-Day Mindful Purchase Pause",
        category: "shopping",
        priority: "high",
        reason: `Apparel and consumer goods contributed ${cb.shopping || 0} kg CO₂e from industrial supply chains.`,
        action: "Apply a 72-hour cooling-off rule before purchasing non-essential apparel or goods.",
        estimated_impact_kg_co2_per_month: Math.max(15, Math.round((cb.shopping || 20) * 0.4)),
        difficulty: "medium"
      },
      {
        title: "Prioritize Pre-Owned & Garment Repair",
        category: "shopping",
        priority: "medium",
        reason: "Extending product lifespans by 9 months reduces supply chain footprint by over 20%.",
        action: "Repair worn garments and opt for certified refurbished or pre-owned goods.",
        estimated_impact_kg_co2_per_month: 12.0,
        difficulty: "easy"
      }
    ],
    water: [
      {
        title: "6-Minute Showers & Flow Regulators",
        category: "water",
        priority: "medium",
        reason: `Water heating accounted for ${cb.water || 0} kg CO₂e in domestic thermal energy consumption.`,
        action: "Shorten hot showers to 6 minutes and fit a low-flow aerator to primary faucets.",
        estimated_impact_kg_co2_per_month: Math.max(6, Math.round((cb.water || 8.5) * 0.3)),
        difficulty: "easy"
      },
      {
        title: "Cold Water Laundry Cycles (30°C)",
        category: "water",
        priority: "low",
        reason: "90% of washing machine energy is consumed heating the wash water.",
        action: "Run full laundry loads on cold or eco 30°C wash cycles.",
        estimated_impact_kg_co2_per_month: 7.2,
        difficulty: "easy"
      }
    ]
  };

  let recommendations = [];
  const primaryList = catalog[topCat] || catalog.transportation;
  recommendations.push(primaryList[0]);

  // Add recommendations from secondary logged categories
  for (const [catName] of sortedCats) {
    if (catName !== topCat && catalog[catName] && recommendations.length < 3) {
      recommendations.push(catalog[catName][0]);
    }
  }

  // Fill up to 3 recommendations if user logged only 1 category
  if (recommendations.length < 3 && primaryList[1]) {
    recommendations.push(primaryList[1]);
  }
  const allCats = ["energy", "food", "transportation", "shopping", "water"];
  for (const c of allCats) {
    if (recommendations.length >= 3) break;
    if (!recommendations.some(r => r.category === c)) {
      recommendations.push(catalog[c][0]);
    }
  }

  const response = {
    summary: `Based on your logged activity history (${totalCo2} kg estimated CO₂e), ${topCat} is your primary footprint driver. Targeted reductions in commute efficiency and dietary shifts can reduce your monthly footprint by up to 28%.`,
    overall_priority: totalCo2 > 150 ? "high" : "medium",
    recommendations: recommendations.slice(0, 3)
  };

  // Enforce schema validation
  if (!validateGeminiResponse(response)) {
    throw new Error("Fallback AI response failed schema validation.");
  }

  return response;
}

/**
 * Generate intelligent recommendations based on active user profile & data
 * 1. Invokes the Supabase Edge Function `generate-recommendations` (Gemini API)
 * 2. If user is authenticated, saves recommendations into PostgreSQL
 * 3. Falls back gracefully to the adaptive client rule engine if offline or unconfigured
 */
export async function getRecommendations(customTopic = null) {
  const payload = buildActivitySummaryPayload();
  if (customTopic) {
    payload.custom_focus = customTopic;
  }

  // 1. Attempt calling Supabase Edge Function with a 6-second timeout
  try {
    const invokePromise = supabase.functions.invoke("generate-recommendations", {
      body: payload
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Edge Function invocation timed out")), 6000)
    );

    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

    if (!error && data && validateGeminiResponse(data)) {
      // If user is authenticated in Supabase, persist recommendations in PostgreSQL
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user && Array.isArray(data.recommendations)) {
          const records = data.recommendations.map(rec => ({
            user_id: user.id,
            recommendation_type: rec.priority,
            title: rec.title,
            description: `${rec.reason} ${rec.action}`,
            priority: rec.priority,
            estimated_impact: rec.estimated_impact_kg_co2_per_month,
            category: rec.category
          }));
          await supabase.from("ai_recommendations").insert(records);
        }
      } catch (saveErr) {
        console.warn("Could not persist recommendations to Supabase:", saveErr);
      }

      return data;
    }

    if (error) {
      console.warn("Edge Function generate-recommendations returned error, using adaptive fallback:", error.message || error);
    }
  } catch (edgeErr) {
    console.warn("Could not reach generate-recommendations Edge Function, using adaptive fallback:", edgeErr.message || edgeErr);
  }

  // Brief pause for UI smoothness before rendering fallback
  await new Promise(resolve => setTimeout(resolve, 300));

  // 2. Return validated fallback recommendations
  return generateFallbackRecommendations(payload, customTopic);
}
