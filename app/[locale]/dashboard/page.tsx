import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Crown, Zap, Calendar, ArrowRight } from 'lucide-react';

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth/login`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_expires_at, ai_usage_today, ai_usage_reset_at')
    .eq('id', user.id)
    .single();

  const now = new Date();
  const isPro = profile?.subscription_tier === 'pro' &&
    (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > now);

  const today = new Date().toISOString().split('T')[0];
  const resetDay = profile?.ai_usage_reset_at
    ? new Date(profile.ai_usage_reset_at).toISOString().split('T')[0]
    : null;
  const usageToday = resetDay === today ? (profile?.ai_usage_today || 0) : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans">
      <Navbar user={user} />

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-500 mb-10">{user.email}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Plan */}
          <div className="bg-white rounded-3xl p-6 border border-black/5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className={`w-5 h-5 ${isPro ? 'text-amber-500' : 'text-gray-400'}`} />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('plan')}</span>
            </div>
            <p className="text-2xl font-bold">
              {isPro ? 'Pro' : (locale === 'zh' ? '免费版' : 'Free')}
            </p>
          </div>

          {/* AI Usage */}
          <div className="bg-white rounded-3xl p-6 border border-black/5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('usageToday')}</span>
            </div>
            <p className="text-2xl font-bold">
              {isPro ? (
                <span className="text-emerald-600">{t('unlimited')}</span>
              ) : (
                <>{usageToday} <span className="text-gray-400 text-base font-normal">/ 3</span></>
              )}
            </p>
          </div>

          {/* Expiry */}
          {isPro && profile?.subscription_expires_at && (
            <div className="bg-white rounded-3xl p-6 border border-black/5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('subscriptionExpires')}</span>
              </div>
              <p className="text-2xl font-bold">
                {new Date(profile.subscription_expires_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
              </p>
            </div>
          )}
        </div>

        {!isPro && (
          <div className="bg-black text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{t('upgradePrompt')}</h3>
              <p className="text-gray-400 text-sm">
                {locale === 'zh'
                  ? '解锁全部案例深度解析 + 无限 AI 生成方案'
                  : 'Unlock all deep case analyses + unlimited AI generation'
                }
              </p>
            </div>
            <a
              href={`/${locale}/pricing`}
              className="flex items-center gap-2 px-8 py-4 bg-emerald-600 rounded-2xl font-bold hover:bg-emerald-500 transition-colors whitespace-nowrap"
            >
              {t('upgradeBtn')} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {isPro && (
          <div className="bg-white rounded-3xl p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-bold">
                {locale === 'zh' ? 'Pro 会员权益' : 'Pro Member Benefits'}
              </h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              {['✅ 所有案例深度解析已解锁', '✅ 无限 AI 变现方案生成', '✅ 优先客户支持'].map(b => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
