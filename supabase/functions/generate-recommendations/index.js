/**
 * Supabase Edge Function: generate-recommendations
 *
 * Secure server-side gateway to Google Gemini API for personalized sustainability recommendations.
 * Enforces structured JSON output schema per AI_GEMINI_SPEC.md.
 * Features automatic model cascade (gemini-2.5-flash -> gemini-2.5-flash-lite -> gemini-1.5-flash -> gemini-3.8-flash)
 * and intelligent resilient fallback if Google Gemini quota is temporarily exceeded.
 */

// Standard CORS headers allowing web browser invocations
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Candidate models with free tier priority in Google AI Studio
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.8-flash"
];

// Strict JSON schema matching documents/AI_GEMINI_SPEC.md
const RECOMMENDATION_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "Brief executive summary of user emissions and highest carbon drivers."
    },
    overall_priority: {
      type: "string",
      enum: ["low", "medium", "high"],
      description: "Overall urgency of reduction actions based on footprint size."
    },
    recommendations: {
      type: "array",
      description: "List of 3 prioritized, practical, high-impact recommendations.",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Concise actionable title for the recommendation."
          },
          category: {
            type: "string",
            enum: ["transportation", "energy", "food", "water", "shopping"],
            description: "Activity category."
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Priority tier."
          },
          reason: {
            type: "string",
            description: "Data-driven explanation referencing user's numbers."
          },
          action: {
            type: "string",
            description: "Specific everyday change or habit to implement."
          },
          estimated_impact_kg_co2_per_month: {
            type: "number",
            description: "Estimated reduction in kg CO2e per month (positive number)."
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard"],
            description: "Implementation difficulty."
          }
        },
        required: [
          "title",
          "category",
          "priority",
          "reason",
          "action",
          "estimated_impact_kg_co2_per_month",
          "difficulty"
        ]
      }
    }
  },
  required: ["summary", "overall_priority", "recommendations"]
};

/**
 * Validates recommendation JSON matches the required schema
 */
function validateGeminiResponse(data) {
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
 * Resilient server fallback if all Gemini API quota/rate limits are hit
 */
function generateEdgeFallback(payload) {
  const cb = payload.categories || {};
  const topCat = Object.keys(cb).reduce((a, b) => ((cb[a] || 0) > (cb[b] || 0) ? a : b), "transportation");
  const totalCo2 = Number(payload.total_co2_kg) || 0;

  const recs = [
    {
      title: "Transition 2 Weekly Commutes to Rail or Bus",
      category: "transportation",
      priority: topCat === "transportation" ? "high" : "medium",
      reason: `Transportation contributes significantly to your footprint (${cb.transportation || 0} kg CO₂e recorded).`,
      action: "Swap two solo car commutes per week with metro transit, cycling, or carpooling.",
      estimated_impact_kg_co2_per_month: 24.5,
      difficulty: "easy"
    },
    {
      title: "Smart Thermostat & Vampire Load Shutdown",
      category: "energy",
      priority: topCat === "energy" ? "high" : "medium",
      reason: `Home electricity represents a steady baseline (${cb.energy || 0} kg CO₂e recorded).`,
      action: "Lower heating by 1°C / raise cooling by 1°C and switch off power strips when leaving home.",
      estimated_impact_kg_co2_per_month: 16.0,
      difficulty: "easy"
    },
    {
      title: "Adopt 2 Plant-Powered Dinners Per Week",
      category: "food",
      priority: topCat === "food" ? "high" : "medium",
      reason: "Beef and ruminant meat generate over 6x more emissions per meal than plant-based proteins.",
      action: "Substitute ground beef or steak with lentil curry, chickpea bowls, or plant-based proteins twice weekly.",
      estimated_impact_kg_co2_per_month: 22.0,
      difficulty: "medium"
    }
  ];

  return {
    summary: `Based on your recent activity evaluation (${totalCo2} kg estimated CO₂e), ${topCat} is your primary footprint driver. Targeted reductions in commute efficiency and dietary shifts can reduce your monthly footprint by up to 28%.`,
    overall_priority: totalCo2 > 150 ? "high" : "medium",
    recommendations: recs
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    let payload;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body.", code: "BAD_REQUEST" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If API key is missing, return resilient fallback immediately with note
    if (!apiKey) {
      console.warn("GEMINI_API_KEY secret is not set. Returning resilient fallback.");
      return new Response(JSON.stringify(generateEdgeFallback(payload)), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const period = payload.period || "last_30_days";
    const totalCo2 = Number(payload.total_co2_kg) || 0;
    const cats = payload.categories || {};
    const topActs = Array.isArray(payload.top_activities) && payload.top_activities.length > 0
      ? payload.top_activities.map(a => `${a.activity || a.name || "Activity"}: ${a.co2_kg ?? a.co2eKg ?? 0} kg CO2e`).join("; ")
      : "General daily activities.";
    const trend = payload.recent_trend || "stable";
    const focus = payload.custom_focus ? `User requested special focus on: "${payload.custom_focus}".` : "";

    const prompt = `You are EcoTrack AI, an intelligent personal sustainability and decarbonization coach.
Analyze the user's carbon footprint summary and generate 3 practical, high-impact, non-judgmental recommendations.

Rules:
1. Return ONLY valid JSON matching the required schema.
2. Tone: Encouraging, positive, and practical. Never shame the user.
3. Reference the user's actual data to justify recommendations (mention specific emission categories or activities).
4. Label all emissions savings as estimated.
5. Provide realistic everyday lifestyle changes (e.g. commuting alternatives, energy efficiency, diet shifts).
6. Do NOT provide medical, financial, or hazardous advice.
7. Categories must be one of: "transportation", "energy", "food", "water", "shopping".
8. Priorities must be one of: "low", "medium", "high".
9. Difficulties must be one of: "easy", "medium", "hard".

User Footprint Profile:
- Evaluation Window: ${period}
- Total Footprint: ${totalCo2} kg CO2e
- Category Breakdown:
  * Transportation: ${Number(cats.transportation) || 0} kg CO2e
  * Energy: ${Number(cats.energy) || 0} kg CO2e
  * Food: ${Number(cats.food) || 0} kg CO2e
  * Water: ${Number(cats.water) || 0} kg CO2e
  * Shopping: ${Number(cats.shopping) || 0} kg CO2e
- Recent Footprint Trend: ${trend}
- Top Contributing Activities: ${topActs}
${focus}

Produce 3 personalized, actionable recommendations strictly in JSON format.`;

    let parsedResult = null;

    // Model cascade: try candidate models in priority order
    for (const model of CANDIDATE_MODELS) {
      if (parsedResult) break;
      try {
        const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const restResp = await fetch(restUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: RECOMMENDATION_SCHEMA,
              temperature: 0.7
            }
          })
        });

        if (restResp.ok) {
          const restData = await restResp.json();
          const rawText = restData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const candidate = JSON.parse(rawText);
            if (validateGeminiResponse(candidate)) {
              parsedResult = candidate;
              console.log(`Successfully generated recommendations using model ${model}`);
              break;
            }
          }
        } else {
          const errStatus = restResp.status;
          const errText = await restResp.text();
          console.warn(`Model ${model} returned HTTP ${errStatus}:`, errText.slice(0, 150));
        }
      } catch (err) {
        console.warn(`Model ${model} invocation threw:`, err.message || err);
      }
    }

    // If Gemini quota is exceeded on all models or rate limited, return resilient adaptive fallback
    if (!parsedResult) {
      console.warn("All candidate Gemini models were rate-limited or unavailable. Providing resilient fallback.");
      parsedResult = generateEdgeFallback(payload);
    }

    return new Response(JSON.stringify(parsedResult), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Unhandled error in generate-recommendations:", err);
    // Even on unexpected error, deliver fallback so the UI never crashes or hangs
    return new Response(
      JSON.stringify(generateEdgeFallback({})),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
