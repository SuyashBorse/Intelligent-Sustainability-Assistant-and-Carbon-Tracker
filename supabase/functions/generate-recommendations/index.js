// Setup for built-in Supabase Runtime APIs
import { withSupabase } from "@supabase/server";

console.log("Hello from Functions!");

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // Parse JSON request
    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }
    const name = body.name || "World";

    return Response.json({
      message: `Hello ${name} from JavaScript!`,
    });
  }),
};
