'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Check, Zap, CreditCard, Smartphone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Since this uses useTranslations, we need to wrap with NextIntlClientProvider
// (already done in [locale]/layout.tsx)

export default function PricingPage() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'xunhupay'>('xunhupay');

  const handleUpgrade = async (plan: 'pro_monthly' | 'pro_yearly') => {
    setLoadingPlan(plan);
    try {
      if (paymentMethod === 'stripe') {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, locale }),
        });
        const { url } = await res.json();
        if (url) window.location.href = url;
      } else {
        const res = await fetch('/api/xunhupay/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, locale }),
        });
        const { payUrl } = await res.json();
        if (payUrl) window.location.href = payUrl;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(null);
    }
  };

  const freeFeatures = t.raw('freePlan.features') as string[];
  const proFeatures = t.raw('proPlan.features') as string[];
  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans">
      <Navbar user={null} />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-black' : 'text-gray-400'}`}>{t('monthly')}</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-emerald-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-black' : 'text-gray-400'}`}>
              {t('yearly')} <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{t('saveLabel')}</span>
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPaymentMethod('xunhupay')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${paymentMethod === 'xunhupay' ? 'bg-black text-white border-black' : 'bg-white border-black/10 hover:border-black/30'}`}
            >
              <Smartphone className="w-4 h-4" />
              微信/支付宝 (CNY)
            </button>
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${paymentMethod === 'stripe' ? 'bg-black text-white border-black' : 'bg-white border-black/10 hover:border-black/30'}`}
            >
              <CreditCard className="w-4 h-4" />
              Credit Card (USD)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-10 border border-black/5">
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{t('freePlan.name')}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {paymentMethod === 'stripe' ? t('freePlan.priceUSD') : t('freePlan.price')}
                </span>
                <span className="text-gray-500">{t('freePlan.period')}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {freeFeatures.map((feature: string) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={`/${locale}/auth/signup`}
              className="block w-full text-center py-4 border-2 border-black rounded-2xl font-bold hover:bg-black hover:text-white transition-all"
            >
              {t('freePlan.cta')}
            </a>
          </div>

          {/* Pro Plan */}
          <div className="bg-black text-white rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-500 rounded-full text-xs font-bold">
              {t('proPlan.badge')}
            </div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold">{t('proPlan.name')}</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {paymentMethod === 'stripe'
                    ? (isYearly ? t('proPlan.priceYearlyUSD') : t('proPlan.priceMonthlyUSD'))
                    : (isYearly ? t('proPlan.priceYearly') : t('proPlan.priceMonthly'))
                  }
                </span>
                <span className="text-gray-400">
                  {isYearly ? t('proPlan.periodYearly') : t('proPlan.periodMonthly')}
                </span>
              </div>
            </div>
            <ul className="space-y-4 mb-10">
              {proFeatures.map((feature: string) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(isYearly ? 'pro_yearly' : 'pro_monthly')}
              disabled={!!loadingPlan}
              className="w-full py-4 bg-emerald-600 rounded-2xl font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingPlan ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 跳转中...</>
              ) : t('proPlan.cta')}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{t('faq.title')}</h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl p-6 border border-black/5">
                <h4 className="font-bold mb-2">{q}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
