import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { record, old_record, type } = payload;

    // Trigger only on new successful QBO connection
    if (!(type === 'UPDATE' && record?.qbo_connected === true && old_record?.qbo_connected === false)) {
      return new Response("Ignored", { status: 200 });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: userProfile } = await supabase.from('user_profiles').select('email').eq('user_id', record.user_id).single();

    // Logic to send HTML email via Mailgun API...
    console.log(`Sending QBO integration confirmation to ${userProfile?.email}`);

    return new Response("Notification Processed", { status: 200 });

  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
});
