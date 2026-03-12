import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const FREE_DAILY_LIMIT = 3;

async function callOpenRouter(prompt: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'AI Money Maker',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check usage
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expires_at, ai_usage_today, ai_usage_reset_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const now = new Date();
    const isPro = profile.subscription_tier === 'pro' &&
      (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > now);

    if (!isPro) {
      const today = new Date().toISOString().split('T')[0];
      const resetDay = profile.ai_usage_reset_at
        ? new Date(profile.ai_usage_reset_at).toISOString().split('T')[0]
        : null;
      const usageToday = resetDay === today ? (profile.ai_usage_today || 0) : 0;

      if (usageToday >= FREE_DAILY_LIMIT) {
        return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });
      }

      // Update usage count
      await supabase.from('profiles').update({
        ai_usage_today: usageToday + 1,
        ai_usage_reset_at: today,
      }).eq('id', user.id);
    }

    const { userBackground } = await request.json();
    if (!userBackground?.trim()) {
      return NextResponse.json({ error: 'Missing userBackground' }, { status: 400 });
    }

    const prompt = `你是一个顶级的 AI 商业顾问。用户背景如下：${userBackground}。
      请根据用户的背景，提供 3 个具体的、可落地的 AI 赚钱方案。
      每个方案包含：
      1. 方案名称
      2. 核心逻辑
      3. 推荐工具
      4. 盈利潜力
      5. 第一步行动指南

      请用 Markdown 格式输出。`;

    const result = await callOpenRouter(prompt);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error generating idea:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
