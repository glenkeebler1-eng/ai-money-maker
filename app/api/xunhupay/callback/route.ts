import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';

const XUNHUPAY_APP_SECRET = process.env.XUNHUPAY_APP_SECRET!;

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function verifyHash(params: Record<string, string>, secret: string): boolean {
  const receivedHash = params.hash;
  const sorted = Object.keys(params)
    .filter(k => k !== 'hash' && params[k] !== '')
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  const expectedHash = crypto.createHash('md5').update(sorted + secret).digest('hex');
  return receivedHash === expectedHash;
}

function getSubscriptionExpiry(plan: string): Date {
  const now = new Date();
  if (plan === 'pro_yearly') {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  }
  return new Date(now.setMonth(now.getMonth() + 1));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const params: Record<string, string> = {};
    body.forEach((value, key) => { params[key] = value.toString(); });

    // Validate the callback hash before touching order state.
    if (!verifyHash(params, XUNHUPAY_APP_SECRET)) {
      return new NextResponse('failure', { status: 400 });
    }

    const { trade_order_id, status } = params;

    if (status !== 'OD') {
      return new NextResponse('success');
    }

    const supabase = createAdminClient();

    // Find the order
    const { data: order } = await supabase
      .from('orders')
      .select('user_id, plan, payment_status')
      .eq('external_order_id', trade_order_id)
      .single();

    if (!order || order.payment_status === 'completed') {
      return new NextResponse('success');
    }

    // Update order status
    await supabase.from('orders')
      .update({ payment_status: 'completed' })
      .eq('external_order_id', trade_order_id);

    // Upgrade user to Pro
    await supabase.from('profiles').update({
      subscription_tier: 'pro',
      subscription_expires_at: getSubscriptionExpiry(order.plan).toISOString(),
    }).eq('id', order.user_id);

    return new NextResponse('success');
  } catch (error) {
    console.error('Xunhupay callback error:', error);
    return new NextResponse('failure', { status: 500 });
  }
}
