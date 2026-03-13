import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';

// 虎皮椒支付 (xunhupay.com) - 个人开发者友好的聚合支付
// 文档: https://www.xunhupay.com/doc.html

const XUNHUPAY_APP_ID = process.env.XUNHUPAY_APP_ID!;
const XUNHUPAY_APP_SECRET = process.env.XUNHUPAY_APP_SECRET!;
const XUNHUPAY_API_URL =
  process.env.XUNHUPAY_API_URL || 'https://api.xunhupay.com/payment/do.html';

const PLAN_PRICES: Record<string, { amount: string; title: string }> = {
  pro_monthly: { amount: '68.00', title: 'AI 赚钱案例库 Pro 月付' },
  pro_yearly: { amount: '588.00', title: 'AI 赚钱案例库 Pro 年付' },
};

function generateHash(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params)
    .filter(k => k !== 'hash' && params[k] !== '')
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('md5').update(sorted + secret).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, locale } = await request.json();
    const planConfig = PLAN_PRICES[plan];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const orderId = `${Date.now()}_${user.id.substring(0, 8)}`;

    const params: Record<string, string> = {
      appid: XUNHUPAY_APP_ID,
      trade_order_id: orderId,
      total_fee: planConfig.amount,
      title: planConfig.title,
      time: Math.floor(Date.now() / 1000).toString(),
      version: 'v3',
      notify_url: `${baseUrl}/api/xunhupay/callback`,
      return_url: `${baseUrl}/${locale}/dashboard?payment=success`,
      nonce_str: crypto.randomBytes(8).toString('hex'),
      type: 'WAP',
    };

    params.hash = generateHash(params, XUNHUPAY_APP_SECRET);

    // Save pending order
    await supabase.from('orders').insert({
      user_id: user.id,
      amount: parseFloat(planConfig.amount),
      currency: 'CNY',
      payment_method: 'xunhupay',
      payment_status: 'pending',
      plan,
      external_order_id: orderId,
      metadata: { title: planConfig.title },
    });

    const response = await fetch(XUNHUPAY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });

    const result = await response.json();

    if (result.errcode !== 0) {
      return NextResponse.json({ error: result.errmsg || 'Payment creation failed' }, { status: 500 });
    }

    return NextResponse.json({
      payUrl: result.url,
      qrCodeUrl: result.url_qrcode ?? null,
    });
  } catch (error) {
    console.error('Xunhupay create error:', error);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
