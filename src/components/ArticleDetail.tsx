import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Calendar,
  Type
} from 'lucide-react';
import { Article, Language } from '../types.js';
import { getTranslation } from '../lib/translations.js';

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  lang?: Language;
  theme?: string;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  relatedArticles,
  onBack,
  onSelectArticle,
  lang = 'uz',
}) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'md' | 'lg'>('md');
  const [scrollProgress, setScrollProgress] = useState(0);

  const t = (key: any) => getTranslation(lang, key);

  // Track reading scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on article switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.slug]);

  const dateLocales: Record<Language, string> = {
    uz: 'uz-UZ',
    ru: 'ru-RU',
    en: 'en-US'
  };

  const publishedDate = new Date(article.publishedAt || article.createdAt);
  const formattedDate = new Intl.DateTimeFormat(dateLocales[lang] || 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(publishedDate);

  const fontSizeClass = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  }[fontSizeLevel];

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#121212] transition-colors duration-200 pb-28">
      {/* Scroll Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-red-700 dark:bg-red-500 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Reader Navigation & Action Bar */}
      <div className="border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-[#181818]/95 backdrop-blur sticky top-0 z-30 px-4 py-2.5 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('backToStories')}</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-1 text-xs border border-stone-200 dark:border-stone-700">
              <span className="px-1.5 text-stone-400">
                <Type className="w-3.5 h-3.5" />
              </span>
              <button
                onClick={() => setFontSizeLevel('sm')}
                className={`px-2 py-0.5 rounded font-medium ${
                  fontSizeLevel === 'sm'
                    ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeLevel('md')}
                className={`px-2 py-0.5 rounded font-medium ${
                  fontSizeLevel === 'md'
                    ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel('lg')}
                className={`px-2 py-0.5 rounded font-medium ${
                  fontSizeLevel === 'lg'
                    ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-stone-100'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Article Content Container */}
      <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Category & Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200/80 dark:border-red-900 px-2.5 py-1 rounded-md">
            {article.categoryName}
          </span>
          {article.status === 'draft' && (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-md">
              {t('statusDraft')}
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-serif text-stone-950 dark:text-stone-100 leading-[1.15] mb-6 tracking-tight">
          {article.title}
        </h1>

        {/* Excerpt / Lead Paragraph */}
        {article.excerpt && (
          <p className="text-xl sm:text-2xl font-serif text-stone-600 dark:text-stone-300 leading-relaxed mb-8 border-l-2 border-red-700 dark:border-red-500 pl-4 italic">
            {article.excerpt}
          </p>
        )}

        {/* Author Byline & Article Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200 dark:border-stone-800 mb-8 text-sm">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-11 h-11 rounded-full object-cover border border-stone-300 dark:border-stone-700 shadow-sm"
            />
            <div>
              <div className="font-bold text-stone-900 dark:text-stone-100">{article.author.name}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400">{article.author.role}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>{article.readingTimeMinutes} {t('minRead')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-full font-medium text-stone-700 dark:text-stone-300">
              <Eye className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>{article.views.toLocaleString()} {t('views')}</span>
            </div>
          </div>
        </div>

        {/* Cover Image & Photographic Caption */}
        <figure className="mb-10">
          <div className="rounded-2xl overflow-hidden bg-stone-200 dark:bg-stone-800 aspect-[16/9] shadow-sm">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {article.coverImageCaption && (
            <figcaption className="text-xs font-sans text-stone-500 dark:text-stone-400 mt-2.5 text-center italic">
              {article.coverImageCaption}
            </figcaption>
          )}
        </figure>

        {/* Article Body Prose (Sanitized Rich HTML) */}
        <div
          className={`article-prose ${fontSizeClass} max-w-none mb-12`}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 mb-12">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              Mavzular / Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles in Same Category */}
        {relatedArticles.length > 0 && (
          <section className="pt-8 border-t-2 border-stone-900 dark:border-stone-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-950 dark:text-stone-100">
                {t('relatedStories')} ({article.categoryName})
              </h3>
              <button
                onClick={onBack}
                className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 hover:underline"
              >
                {t('backToStories')} →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="group cursor-pointer bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="rounded-xl aspect-[16/10] overflow-hidden mb-3 bg-stone-100 dark:bg-stone-800">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {rel.title}
                  </h4>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                    <span>{rel.readingTimeMinutes} {t('minRead')}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {rel.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};
