
/**
 * SUPABASE EDGE FUNCTION FOR POLAR WEBHOOKS
 */

declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const bodyText = await req.text();
    if (!bodyText) {
      console.log("Received empty request body.");
      return new Response("Empty body", { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const eventType = payload.type;
    const data = payload.data;
    
    console.log(`Incoming Polar Event: ${eventType}`);

    if (!eventType) {
      console.log("Missing 'type' in payload. Full payload received:", bodyText);
      return new Response("Missing type", { status: 400 });
    }

    const successEvents = [
      'order.created', 
      'subscription.created', 
      'checkout.succeeded',
      'payment.succeeded'
    ];
    
    if (successEvents.includes(eventType)) {
      // 1. EXTRACT USER ID VIA METADATA (Preferred)
      let userId = 
        data.metadata?.client_reference_id || 
        data.metadata?.['client_reference_id'] ||
        data.metadata?.['metadata[client_reference_id]'] ||
        data.client_reference_id ||
        payload.client_reference_id ||
        (data.checkout?.metadata?.client_reference_id) ||
        (data.order?.metadata?.client_reference_id);
      
      const customerEmail = data.customer?.email || data.user?.email || payload.email;

      console.log(`Processing ${eventType}. Resolved User ID from Metadata: ${userId}`);
      console.log(`Customer Email in Payload: ${customerEmail}`);

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // 2. FALLBACK: IF NO ID, FIND USER BY EMAIL (Safe backup)
      if (!userId && customerEmail) {
        console.log("No User ID found in metadata. Attempting lookup by email...");
        
        // Note: Querying by email works if your 'profiles' table has an 'id' that matches auth.users 'id'
        // We look up the auth user via admin API to get the correct UUID
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (!authError && authUsers?.users) {
            const foundUser = authUsers.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase());
            if (foundUser) {
                userId = foundUser.id;
                console.log(`Found matching Supabase User ID via Email lookup: ${userId}`);
            }
        }
      }

      if (!userId) {
        console.error("CRITICAL ERROR: No User ID could be determined via metadata OR email.");
        console.log("Full Event Payload for Debugging:", bodyText);
        return new Response("Missing User ID mapping", { status: 400 });
      }

      // 3. UPDATE STATUS TO PAID
      const { error, data: updatedData } = await supabaseAdmin
        .from('profiles')
        .update({ status: 'paid' })
        .eq('id', userId)
        .select();

      if (error) {
        console.error(`Database Update Failed for User ${userId}:`, error.message);
        return new Response(`DB Error: ${error.message}`, { status: 500 });
      }
      
      if (!updatedData || updatedData.length === 0) {
        console.warn(`User ${userId} not found in profiles table.`);
        return new Response("User profile not found", { status: 404 });
      } else {
        console.log(`SUCCESS: User ${userId} is now PAID.`);
      }
    } else {
        console.log(`Event ${eventType} ignored.`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Webhook Handler Crash:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
})
