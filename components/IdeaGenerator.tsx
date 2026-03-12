'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import { useTranslations, useLocale } from 'next-intl';
import type { User } from '@supabase/supabase-js';

interface IdeaGeneratorProps {
  user: User | null;
  isPro: boolean;
  initialUsageToday: number;
}

const FREE_DAILY_LIMIT = 3;

export default function IdeaGenerator({ user, isPro, initialUsageToday }: IdeaGeneratorProps) {
  const t = useTranslations('generator');
  const locale = useLocale();
  const [userBackground, setUserBackground] = useState('');
  const [generatedIdea, setGeneratedIdea] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [usageToday, setUsageToday] = useState(initialUsageToday);
  const [error, setError] = useState('');

  const canGenerate = user && (isPro || usageToday < FREE_DAILY_LIMIT);

  const handleGenerate = async () => {
    if (!userBackground.trim() || !canGenerate) return;
    setIsGenerating(true);
    setGeneratedIdea('');
    setError('');

    try {
      const res = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userBackground }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setGeneratedIdea(data.result);
      if (!isPro) setUsageToday(prev => prev + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="bg-white py-24 border-y border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">{t('title')}</h2>
            <p className="text-gray-600 mb-8 text-lg">{t('description')}</p>
            <div className="space-y-4">
              {['step1', 'step2', 'step3'].map((step, idx) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-600 pt-2">{t(step as 'step1' | 'step2' | 'step3')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F5F5F0] p-8 rounded-[2.5rem] border border-black/5">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="w-12 h-12 text-emerald-600 mb-4" />
                <p className="text-lg font-bold mb-4">{t('loginRequired')}</p>
                <a
                  href={`/${locale}/auth/signup`}
                  className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                >
                  免费注册 / Sign Up Free
                </a>
              </div>
            ) : (
              <>
                {!isPro && (
                  <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                    <span>{t('freeLimit')}</span>
                    <span className="font-bold text-emerald-600">
                      {usageToday} / {FREE_DAILY_LIMIT}
                    </span>
                  </div>
                )}

                <textarea
                  value={userBackground}
                  onChange={(e) => setUserBackground(e.target.value)}
                  placeholder={t('placeholder')}
                  className="w-full h-40 p-6 bg-white rounded-2xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-6 resize-none"
                />

                {!canGenerate && !isPro ? (
                  <div className="w-full py-4 bg-amber-50 border border-amber-200 rounded-2xl text-center text-sm font-bold text-amber-700 mb-4">
                    {t('limitReached')} →{' '}
                    <a href={`/${locale}/pricing`} className="underline hover:text-amber-900">
                      升级 Pro / Upgrade
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !userBackground.trim()}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <Zap className="w-4 h-4" />
                        </motion.div>
                        {t('generatingBtn')}
                      </>
                    ) : (
                      <>{t('generateBtn')} <Zap className="w-4 h-4 fill-current" /></>
                    )}
                  </button>
                )}

                {error && (
                  <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
                )}

                <AnimatePresence>
                  {generatedIdea && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-8 p-6 bg-white rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-900/5"
                    >
                      <div className="flex items-center gap-2 mb-4 text-emerald-600">
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold uppercase tracking-wider">{t('resultTitle')}</span>
                      </div>
                      <div className="prose prose-sm prose-emerald max-w-none markdown-body">
                        <Markdown>{generatedIdea}</Markdown>
                      </div>
                      <button
                        onClick={() => setGeneratedIdea('')}
                        className="mt-6 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                      >
                        {t('clearBtn')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
                  {t('poweredBy')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
