import React from 'react';
import { Clock, Eye, Sparkles } from 'lucide-react';
import { Article } from '../types.js';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  variant?: 'lead' | 'spotlight' | 'standard' | 'trending' | 'compact';
  rankIndex?: number;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelect,
  variant = 'standard',
  rankIndex,
}) => {
  const publishedDate = new Date(article.publishedAt || article.createdAt);
  const timeAgo = getTimeAgo(publishedDate);

  if (variant === 'lead') {
    return (
      <article
        onClick={() => onSelect(article)}
        className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-6 sm:p-8 rounded-xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="lg:col-span-7 flex flex-col justify-between order-2 lg:order-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {article.isBreaking && (
                <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  <Sparkles className="w-3 h-3" /> Breaking Lead
                </span>
              )}
              <span className="text-xs font-semibold tracking-wider uppercase text-red-800">
                {article.categoryName}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-500">{timeAgo}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-stone-950 group-hover:text-red-900 transition-colors leading-[1.2] mb-4">
              {article.title}
            </h2>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-6 font-serif line-clamp-3">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs text-stone-500">
            <div className="flex items-center gap-2.5">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-7 h-7 rounded-full object-cover border border-stone-200"
              />
              <span className="font-medium text-stone-800">{article.author.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTimeMinutes} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 overflow-hidden rounded-lg aspect-[16/10] bg-stone-100">
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
        className="group cursor-pointer flex flex-col justify-between bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div>
          <div className="overflow-hidden rounded-lg aspect-[16/10] mb-4 bg-stone-100">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-red-800">
              {article.categoryName}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500">{timeAgo}</span>
          </div>

          <h3 className="text-xl font-bold font-serif text-stone-900 group-hover:text-red-900 transition-colors leading-snug mb-2 line-clamp-2">
            {article.title}
          </h3>

          <p className="text-stone-600 text-sm font-serif line-clamp-2 mb-4">
            {article.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
          <span className="font-medium text-stone-700">{article.author.name}</span>
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
        className="group cursor-pointer flex items-start gap-4 py-3.5 border-b border-stone-200 last:border-0 hover:bg-stone-50/70 p-2 rounded-lg transition-colors"
      >
        {rankIndex !== undefined && (
          <span className="text-3xl font-black font-display text-stone-300 group-hover:text-red-800 transition-colors select-none w-8 text-center flex-shrink-0">
            0{rankIndex + 1}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block mb-1">
            {article.categoryName}
          </span>
          <h4 className="text-sm font-serif font-bold text-stone-900 group-hover:text-red-900 transition-colors leading-snug line-clamp-2">
            {article.title}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1.5">
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
      className="group cursor-pointer flex flex-col justify-between bg-white p-5 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div>
        <div className="overflow-hidden rounded-lg aspect-[16/10] mb-4 bg-stone-100">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-red-800">
            {article.categoryName}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-xs text-stone-500">{timeAgo}</span>
        </div>

        <h3 className="text-lg font-bold font-serif text-stone-900 group-hover:text-red-900 transition-colors leading-snug mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-stone-600 text-sm font-serif line-clamp-3 mb-4">
          {article.excerpt}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
        <span className="text-stone-700">{article.author.name}</span>
        <div className="flex items-center gap-3">
          <span>{article.readingTimeMinutes} min</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.views.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
