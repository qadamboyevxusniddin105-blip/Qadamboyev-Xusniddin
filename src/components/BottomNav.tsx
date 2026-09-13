import React, { useState } from 'react';
import {
  Home,
  LayoutGrid,
  Search,
  Sun,
  Moon,
  Globe,
  User,
  Shield,
  ShieldCheck,
  X,
  Sparkles
} from 'lucide-react';
import { Category, AdminUser, Language, Theme } from '../types.js';
import { getTranslation } from '../lib/translations.js';

interface BottomNavProps {
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  onHomeClick: () => void;
  onOpenSearch: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  adminUser: AdminUser | null;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  currentView: 'home' | 'article' | 'admin';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  onHomeClick,
  onOpenSearch,
  theme,
  onToggleTheme,
  lang,
  onSelectLanguage,
  adminUser,
  onOpenProfile,
  onOpenAdmin,
  currentView
}) => {
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const t = (key: any) => getTranslation(lang, key);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: 'O‘zbekcha', flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  return (
    <>
      {/* Categories Popover Drawer */}
      {categoriesDrawerOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setCategoriesDrawerOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 border-t sm:border border-stone-200 dark:border-stone-800 sm:rounded-2xl p-5 shadow-2xl z-10 mb-20 max-h-[75vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-red-700 dark:text-red-400" />
                <h4 className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100">
                  {t('navCategories')}
                </h4>
              </div>
              <button
                onClick={() => setCategoriesDrawerOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectCategory(null);
                  setCategoriesDrawerOpen(false);
                }}
                className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategorySlug === null
                    ? 'bg-red-700 text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {t('allStories')}
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      setCategoriesDrawerOpen(false);
                    }}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.articleCount !== undefined && (
                      <span className="text-[10px] opacity-75 font-mono ml-2">
                        {cat.articleCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Language Popover Menu */}
      {langMenuOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setLangMenuOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-2xl z-10 mb-20 animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-red-600" />
                {t('navLanguage')}
              </span>
              <button
                onClick={() => setLangMenuOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    onSelectLanguage(l.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                    lang === l.code
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-bold border border-red-200 dark:border-red-900'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                  <span className="uppercase text-[10px] tracking-wider text-stone-400 font-mono">
                    {l.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Primary Bottom Navigation Dock */}
      <nav
        id="site-bottom-menu"
        aria-label="Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-30 pointer-events-none pb-safe"
      >
        <div className="max-w-xl mx-auto px-4 pb-3 sm:pb-4 pointer-events-auto">
          <div className="bg-white/92 dark:bg-stone-900/92 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] px-2 py-1.5 flex items-center justify-between transition-colors">
            
            {/* 1. Home */}
            <button
              onClick={() => {
                setCategoriesDrawerOpen(false);
                setLangMenuOpen(false);
                onHomeClick();
              }}
              id="bottom-nav-home"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                currentView === 'home' && selectedCategorySlug === null
                  ? 'text-red-700 dark:text-red-400 font-bold bg-stone-100/80 dark:bg-stone-800/80'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title={t('navHome')}
            >
              <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="text-[10px] tracking-tight mt-0.5">{t('navHome')}</span>
            </button>

            {/* 2. Categories Drawer */}
            <button
              onClick={() => {
                setLangMenuOpen(false);
                setCategoriesDrawerOpen(!categoriesDrawerOpen);
              }}
              id="bottom-nav-categories"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                categoriesDrawerOpen || selectedCategorySlug !== null
                  ? 'text-red-700 dark:text-red-400 font-bold bg-stone-100/80 dark:bg-stone-800/80'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title={t('navCategories')}
            >
              <LayoutGrid className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="text-[10px] tracking-tight mt-0.5">{t('navCategories')}</span>
            </button>

            {/* 3. Search */}
            <button
              onClick={() => {
                setCategoriesDrawerOpen(false);
                setLangMenuOpen(false);
                onOpenSearch();
              }}
              id="bottom-nav-search"
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              title={t('navSearch')}
            >
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="text-[10px] tracking-tight mt-0.5">{t('navSearch')}</span>
            </button>

            {/* 4. Theme Toggle (Kechki / Tongi rejim) */}
            <button
              onClick={onToggleTheme}
              id="bottom-nav-theme-toggle"
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              title={theme === 'dark' ? t('navThemeLight') : t('navThemeDark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-700" />
              )}
              <span className="text-[10px] tracking-tight mt-0.5">
                {theme === 'dark' ? t('navThemeLight') : t('navThemeDark')}
              </span>
            </button>

            {/* 5. Language Switcher (UZ / RU / EN) */}
            <button
              onClick={() => {
                setCategoriesDrawerOpen(false);
                setLangMenuOpen(!langMenuOpen);
              }}
              id="bottom-nav-language"
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              title={t('navLanguage')}
            >
              <div className="flex items-center gap-0.5">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                  {lang}
                </span>
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{t('navLanguage')}</span>
            </button>

            {/* 6. Admin Profile (Faqat adminlar uchun, yoki admin kirish) */}
            <button
              onClick={() => {
                setCategoriesDrawerOpen(false);
                setLangMenuOpen(false);
                onOpenProfile();
              }}
              id="bottom-nav-profile"
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                adminUser
                  ? 'text-red-700 dark:text-red-400 font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
              title={adminUser ? `${t('navProfile')}: ${adminUser.username}` : `${t('navProfile')} (${t('navLogin')})`}
            >
              {adminUser ? (
                <div className="relative">
                  <img
                    src={adminUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={adminUser.username}
                    className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full object-cover ring-2 ring-red-600"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-stone-900" />
                </div>
              ) : (
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
              <span className="text-[10px] tracking-tight mt-0.5">
                {t('navProfile')}
              </span>
            </button>

            {/* 7. Quick Admin Console button if logged in */}
            {adminUser && (
              <button
                onClick={() => {
                  setCategoriesDrawerOpen(false);
                  setLangMenuOpen(false);
                  onOpenAdmin();
                }}
                id="bottom-nav-admin-console"
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                  currentView === 'admin'
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title={t('adminPortal')}
              >
                <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] tracking-tight mt-0.5">{t('navAdmin')}</span>
              </button>
            )}

          </div>
        </div>
      </nav>
    </>
  );
};
