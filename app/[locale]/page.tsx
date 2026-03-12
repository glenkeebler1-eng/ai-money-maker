import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import CasesSection from '@/components/CasesSection';
import IdeaGenerator from '@/components/IdeaGenerator';
import Footer from '@/components/Footer';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('hero');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  let usageToday = 0;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expires_at, ai_usage_today, ai_usage_reset_at')
      .eq('id', user.id)
      .single();

    if (profile) {
      const now = new Date();
      const isActive = profile.subscription_tier === 'pro' &&
        (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > now);
      isPro = isActive;

      // Reset daily usage if needed
      const resetDate = profile.ai_usage_reset_at ? new Date(profile.ai_usage_reset_at) : null;
      const today = new Date().toISOString().split('T')[0];
      const resetDay = resetDate?.toISOString().split('T')[0];
      usageToday = resetDay === today ? (profile.ai_usage_today || 0) : 0;
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      <Navbar user={user} />

      {/* Hero */}
      <header className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
              <TrendingUp className="w-3 h-3" />
              {t('badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-8">
              {t('title')}<br />
              <span className="text-emerald-600 italic serif">{t('titleHighlight')}</span>{' '}
              {t('titleSuffix')}
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              {t('description')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#cases"
                className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                {t('exploreBtn')} <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href={`/${locale}/pricing`}
                className="px-8 py-4 bg-white border border-black/10 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
              >
                {locale === 'zh' ? '查看价格' : 'View Pricing'}
              </a>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-3xl -z-0" />
      </header>

      <CasesSection user={user} isPro={isPro} />
      <IdeaGenerator user={user} isPro={isPro} initialUsageToday={usageToday} />
      <Footer />
    </div>
  );
}
