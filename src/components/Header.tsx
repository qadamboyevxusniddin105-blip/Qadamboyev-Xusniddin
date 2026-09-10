import React, { useState } from 'react';
import { Search, Shield, ShieldCheck, Menu, X, Globe, TrendingUp, SunMedium } from 'lucide-react';
import { Category, AdminUser } from '../types.js';

interface HeaderProps {
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAdmin: () => void;
  adminUser: AdminUser | null;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAdmin,
  adminUser,
  onHomeClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="border-b border-stone-200 bg-[#faf9f6] sticky top-0 z-40">
      {/* Top Utility & Security Bar */}
      <div className="border-b border-stone-200/80 bg-stone-100/70 text-xs text-stone-600 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-medium text-stone-800 tracking-wide uppercase">{todayStr}</span>
            <span className="text-stone-300">|</span>
            <span className="hidden sm:flex items-center gap-1 text-stone-500">
              <Globe className="w-3.5 h-3.5" /> International Edition
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-stone-600 pl-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Markets: S&P 500 +0.64% • NASDAQ +0.88% • Brent Crude $74.80</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              id="admin-console-trigger"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                adminUser
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
              title={adminUser ? `Logged in as ${adminUser.username}` : 'Open Admin Console'}
            >
              {adminUser ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Editor Active ({adminUser.username})</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-stone-500" />
                  <span>Admin Console</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead */}
      <div className="px-4 py-4 md:py-6 border-b border-stone-200/90 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-700 hover:text-stone-900 rounded-lg focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="text-center flex-1 cursor-pointer" onClick={onHomeClick}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 font-display">
              THE CHRONICLE
            </h1>
            <p className="text-[11px] sm:text-xs tracking-[0.2em] uppercase font-sans text-stone-500 mt-1">
              Independent Global Journalism & Editorial Intelligence
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-200/70 transition-colors"
              title="Search stories"
              aria-label="Toggle search input"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collapsible Search Input */}
        {searchOpen && (
          <div className="mt-3 pt-3 border-t border-stone-200 animate-in fade-in duration-150">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search across reports, investigations, and analysis..."
                className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-500 shadow-sm"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700 p-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Category Navigation */}
      <nav className="hidden md:block border-b border-stone-200 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
              selectedCategorySlug === null
                ? 'text-stone-900 border-b-2 border-stone-900 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Stories
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'text-stone-900 border-b-2 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                style={{
                  borderBottomColor: isSelected ? cat.color : 'transparent',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Categories</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onSelectCategory(null);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-xs font-medium rounded-lg ${
                selectedCategorySlug === null ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              All Stories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between ${
                  selectedCategorySlug === cat.slug ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                <span>{cat.name}</span>
                {cat.articleCount !== undefined && (
                  <span className="text-[10px] opacity-75">{cat.articleCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 flex justify-between items-center">
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-semibold text-stone-800 flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-stone-600" />
              <span>Admin & Editorial Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
