import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { HomePage } from './components/HomePage.js';
import { ArticleDetail } from './components/ArticleDetail.js';
import { AdminPanel } from './components/AdminPanel.js';
import { BottomNav } from './components/BottomNav.js';
import { AdminProfileModal } from './components/AdminProfileModal.js';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal.js';
import { Article, Category, AdminUser, SecurityStatus, Language, Theme } from './types.js';
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronicle_theme') as Theme;
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Language state ('uz' | 'ru' | 'en')
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronicle_lang') as Language;
      if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved;
    }
    return 'uz';
  });

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('chronicle_theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('chronicle_lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
  };

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedArticle(null);
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setView('admin');
    window.location.hash = 'admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseAdmin = () => {
    setView('home');
    window.location.hash = '';
    refreshArticles();
    refreshCategories();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleUpdateAdminProfile = (updatedUser: AdminUser) => {
    setAdminUser(updatedUser);
  };

  // Find related articles for current article
  const relatedArticles = selectedArticle
    ? articles
        .filter((a) => a.categoryId === selectedArticle.categoryId && a.id !== selectedArticle.id)
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#121212] text-stone-900 dark:text-stone-100 transition-colors duration-200 selection:bg-red-100 dark:selection:bg-red-950 selection:text-red-900 dark:selection:text-red-200">
      {/* If in admin view, render AdminPanel */}
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
          lang={lang}
          onUpdateUser={handleUpdateAdminProfile}
          theme={theme}
          onToggleTheme={toggleTheme}
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
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            onSelectLanguage={handleSelectLanguage}
            onOpenProfile={() => setProfileModalOpen(true)}
          />

          {/* Body content based on active view */}
          {view === 'article' && selectedArticle ? (
            <ArticleDetail
              article={selectedArticle}
              relatedArticles={relatedArticles}
              onBack={handleBackToHome}
              onSelectArticle={handleSelectArticle}
              lang={lang}
              theme={theme}
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
              lang={lang}
            />
          )}

          {/* Fixed Floating Bottom Navigation Menu */}
          <BottomNav
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={handleSelectCategory}
            onHomeClick={handleBackToHome}
            onOpenSearch={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (searchInput) searchInput.focus();
            }}
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            onSelectLanguage={handleSelectLanguage}
            adminUser={adminUser}
            onOpenProfile={() => setProfileModalOpen(true)}
            onOpenAdmin={handleOpenAdmin}
            currentView={view}
          />
        </>
      )}

      {/* Admin Profile Modal (Exclusive to Admin) */}
      <AdminProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        adminUser={adminUser}
        onUpdateUser={handleUpdateAdminProfile}
        onOpenLogin={() => {
          setProfileModalOpen(false);
          handleOpenAdmin();
        }}
        lang={lang}
      />

      {/* Interactive Security & Architecture Modal */}
      <SecurityArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
        securityStatus={securityStatus}
      />
    </div>
  );
}
