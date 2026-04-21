import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLIENT_ID = Deno.env.get('QBO_CLIENT_ID')!;
const CLIENT_SECRET = Deno.env.get('QBO_CLIENT_SECRET')!;
const REDIRECT_URI = Deno.env.get('QBO_REDIRECT_URI')!;
const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

serve(async (req) => {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const realmId = requestUrl.searchParams.get('realmId');
  const state = requestUrl.searchParams.get('state') ?? "";

  // Parse state to determine return path (mobile app vs web)
  const [userId, platform] = state.split(':');
  const isWeb = platform === 'web';
  const successBase = isWeb ? "https://your-app.com/qbo-success" : "your-app-scheme://qbo-success";

  try {
    // Exchange Authorization Code for Access & Refresh Tokens
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        "grant_type": "authorization_code",
        "code": code!,
        "redirect_uri": REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    // Initialize Supabase Admin Client
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Calculate expiration timestamps
    const now = new Date();
    const tokenExpiresAt = new Date(now.getTime() + tokenData.expires_in * 1000).toISOString();

    // Persist connection data to database
    await supabase
      .from('business_profiles')
      .update({
        qbo_connected: true,
        qbo_realm_id: realmId,
        qbo_access_token: tokenData.access_token,
        qbo_refresh_token: tokenData.refresh_token,
        qbo_token_expires_at: tokenExpiresAt,
      })
      .eq('user_id', userId);

    return Response.redirect(`${successBase}?realmId=${realmId}`, 302);

  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
})
