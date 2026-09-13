import React, { useState } from 'react';
import {
  Search,
  Shield,
  ShieldCheck,
  Sun,
  Moon,
  CalendarDays
} from 'lucide-react';
import { AdminUser, Language, Theme } from '../types.js';
import { getTranslation } from '../lib/translations.js';
import { BrandLogo } from './BrandLogo.js';

interface HeaderProps {
  categories?: any[];
  selectedCategorySlug?: string | null;
  onSelectCategory?: (slug: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  adminUser: AdminUser | null;
  onHomeClick: () => void;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  onOpenProfile,
  adminUser,
  onHomeClick,
  lang,
  onSelectLanguage,
  theme,
  onToggleTheme,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = (key: any) => getTranslation(lang, key);

  // Localized date formatting
  const dateLocales: Record<Language, string> = {
    uz: 'uz-UZ',
    ru: 'ru-RU',
    en: 'en-US'
  };

  const todayStr = new Intl.DateTimeFormat(dateLocales[lang] || 'uz-UZ', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const languageOptions: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: 'O‘zbek', flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  return (
    <header className="border-b border-stone-200/90 dark:border-stone-800 bg-[#faf9f6]/95 dark:bg-[#141414]/95 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div
            onClick={onHomeClick}
            id="brand-header-link"
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none group min-w-0"
          >
            {/* Visual Emblem Badge from uploaded logo */}
            <BrandLogo size="md" />

            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-2xl md:text-2xl font-black tracking-tight text-stone-950 dark:text-stone-50 font-serif leading-none group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors truncate">
                {t('brandTitle')}
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-medium tracking-wide truncate hidden sm:block mt-0.5">
                {t('brandTagline')}
              </span>
            </div>
          </div>

          {/* Controls & Tools Bar (Search, Date, Theme, Language, Admin) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Date Widget (Desktop only) */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium mr-2 pr-3 border-r border-stone-200 dark:border-stone-800">
              <CalendarDays className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
              <span className="capitalize">{todayStr}</span>
            </div>

            {/* Quick Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              id="header-search-toggle"
              className={`p-2 rounded-xl transition-colors ${
                searchOpen
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 ring-1 ring-red-300 dark:ring-red-900'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800'
              }`}
              title={t('searchStories')}
              aria-label="Toggle search input"
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            {/* Theme Switcher */}
            <button
              onClick={onToggleTheme}
              id="header-theme-toggle"
              className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              title={theme === 'dark' ? t('navThemeLight') : t('navThemeDark')}
              aria-label="Toggle night and day mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-700" />
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                id="header-lang-selector"
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors font-mono uppercase"
                title={t('navLanguage')}
              >
                <span className="text-sm">{languageOptions.find((l) => l.code === lang)?.flag}</span>
                <span className="hidden sm:inline">{lang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => {
                        onSelectLanguage(opt.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-colors ${
                        lang === opt.code
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-bold'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Console & Profile Trigger */}
            {adminUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenProfile}
                  id="admin-profile-trigger"
                  className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium bg-stone-200/70 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors border border-stone-300/80 dark:border-stone-700"
                  title={`${t('profileTitle')}: ${adminUser.username}`}
                >
                  <img
                    src={adminUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={adminUser.username}
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full object-cover ring-1 ring-red-600"
                  />
                  <span className="font-semibold truncate max-w-[70px] sm:max-w-[100px] hidden xs:inline">
                    {adminUser.username}
                  </span>
                </button>

                <button
                  onClick={onOpenAdmin}
                  id="admin-console-trigger"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1"
                  title={t('editorialConsole')}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline">{t('navAdmin')}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdmin}
                id="admin-console-trigger"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80 dark:hover:bg-stone-700 transition-colors"
                title={t('adminLoginTitle')}
              >
                <Shield className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <span className="hidden sm:inline">{t('navAdmin')}</span>
              </button>
            )}

          </div>
        </div>

        {/* Collapsible Search Input for PC and Mobile */}
        {searchOpen && (
          <div className="pb-3.5 pt-1 border-t border-stone-200/70 dark:border-stone-800 animate-in fade-in duration-150">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-12 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-stone-900 dark:text-stone-100 shadow-xs"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                >
                  {t('clear')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
