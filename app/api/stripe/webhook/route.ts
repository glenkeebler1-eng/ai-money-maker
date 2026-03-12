import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

// Supabase admin client (bypasses RLS)
function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function getSubscriptionExpiry(plan: string): Date {
  const now = new Date();
  if (plan === 'pro_yearly') {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  }
  return new Date(now.setMonth(now.getMonth() + 1));
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (userId && plan) {
      await supabase.from('profiles').update({
        subscription_tier: 'pro',
        subscription_expires_at: getSubscriptionExpiry(plan).toISOString(),
        stripe_customer_id: session.customer as string,
      }).eq('id', userId);

      await supabase.from('orders').insert({
        user_id: userId,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        payment_method: 'stripe',
        payment_status: 'completed',
        plan,
        external_order_id: session.id,
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    await supabase.from('profiles')
      .update({ subscription_tier: 'free', subscription_expires_at: null })
      .eq('stripe_customer_id', customerId);
  }

  return NextResponse.json({ received: true });
}
