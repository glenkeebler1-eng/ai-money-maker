'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Zap, ChevronRight, X, ExternalLink, Lock } from 'lucide-react';
import Markdown from 'react-markdown';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { AI_CASES, type AICase } from '@/src/constants';
import type { User } from '@supabase/supabase-js';

const ICON_MAP: Record<string, React.ReactNode> = {
  Mail: <span className="text-lg">📧</span>,
  Camera: <span className="text-lg">📷</span>,
  Search: <span className="text-lg">🔍</span>,
  Layout: <span className="text-lg">📊</span>,
  Cpu: <span className="text-lg">🤖</span>,
};

interface CasesSectionProps {
  user: User | null;
  isPro: boolean;
}

export default function CasesSection({ user, isPro }: CasesSectionProps) {
  const t = useTranslations('cases');
  const locale = useLocale();
  const [selectedCase, setSelectedCase] = useState<AICase | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = [t('all'), ...new Set(AI_CASES.map(c => c.category))];
  const filteredCases = AI_CASES.filter(c => {
    const matchFilter = filter === t('all') || filter === 'All' || c.category === filter;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.summary.includes(search);
    return matchFilter && matchSearch;
  });

  const canViewFull = (caseItem: AICase, idx: number) => {
    // First case is always free, rest require Pro
    return isPro || idx === 0;
  };

  return (
    <section id="cases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                filter === cat || (filter === 'All' && cat === t('all'))
                  ? 'bg-black text-white'
                  : 'bg-white border border-black/5 hover:border-black/20'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-10 pr-4 py-2 bg-white border border-black/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCases.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedCase(item)}
            className="group bg-white rounded-3xl p-8 border border-black/5 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all cursor-pointer relative overflow-hidden"
          >
            {!canViewFull(item, idx) && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-xs font-bold">
                <Lock className="w-3 h-3" />
                Pro
              </div>
            )}
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {ICON_MAP[item.icon] || <Zap className="w-6 h-6" />}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{t('difficulty')}</span>
                <span className={cn(
                  'text-xs font-bold px-2 py-1 rounded-md',
                  item.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  item.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {item.difficulty}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
            <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{item.summary}</p>
            <div className="flex items-center justify-between pt-6 border-t border-black/5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{t('profitLabel')}</p>
                <p className="font-bold text-emerald-600">{item.potential}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Case Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCase(null)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden relative z-10 flex flex-col"
            >
              <button
                onClick={() => setSelectedCase(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {selectedCase.category}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500 font-medium">{t('deepAnalysis')}</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">{selectedCase.title}</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="bg-[#F5F5F0] p-6 rounded-3xl">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t('difficulty')}</p>
                    <p className="text-xl font-bold">{selectedCase.difficulty}</p>
                  </div>
                  <div className="bg-[#F5F5F0] p-6 rounded-3xl">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t('profitabilityLabel')}</p>
                    <p className="text-xl font-bold text-emerald-600">{selectedCase.potential}</p>
                  </div>
                  <div className="bg-[#F5F5F0] p-6 rounded-3xl">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">{t('tools')}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCase.tools.slice(0, 2).map(tool => (
                        <span key={tool} className="text-xs font-bold bg-white px-2 py-1 rounded-lg border border-black/5">{tool}</span>
                      ))}
                      {selectedCase.tools.length > 2 && <span className="text-xs font-bold">+{selectedCase.tools.length - 2}</span>}
                    </div>
                  </div>
                </div>

                {/* Gated content */}
                {!isPro && AI_CASES.findIndex(c => c.id === selectedCase.id) > 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100">
                    <Lock className="w-12 h-12 text-amber-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t('proOnly')}</h3>
                    <p className="text-gray-500 text-center mb-6 max-w-sm">{t('proOnlyDesc')}</p>
                    <a
                      href={`/${locale}/pricing`}
                      className="px-8 py-3 bg-black text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                    >
                      {t('upgradeBtn')}
                    </a>
                  </div>
                ) : (
                  <div className="prose prose-emerald max-w-none">
                    <div className="markdown-body">
                      <Markdown>{selectedCase.fullAnalysis}</Markdown>
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-12 border-t border-black/5">
                  <h4 className="font-bold mb-4">{t('toolbox')}</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedCase.tools.map(tool => (
                      <div key={tool} className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer">
                        <span className="text-sm font-medium">{tool}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 bg-black text-white p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-xl font-bold mb-2">{t('ctaTitle')}</h4>
                    <p className="text-gray-400 text-sm">{t('ctaDesc')}</p>
                  </div>
                  <a
                    href={`/${locale}/pricing`}
                    className="whitespace-nowrap px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-colors"
                  >
                    {t('ctaBtn')}
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
