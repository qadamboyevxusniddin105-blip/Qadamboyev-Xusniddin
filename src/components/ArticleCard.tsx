import React from 'react';
import { Clock, Eye, Sparkles } from 'lucide-react';
import { Article, Language } from '../types.js';
import { getTranslation, getTimeAgo } from '../lib/translations.js';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  variant?: 'lead' | 'spotlight' | 'standard' | 'trending' | 'compact';
  rankIndex?: number;
  lang?: Language;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelect,
  variant = 'standard',
  rankIndex,
  lang = 'uz',
}) => {
  const t = (key: any) => getTranslation(lang, key);
  const publishedDate = new Date(article.publishedAt || article.createdAt);
  const timeAgo = getTimeAgo(publishedDate, lang);

  if (variant === 'lead') {
    return (
      <article
        onClick={() => onSelect(article)}
        className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="lg:col-span-7 flex flex-col justify-between order-2 lg:order-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {article.isBreaking && (
                <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" /> {t('breakingLead')}
                </span>
              )}
              <span className="text-xs font-semibold tracking-wider uppercase text-red-700 dark:text-red-400">
                {article.categoryName}
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">{timeAgo}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-stone-950 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors leading-[1.2] mb-4">
              {article.title}
            </h2>

            <p className="text-stone-600 dark:text-stone-300 text-base sm:text-lg leading-relaxed mb-6 font-serif line-clamp-3">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-2.5">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-stone-700"
              />
              <span className="font-medium text-stone-800 dark:text-stone-200">{article.author.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTimeMinutes} {t('minRead')}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views.toLocaleString()} {t('views')}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 overflow-hidden rounded-xl aspect-[16/10] bg-stone-100 dark:bg-stone-800">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </article>
    );
  }

  if (variant === 'spotlight') {
    return (
      <article
        onClick={() => onSelect(article)}
        className="group cursor-pointer flex flex-col justify-between bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div>
          <div className="overflow-hidden rounded-xl aspect-[16/10] mb-4 bg-stone-100 dark:bg-stone-800">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-red-700 dark:text-red-400">
              {article.categoryName}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">{timeAgo}</span>
          </div>

          <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors leading-snug mb-2 line-clamp-2">
            {article.title}
          </h3>

          <p className="text-stone-600 dark:text-stone-300 text-sm font-serif line-clamp-2 mb-4">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-3 border-t border-stone-100 dark:border-stone-800">
          <span className="font-medium text-stone-700 dark:text-stone-300">{article.author.name}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {article.views.toLocaleString()}
          </span>
        </div>
      </article>
    );
  }

  if (variant === 'trending') {
    return (
      <article
        onClick={() => onSelect(article)}
        className="group cursor-pointer flex items-start gap-4 py-3.5 border-b border-stone-200 dark:border-stone-800 last:border-0 hover:bg-stone-50/70 dark:hover:bg-stone-800/50 p-2 rounded-xl transition-colors"
      >
        {rankIndex !== undefined && (
          <span className="text-3xl font-black font-display text-stone-300 dark:text-stone-700 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors select-none w-8 text-center flex-shrink-0">
            0{rankIndex + 1}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block mb-1">
            {article.categoryName}
          </span>
          <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors leading-snug line-clamp-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
            <span>{timeAgo}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Grid Card
  return (
    <article
      onClick={() => onSelect(article)}
      className="group cursor-pointer flex flex-col justify-between bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div>
        <div className="overflow-hidden rounded-xl aspect-[16/10] mb-4 bg-stone-100 dark:bg-stone-800">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-red-700 dark:text-red-400">
            {article.categoryName}
          </span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="text-xs text-stone-500 dark:text-stone-400">{timeAgo}</span>
        </div>

        <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors leading-snug mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-stone-600 dark:text-stone-300 text-sm font-serif line-clamp-3 mb-4">
          {article.excerpt}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-3 border-t border-stone-100 dark:border-stone-800">
        <span className="text-stone-700 dark:text-stone-300 font-medium">{article.author.name}</span>
        <div className="flex items-center gap-3">
          <span>{article.readingTimeMinutes} {t('minRead')}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.views.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
};

