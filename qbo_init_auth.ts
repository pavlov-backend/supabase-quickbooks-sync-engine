import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Configuration from Supabase Environment Variables
const CLIENT_ID = Deno.env.get('QBO_CLIENT_ID')!;
const REDIRECT_URI = Deno.env.get('QBO_REDIRECT_URI')!;

const AUTH_ENDPOINT = "https://appcenter.intuit.com/connect/oauth2";
const SCOPES = "com.intuit.quickbooks.accounting"; 

serve(async (req) => {
  // Handle CORS for FlutterFlow/Web requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { user_id, platform } = await req.json();

    if (!user_id || !platform) {
      throw new Error("Missing user_id or platform");
    }

    // Pass user metadata in the 'state' parameter to handle the callback correctly
    const state = `${user_id}:${platform}`;

    const authParams = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      scope: SCOPES,
      redirect_uri: REDIRECT_URI,
      state: state,
    });

    return new Response(
      JSON.stringify({ url: `${AUTH_ENDPOINT}?${authParams.toString()}` }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }, status: 200 }
    );

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
})
