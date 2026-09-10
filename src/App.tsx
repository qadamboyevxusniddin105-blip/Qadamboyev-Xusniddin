import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { HomePage } from './components/HomePage.js';
import { ArticleDetail } from './components/ArticleDetail.js';
import { AdminPanel } from './components/AdminPanel.js';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal.js';
import { Article, Category, AdminUser, SecurityStatus } from './types.js';
import { api } from './lib/api.js';

export default function App() {
  const [view, setView] = useState<'home' | 'article' | 'admin'>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data and verify any existing admin session
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [cats, arts, me, sec] = await Promise.all([
          api.getCategories(),
          api.getArticles(),
          api.getMe(),
          api.getSecurityStatus(),
        ]);
        setCategories(cats);
        setArticles(arts);
        if (me && me.user) {
          setAdminUser(me.user);
        }
        setSecurityStatus(sec);
      } catch (err) {
        console.error('Failed to initialize application data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Listen for hash changes for back/forward navigation
  useEffect(() => {
    const handleHash = async () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('news/')) {
        const slug = hash.replace('news/', '');
        const art = await api.getArticleBySlug(slug);
        if (art) {
          setSelectedArticle(art);
          setView('article');
        }
      } else if (hash === 'admin') {
        setView('admin');
      } else if (hash.startsWith('category/')) {
        const catSlug = hash.replace('category/', '');
        setSelectedCategorySlug(catSlug);
        setView('home');
      } else {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const refreshArticles = async () => {
    try {
      const arts = await api.getArticles({
        category: selectedCategorySlug || undefined,
        search: searchQuery || undefined,
      });
      setArticles(arts);
    } catch (err) {
      console.error('Failed to refresh articles', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed to refresh categories', err);
    }
  };

  const handleSelectArticle = async (article: Article) => {
    // Fetch full article from API to trigger server view increment
    try {
      const fresh = await api.getArticleBySlug(article.slug);
      setSelectedArticle(fresh || article);
    } catch {
      setSelectedArticle(article);
    }
    setView('article');
    window.location.hash = `news/${article.slug}`;
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedArticle(null);
    window.location.hash = '';
  };

  const handleSelectCategory = (slug: string | null) => {
    setSelectedCategorySlug(slug);
    setView('home');
    setSelectedArticle(null);
    if (slug) {
      window.location.hash = `category/${slug}`;
    } else {
      window.location.hash = '';
    }
  };

  const handleOpenAdmin = () => {
    setView('admin');
    window.location.hash = 'admin';
  };

  const handleCloseAdmin = () => {
    setView('home');
    window.location.hash = '';
    refreshArticles();
    refreshCategories();
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    refreshArticles();
  };

  const handleLogout = async () => {
    await api.logout();
    setAdminUser(null);
    setView('home');
    window.location.hash = '';
    refreshArticles();
  };

  // Find related articles for current article
  const relatedArticles = selectedArticle
    ? articles
        .filter((a) => a.categoryId === selectedArticle.categoryId && a.id !== selectedArticle.id)
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-100 selection:text-red-900">
      {/* If in admin view, render AdminPanel directly */}
      {view === 'admin' ? (
        <AdminPanel
          adminUser={adminUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onClose={handleCloseAdmin}
          categories={categories}
          onRefreshCategories={refreshCategories}
          onRefreshArticles={refreshArticles}
          onOpenArchitectureModal={() => setArchitectureModalOpen(true)}
        />
      ) : (
        <>
          {/* Public Header */}
          <Header
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={handleSelectCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenAdmin={handleOpenAdmin}
            adminUser={adminUser}
            onHomeClick={handleBackToHome}
          />

          {/* Body content based on active view */}
          {view === 'article' && selectedArticle ? (
            <ArticleDetail
              article={selectedArticle}
              relatedArticles={relatedArticles}
              onBack={handleBackToHome}
              onSelectArticle={handleSelectArticle}
            />
          ) : (
            <HomePage
              articles={articles}
              categories={categories}
              selectedCategorySlug={selectedCategorySlug}
              onSelectCategory={handleSelectCategory}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              onSelectArticle={handleSelectArticle}
              onOpenAdmin={handleOpenAdmin}
            />
          )}
        </>
      )}

      {/* Interactive Security & Architecture Modal */}
      <SecurityArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
        securityStatus={securityStatus}
      />
    </div>
  );
}
