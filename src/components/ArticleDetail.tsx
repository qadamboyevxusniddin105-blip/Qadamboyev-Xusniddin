import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Eye,
  Share2,
  Check,
  Twitter,
  Linkedin,
  Bookmark,
  Calendar,
  Type,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Article } from '../types.js';

interface ArticleDetailProps {
  article: Article;
  relatedArticles: Article[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  relatedArticles,
  onBack,
  onSelectArticle,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<'sm' | 'md' | 'lg'>('md');
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`"${article.title}" - via The Chronicle`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const publishedDate = new Date(article.publishedAt || article.createdAt);
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short'
  }).format(publishedDate);

  const fontSizeClass = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  }[fontSizeLevel];

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Scroll Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-red-700 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Reader Navigation & Action Bar */}
      <div className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Front Page</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center bg-stone-100 rounded-lg p-1 text-xs border border-stone-200">
              <span className="px-1.5 text-stone-400">
                <Type className="w-3.5 h-3.5" />
              </span>
              <button
                onClick={() => setFontSizeLevel('sm')}
                className={`px-2 py-0.5 rounded font-medium ${
                  fontSizeLevel === 'sm' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeLevel('md')}
                className={`px-2 py-0.5 rounded font-medium ${
                  fontSizeLevel === 'md' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel('lg')}
                className={`px-2 py-0.5 rounded font-medium ${
                  fontSizeLevel === 'lg' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                A+
              </button>
            </div>

            {/* Share Menu */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyLink}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors flex items-center gap-1 text-xs font-medium"
                title="Copy article link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden md:inline">{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="p-1.5 text-stone-600 hover:text-sky-600 hover:bg-stone-100 rounded transition-colors"
                title="Share on X / Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="p-1.5 text-stone-600 hover:text-blue-700 hover:bg-stone-100 rounded transition-colors"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Article Content Container */}
      <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Category & Status */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-red-800 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded">
            {article.categoryName}
          </span>
          {article.status === 'draft' && (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
              Draft Preview
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-serif text-stone-950 leading-[1.15] mb-6 tracking-tight">
          {article.title}
        </h1>

        {/* Excerpt / Lead Paragraph */}
        {article.excerpt && (
          <p className="text-xl sm:text-2xl font-serif text-stone-600 leading-relaxed mb-8 border-l-2 border-red-700 pl-4 italic">
            {article.excerpt}
          </p>
        )}

        {/* Author Byline & Article Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200 mb-8 text-sm">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-11 h-11 rounded-full object-cover border border-stone-300"
            />
            <div>
              <div className="font-bold text-stone-900">{article.author.name}</div>
              <div className="text-xs text-stone-500">{article.author.role}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>{article.readingTimeMinutes} min read</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-full font-medium text-stone-700">
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>{article.views.toLocaleString()} reads</span>
            </div>
          </div>
        </div>

        {/* Cover Image & Photographic Caption */}
        <figure className="mb-10">
          <div className="rounded-xl overflow-hidden bg-stone-200 aspect-[16/9] shadow-sm">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {article.coverImageCaption && (
            <figcaption className="text-xs font-sans text-stone-500 mt-2.5 text-center italic">
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
          <div className="pt-6 border-t border-stone-200 mb-12">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Filed Under Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-stone-100 text-stone-700 px-3 py-1 rounded-full border border-stone-200 hover:bg-stone-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Editorial Integrity & Standards Notice */}
        <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-5 mb-14 text-xs text-stone-600 space-y-2">
          <div className="font-bold uppercase tracking-wider text-stone-800">
            The Chronicle Editorial Standard
          </div>
          <p>
            All reporting adheres to strict fact-checking protocols, independent sourcing, and verified attributions. Corrections or factual clarifications are appended transparently.
          </p>
        </div>

        {/* Related Articles in Same Category */}
        {relatedArticles.length > 0 && (
          <section className="pt-8 border-t-2 border-stone-900">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-950">
                More in {article.categoryName}
              </h3>
              <button
                onClick={onBack}
                className="text-xs font-bold uppercase tracking-wider text-red-800 hover:underline"
              >
                View all stories →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="group cursor-pointer bg-white p-4 rounded-lg border border-stone-200 shadow-xs hover:shadow-sm transition-all"
                >
                  <div className="rounded aspect-[16/10] overflow-hidden mb-3 bg-stone-100">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-sm font-bold font-serif text-stone-900 group-hover:text-red-900 transition-colors line-clamp-2 mb-2 leading-snug">
                    {rel.title}
                  </h4>
                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span>{rel.readingTimeMinutes} min read</span>
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
