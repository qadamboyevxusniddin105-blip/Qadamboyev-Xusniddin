import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Mail,
  CheckCircle,
  ArrowRight,
  SearchX
} from 'lucide-react';
import { Article, Category, Language } from '../types.js';
import { ArticleCard } from './ArticleCard.js';
import { getTranslation } from '../lib/translations.js';
import { BrandLogo } from './BrandLogo.js';

interface HomePageProps {
  articles: Article[];
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onSelectArticle: (article: Article) => void;
  onOpenAdmin: () => void;
  lang?: Language;
}

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  categories,
  selectedCategorySlug,
  onSelectCategory,
  searchQuery,
  onClearSearch,
  onSelectArticle,
  onOpenAdmin,
  lang = 'uz',
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const t = (key: any) => getTranslation(lang, key);

  // Filter articles based on category and search
  const filteredArticles = articles.filter((article) => {
    if (selectedCategorySlug) {
      const cat = categories.find((c) => c.slug === selectedCategorySlug);
      if (cat && article.categoryId !== cat.id) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        (article.tags && article.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 3000);
  };

  // Find breaking lead or highest view article
  const leadArticle = filteredArticles.find((a) => a.isBreaking || a.isFeatured) || filteredArticles[0];
  const secondaryArticles = filteredArticles.filter((a) => a.id !== leadArticle?.id).slice(0, 2);
  const remainingArticles = filteredArticles.filter(
    (a) => a.id !== leadArticle?.id && !secondaryArticles.some((s) => s.id === a.id)
  );

  // Trending articles sorted by view counts
  const trendingArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const activeCategory = selectedCategorySlug
    ? categories.find((c) => c.slug === selectedCategorySlug)
    : null;

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#121212] transition-colors duration-200 pb-28">
      
      {/* Category Pills Filter Bar (Horizontal Smooth Scroll for PC and Mobile) */}
      <div className="border-b border-stone-200/80 dark:border-stone-800 bg-[#faf9f6]/95 dark:bg-[#121212]/95 backdrop-blur-md sticky top-14 sm:top-16 md:top-20 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-0.5 scrollbar-none">
            <button
              onClick={() => onSelectCategory(null)}
              id="category-pill-all"
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategorySlug === null
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80 dark:hover:bg-stone-700'
              }`}
            >
              {t('allStories')}
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  id={`category-pill-${cat.slug}`}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300/80 dark:hover:bg-stone-700'
                  }`}
                >
                  {cat.name}
                  {cat.articleCount !== undefined && cat.articleCount > 0 && (
                    <span className="ml-1.5 opacity-75 text-[10px] font-mono">
                      {cat.articleCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Breaking News Ribbon */}
      {leadArticle?.isBreaking && !searchQuery && !selectedCategorySlug && (
        <div className="bg-red-700 text-white px-3 sm:px-4 py-2 text-xs font-semibold tracking-wide shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="bg-white text-red-800 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex-shrink-0 animate-pulse">
                {t('breakingLead')}
              </span>
              <span
                onClick={() => onSelectArticle(leadArticle)}
                className="truncate cursor-pointer hover:underline text-xs sm:text-sm"
              >
                {leadArticle.title}
              </span>
            </div>
            <button
              onClick={() => onSelectArticle(leadArticle)}
              className="text-[11px] font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1 hover:underline"
            >
              <span className="hidden xs:inline">{t('minRead')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Category Header Banner if Category Selected */}
      {activeCategory && (
        <div className="bg-stone-100/70 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 px-3 sm:px-6 py-6 sm:py-8 mb-6 sm:mb-8 transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeCategory.color || '#b91c1c' }} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                {t('navCategories')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-stone-950 dark:text-stone-100 mb-2">
              {activeCategory.name}
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm font-serif max-w-2xl">
              {activeCategory.description || 'Eng so‘nggi xabarlar, rasmiy ma’lumotlar va tahliliy maqolalar.'}
            </p>
          </div>
        </div>
      )}

      {/* Search Header Banner if Search Active */}
      {searchQuery && (
        <div className="bg-stone-100/70 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 px-3 sm:px-6 py-5 sm:py-6 mb-6 sm:mb-8 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                {t('searchResultsFor')}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-0.5">
                {filteredArticles.length} ta natija &ldquo;{searchQuery}&rdquo;
              </h2>
            </div>
            <button
              onClick={onClearSearch}
              className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 hover:underline flex-shrink-0"
            >
              {t('clear')} ×
            </button>
          </div>
        </div>
      )}

      {/* Main News Layout */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {filteredArticles.length === 0 ? (
          <div className="py-16 sm:py-24 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-stone-200 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto text-stone-500 dark:text-stone-400">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              {t('noArticlesFound')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t('noArticlesDesc')}
            </p>
            <button
              onClick={() => {
                onClearSearch();
                onSelectCategory(null);
              }}
              className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              {t('allStories')}
            </button>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* Lead Story & Top Spotlight Section */}
            {!selectedCategorySlug && !searchQuery && leadArticle && (
              <section className="space-y-6">
                {/* Main Hero Card */}
                <ArticleCard
                  article={leadArticle}
                  onSelect={onSelectArticle}
                  variant="lead"
                  lang={lang}
                />

                {/* Secondary 2-Column Split */}
                {secondaryArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                    {secondaryArticles.map((art) => (
                      <ArticleCard
                        key={art.id}
                        article={art}
                        onSelect={onSelectArticle}
                        variant="spotlight"
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Two-Column Section: Latest Dispatches vs. Trending Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-4 border-t border-stone-200 dark:border-stone-800">
              {/* Left Column: Remaining Standard Articles */}
              <section className="lg:col-span-8 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between pb-3 border-b-2 border-stone-900 dark:border-stone-700">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                    {selectedCategorySlug
                      ? `${activeCategory?.name || 'Kategoriya'}`
                      : searchQuery
                      ? t('searchResultsFor')
                      : t('latestDispatches')}
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    {filteredArticles.length} ta maqola
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {(selectedCategorySlug || searchQuery ? filteredArticles : remainingArticles).map(
                    (art) => (
                      <ArticleCard
                        key={art.id}
                        article={art}
                        onSelect={onSelectArticle}
                        variant="standard"
                        lang={lang}
                      />
                    )
                  )}
                </div>
              </section>

              {/* Right Column: Trending / Most Read Sidebar */}
              <aside className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-stone-200 dark:border-stone-800">
                    <TrendingUp className="w-4 h-4 text-red-700 dark:text-red-400" />
                    <h3 className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                      {t('trendingSection')}
                    </h3>
                  </div>

                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {trendingArticles.map((art, idx) => (
                      <ArticleCard
                        key={art.id}
                        article={art}
                        onSelect={onSelectArticle}
                        variant="trending"
                        rankIndex={idx}
                        lang={lang}
                      />
                    ))}
                  </div>
                </div>

                {/* Newsletter Subscription Box */}
                <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-xs space-y-4">
                  <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold font-serif">Kunlik Tahririyat Axborotnomasi</h4>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      Ertalabki eng muhim tahliliy maqolalar va dolzarb xabarlar to‘g‘ridan-to‘g‘ri pochtangizda.
                    </p>
                  </div>

                  {newsletterSubscribed ? (
                    <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Rahmat! Obuna muvaffaqiyatli rasmiylashtirildi.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                      <input
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="pochta@misol.uz"
                        required
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                      >
                        Obuna Bo‘lish
                      </button>
                    </form>
                  )}
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-xs text-stone-600 dark:text-stone-400 transition-colors mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" />
              <h4 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {t('brandTitle')}
              </h4>
            </div>
            <p className="text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm text-xs">
              {t('brandTagline')}. Xolis tahlil, ishonchli manbalar va dolzarb ma’lumotlar.
            </p>
            <div className="text-[11px] text-stone-400 dark:text-stone-500">
              OWASP Top 10 xavfsizlik arxitekturasi asosida himoyalangan • Single-Admin Verified
            </div>
          </div>

          <div className="md:col-span-4 space-y-2">
            <div className="font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-2">
              {t('navCategories')}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCategory(c.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-2">
              {t('adminPortal')}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Tahririyat CMS boshqaruvi faqat vakolatli yagona administrator uchun ochiq.
            </p>
            <button
              onClick={onOpenAdmin}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold rounded-xl text-xs transition-colors"
            >
              <span>{t('adminLoginTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-800 py-4 px-4 text-center text-[11px] text-stone-500 dark:text-stone-500">
          © {new Date().getFullYear()} Xusniddin coder. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  );
};
