'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Menu, X, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const switchLocale = (newLocale: string) => {
    router.push(`/${newLocale}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <a href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              AI
            </div>
            <span className="text-xl font-bold tracking-tight">
              {locale === 'zh' ? '赚钱案例库' : 'AI Money Maker'}
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href={`/${locale}#cases`} className="hover:text-emerald-600 transition-colors">{t('analysis')}</a>
            <a href={`/${locale}/pricing`} className="hover:text-emerald-600 transition-colors">{t('pricing')}</a>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 border border-black/10 rounded-full px-2 py-1">
              <button
                onClick={() => switchLocale('zh')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${locale === 'zh' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                中
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${locale === 'en' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <a
                  href={`/${locale}/dashboard`}
                  className="text-sm font-medium hover:text-emerald-600 transition-colors"
                >
                  {t('dashboard')}
                </a>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href={`/${locale}/auth/login`} className="hover:text-emerald-600 transition-colors">
                  {t('login')}
                </a>
                <a
                  href={`/${locale}/auth/signup`}
                  className="bg-black text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-all text-sm font-medium"
                >
                  {t('signup')}
                </a>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href={`/${locale}/pricing`} className="block py-2 text-sm font-medium hover:text-emerald-600">
              {t('pricing')}
            </a>
            {user ? (
              <>
                <a href={`/${locale}/dashboard`} className="block py-2 text-sm font-medium hover:text-emerald-600">
                  {t('dashboard')}
                </a>
                <button onClick={handleLogout} className="block py-2 text-sm font-medium text-gray-500 hover:text-red-500">
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <a href={`/${locale}/auth/login`} className="block py-2 text-sm font-medium hover:text-emerald-600">
                  {t('login')}
                </a>
                <a href={`/${locale}/auth/signup`} className="block py-2 text-sm font-medium hover:text-emerald-600">
                  {t('signup')}
                </a>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => switchLocale('zh')} className={`px-3 py-1 rounded-full text-xs font-bold ${locale === 'zh' ? 'bg-black text-white' : 'border'}`}>中文</button>
              <button onClick={() => switchLocale('en')} className={`px-3 py-1 rounded-full text-xs font-bold ${locale === 'en' ? 'bg-black text-white' : 'border'}`}>English</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
