/**
 * Supabase Edge Function: generate-recommendations
 *
 * Secure server-side gateway to Google Gemini API for personalized sustainability recommendations.
 * Enforces structured JSON output schema per AI_GEMINI_SPEC.md.
 * Keeps GEMINI_API_KEY completely confidential on the server.
 */

// Standard CORS headers allowing web browser invocations
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not configured in environment secrets.");
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Supabase secrets.",
          code: "MISSING_GEMINI_API_KEY",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    const period = payload.period || "last_30_days";
    const totalCo2 = Number(payload.total_co2_kg) || 0;
    const cats = payload.categories || {};
    const topActs = Array.isArray(payload.top_activities) && payload.top_activities.length > 0
      ? payload.top_activities.map(a => `${a.activity || a.name || "Activity"}: ${a.co2_kg ?? a.co2eKg ?? 0} kg CO2e`).join("; ")
      : "No specific individual activity peaks recorded.";
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

    // Strategy 1: Attempt using @google/genai SDK
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.interactions.create({
        model: "gemini-3.8-flash",
        input: prompt,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: RECOMMENDATION_SCHEMA,
        },
      });

      const rawText = response.output_text;
      if (rawText) {
        parsedResult = JSON.parse(rawText);
      }
    } catch (sdkErr) {
      console.warn("Direct @google/genai call failed, attempting REST endpoint fallback:", sdkErr?.message || sdkErr);
    }

    // Strategy 2: Native fetch fallback to Google Gemini REST endpoint
    if (!parsedResult) {
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
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
            responseSchema: RECOMMENDATION_SCHEMA
          }
        })
      });

      if (!restResp.ok) {
        const errorBody = await restResp.text();
        console.error("Gemini REST API returned error:", restResp.status, errorBody);
        return new Response(
          JSON.stringify({
            error: `Gemini API request failed (${restResp.status}).`,
            details: errorBody,
            code: "GEMINI_API_ERROR"
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const restData = await restResp.json();
      const rawText = restData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        parsedResult = JSON.parse(rawText);
      }
    }

    // Validate structured schema
    if (!parsedResult || !validateGeminiResponse(parsedResult)) {
      console.error("Gemini response failed validation schema:", parsedResult);
      return new Response(
        JSON.stringify({
          error: "AI response failed structured schema validation.",
          code: "SCHEMA_VALIDATION_FAILED",
          received: parsedResult
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(JSON.stringify(parsedResult), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Unhandled error in generate-recommendations:", err);
    return new Response(
      JSON.stringify({
        error: err.message || "Internal server error occurred.",
        code: "INTERNAL_ERROR"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
