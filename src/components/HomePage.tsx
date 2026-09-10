import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Mail,
  CheckCircle,
  Clock,
  Eye,
  ArrowRight,
  Filter,
  SearchX
} from 'lucide-react';
import { Article, Category } from '../types.js';
import { ArticleCard } from './ArticleCard.js';

interface HomePageProps {
  articles: Article[];
  categories: Category[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  searchQuery: string;
  onClearSearch: () => void;
  onSelectArticle: (article: Article) => void;
  onOpenAdmin: () => void;
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
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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
    .slice(0, 4);

  const activeCategory = selectedCategorySlug
    ? categories.find((c) => c.slug === selectedCategorySlug)
    : null;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Breaking News Ribbon */}
      {leadArticle?.isBreaking && !searchQuery && !selectedCategorySlug && (
        <div className="bg-red-700 text-white px-4 py-2 text-xs font-semibold tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="bg-white text-red-800 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-widest flex-shrink-0 animate-pulse">
                Breaking Alert
              </span>
              <span
                onClick={() => onSelectArticle(leadArticle)}
                className="truncate cursor-pointer hover:underline"
              >
                {leadArticle.title}
              </span>
            </div>
            <button
              onClick={() => onSelectArticle(leadArticle)}
              className="text-[11px] font-bold uppercase tracking-wider flex-shrink-0 flex items-center gap-1 hover:underline"
            >
              <span>Full Report</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Category Header Banner if Category Selected */}
      {activeCategory && (
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeCategory.color }} />
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                Editorial Dossier
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-950 mb-2">
              {activeCategory.name}
            </h2>
            <p className="text-stone-600 text-sm font-serif max-w-2xl">
              {activeCategory.description || 'Comprehensive reporting, analysis, and dispatches.'}
            </p>
          </div>
        </div>
      )}

      {/* Search Header Banner if Search Active */}
      {searchQuery && (
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-6 mb-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
                Search Results
              </span>
              <h2 className="text-2xl font-bold font-serif text-stone-900 mt-1">
                Showing {filteredArticles.length} story matches for &ldquo;{searchQuery}&rdquo;
              </h2>
            </div>
            <button
              onClick={onClearSearch}
              className="text-xs font-semibold uppercase tracking-wider text-red-800 hover:underline"
            >
              Clear Search ×
            </button>
          </div>
        </div>
      )}

      {/* Main News Layout */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredArticles.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mx-auto text-stone-500">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-stone-900">No Stories Discovered</h3>
            <p className="text-xs text-stone-500">
              We couldn't find any news reports matching your search or category filter.
            </p>
            <button
              onClick={() => {
                onClearSearch();
                onSelectCategory(null);
              }}
              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Lead Story & Top Spotlight Section */}
            {!selectedCategorySlug && !searchQuery && leadArticle && (
              <section className="space-y-6">
                {/* Main Hero Card */}
                <ArticleCard
                  article={leadArticle}
                  onSelect={onSelectArticle}
                  variant="lead"
                />

                {/* Secondary Spotlights & Trending Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* 2 Spotlights in 8 cols */}
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {secondaryArticles.map((art) => (
                      <ArticleCard
                        key={art.id}
                        article={art}
                        onSelect={onSelectArticle}
                        variant="spotlight"
                      />
                    ))}
                  </div>

                  {/* Trending / Most Read Column in 4 cols */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs h-fit">
                    <div className="flex items-center gap-2 pb-3 border-b border-stone-200 mb-2">
                      <TrendingUp className="w-4 h-4 text-red-700" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 font-sans">
                        Most Read Across Chronicle
                      </h3>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {trendingArticles.map((art, idx) => (
                        <ArticleCard
                          key={art.id}
                          article={art}
                          onSelect={onSelectArticle}
                          variant="trending"
                          rankIndex={idx}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* General Articles Grid */}
            <section className="pt-8 border-t-2 border-stone-900">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold font-serif text-stone-950">
                    {selectedCategorySlug
                      ? `${activeCategory?.name} Feed`
                      : searchQuery
                      ? 'Search Results'
                      : 'Latest Dispatches & Analysis'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Investigative reporting, verified sourcing, and global perspectives.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedCategorySlug || searchQuery ? filteredArticles : remainingArticles).map(
                  (article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onSelect={onSelectArticle}
                      variant="standard"
                    />
                  )
                )}
              </div>
            </section>

            {/* Newsletter Dispatch Section */}
            <section className="bg-stone-900 text-stone-100 rounded-2xl p-8 sm:p-12 border border-stone-800 relative overflow-hidden">
              <div className="max-w-2xl relative z-10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  The Daily Dispatch
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif leading-tight">
                  Independent global briefings, delivered every morning at 06:00 UTC.
                </h3>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Join 120,000+ diplomatic envoys, institutional analysts, and business leaders. No sponsored clutter, no speculative gossip—just rigorous journalism.
                </p>

                {newsletterSubscribed ? (
                  <div className="p-4 bg-emerald-900/60 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>You are subscribed to The Daily Dispatch. Check your inbox for the morning brief.</span>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md pt-2">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your corporate or personal email..."
                      className="flex-1 px-4 py-3 text-xs bg-stone-800/90 border border-stone-700 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-stone-300 bg-stone-100 mt-20 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <h4 className="text-2xl font-bold font-display text-stone-900">THE CHRONICLE</h4>
            <p className="text-stone-500 leading-relaxed max-w-sm">
              An independent newspaper and editorial publication dedicated to investigative depth, geopolitical insight, and technological clarity.
            </p>
            <div className="text-[11px] text-stone-400">
              Protected by OWASP Top 10 Security Architecture • Single-Admin Verified
            </div>
          </div>

          <div className="md:col-span-4 space-y-2">
            <div className="font-bold uppercase tracking-wider text-stone-900 mb-2">Sections</div>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCategory(c.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left text-stone-600 hover:text-stone-950 transition-colors"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <div className="font-bold uppercase tracking-wider text-stone-900 mb-2">Admin Portal</div>
            <p className="text-[11px] text-stone-500">
              Editorial CMS access is strictly restricted to designated administrative credentials.
            </p>
            <button
              onClick={onOpenAdmin}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded text-xs transition-colors"
            >
              <span>Editorial Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="border-t border-stone-200 py-4 px-4 text-center text-[11px] text-stone-500">
          © {new Date().getFullYear()} The Chronicle Publishing Group. All editorial rights reserved.
        </div>
      </footer>
    </div>
  );
};
