import { useTranslations, useLocale } from 'next-intl';
import { Twitter, Github } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">AI</div>
              <span className="text-xl font-bold tracking-tight">
                {locale === 'zh' ? 'AI 赚钱案例库' : 'AI Money Maker'}
              </span>
            </div>
            <p className="text-gray-500 max-w-sm leading-relaxed">{t('description')}</p>
          </div>
          <div>
            <h5 className="font-bold mb-6">{t('resources')}</h5>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><a href={`/${locale}#cases`} className="hover:text-emerald-600">{t('cases')}</a></li>
              <li><a href={`/${locale}/pricing`} className="hover:text-emerald-600">{t('tools')}</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-6">{t('follow')}</h5>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-emerald-50 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-emerald-50 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">{t('copyright')}</p>
          <div className="flex gap-8 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">{t('privacy')}</a>
            <a href="#" className="hover:text-gray-600">{t('terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
