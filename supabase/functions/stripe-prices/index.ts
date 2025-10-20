import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'Bolt Integration', version: '1.0.0' },
});

function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
  if (status === 204) return new Response(null, { status, headers });
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') return corsResponse({}, 204);
    if (req.method !== 'POST') return corsResponse({ error: 'Method not allowed' }, 405);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return corsResponse({ error: 'Unauthorized' }, 401);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);
    if (getUserError || !user) return corsResponse({ error: 'Unauthorized' }, 401);

    const { price_ids } = await req.json();
    if (!Array.isArray(price_ids) || price_ids.length === 0) {
      return corsResponse({ error: 'price_ids must be a non-empty array' }, 400);
    }

    const prices = await Promise.all(price_ids.map(async (id: string) => {
      const price = await stripe.prices.retrieve(id);
      return {
        id: price.id,
        currency: price.currency,
        unit_amount: price.unit_amount ?? 0,
        recurring: price.recurring ?? null,
        product: typeof price.product === 'string' ? price.product : price.product?.id,
      };
    }));

    return corsResponse(prices, 200);
  } catch (error: any) {
    console.error('stripe-prices error:', error);
    return corsResponse({ error: error.message }, 500);
  }
});