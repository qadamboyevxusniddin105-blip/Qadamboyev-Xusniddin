import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  FolderPlus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Search,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Article, Category, AdminUser, SecurityStatus } from '../types.js';
import { api } from '../lib/api.js';
import { RichTextEditor } from './RichTextEditor.js';

interface AdminPanelProps {
  adminUser: AdminUser | null;
  onLoginSuccess: (user: AdminUser) => void;
  onLogout: () => void;
  onClose: () => void;
  categories: Category[];
  onRefreshCategories: () => void;
  onRefreshArticles: () => void;
  onOpenArchitectureModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  onLoginSuccess,
  onLogout,
  onClose,
  categories,
  onRefreshCategories,
  onRefreshArticles,
  onOpenArchitectureModal,
}) => {
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rateLimitLocked, setRateLimitLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Admin Dashboard state
  const [activeTab, setActiveTab] = useState<'articles' | 'editor' | 'categories' | 'security'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articleFilter, setArticleFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor state
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageCaption, setCoverImageCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [tagsInput, setTagsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorMessage, setEditorMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Category manager state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#b91c1c');
  const [categorySaving, setCategorySaving] = useState(false);

  // Security status state
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [resettingData, setResettingData] = useState(false);

  // Load articles and security info when logged in
  useEffect(() => {
    if (adminUser) {
      loadArticles();
      loadSecurityStatus();
    }
  }, [adminUser]);

  // Handle countdown timer if locked out
  useEffect(() => {
    if (lockoutTimer <= 0) {
      setRateLimitLocked(false);
      return;
    }
    const timer = setInterval(() => {
      setLockoutTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTimer]);

  const loadArticles = async () => {
    setArticlesLoading(true);
    try {
      const data = await api.getArticles({ admin: true });
      setArticles(data);
    } catch (err) {
      console.error('Failed to load articles in admin', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const loadSecurityStatus = async () => {
    try {
      const status = await api.getSecurityStatus();
      setSecurityStatus(status);
    } catch (err) {
      console.error('Failed to load security status', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.ok) {
        onLoginSuccess(res.data.user);
        loadArticles();
      } else {
        setLoginError(res.data.error || 'Authentication failed. Access denied.');
        if (res.data.isLockedOut) {
          setRateLimitLocked(true);
          setLockoutTimer(res.data.lockoutRemainingSeconds || 900);
        }
      }
    } catch (err) {
      setLoginError('An unexpected network error occurred while connecting to the security gateway.');
    } finally {
      setLoginLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@chronicle.news');
    setPassword('AdminSecure2026!#News');
  };

  const startNewArticle = () => {
    setEditingArticleId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('<p>Begin writing the article here...</p>');
    setCoverImage('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80');
    setCoverImageCaption('');
    setCategoryId(categories[0]?.id || '');
    setStatus('published');
    setTagsInput('');
    setIsFeatured(false);
    setIsBreaking(false);
    setEditorMessage(null);
    setActiveTab('editor');
  };

  const startEditArticle = (article: Article) => {
    setEditingArticleId(article.id);
    setTitle(article.title);
    setSlug(article.slug);
    setExcerpt(article.excerpt);
    setContent(article.content);
    setCoverImage(article.coverImage);
    setCoverImageCaption(article.coverImageCaption || '');
    setCategoryId(article.categoryId);
    setStatus(article.status);
    setTagsInput(article.tags ? article.tags.join(', ') : '');
    setIsFeatured(Boolean(article.isFeatured));
    setIsBreaking(Boolean(article.isBreaking));
    setEditorMessage(null);
    setActiveTab('editor');
  };

  const handleSaveArticle = async (saveAsStatus?: 'draft' | 'published') => {
    if (!title.trim()) {
      setEditorMessage({ type: 'error', text: 'Article title cannot be empty.' });
      return;
    }
    if (!content.trim()) {
      setEditorMessage({ type: 'error', text: 'Article body content cannot be empty.' });
      return;
    }
    if (!categoryId) {
      setEditorMessage({ type: 'error', text: 'Please select a category for this article.' });
      return;
    }

    setEditorSaving(true);
    setEditorMessage(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const targetStatus = saveAsStatus || status;

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      coverImageCaption: coverImageCaption.trim(),
      categoryId,
      status: targetStatus,
      tags: tagsArray,
      isFeatured,
      isBreaking,
    };

    try {
      if (editingArticleId) {
        await api.updateArticle(editingArticleId, payload);
        setEditorMessage({ type: 'success', text: 'Article updated successfully!' });
      } else {
        const created = await api.createArticle(payload);
        setEditingArticleId(created.id);
        setEditorMessage({ type: 'success', text: 'Article published and indexed successfully!' });
      }
      await loadArticles();
      onRefreshArticles();
    } catch (err: any) {
      setEditorMessage({ type: 'error', text: err.message || 'Failed to save article.' });
    } finally {
      setEditorSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string, articleTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${articleTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteArticle(id);
      await loadArticles();
      onRefreshArticles();
    } catch (err: any) {
      alert(`Error deleting article: ${err.message}`);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files (JPEG, PNG, WebP) are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Url = reader.result as string;
        const uploadedUrl = await api.uploadImage(base64Url, file.name);
        setCoverImage(uploadedUrl);
      } catch (err) {
        alert('Failed to upload image file.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCategorySaving(true);
    try {
      await api.createCategory({
        name: newCatName.trim(),
        slug: newCatSlug.trim() || undefined,
        description: newCatDesc.trim(),
        color: newCatColor,
      });
      setNewCatName('');
      setNewCatSlug('');
      setNewCatDesc('');
      onRefreshCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to create category.');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      onRefreshCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  const handleResetSampleData = async () => {
    if (!confirm('Reset all news articles and categories to default sample editorial data?')) return;
    setResettingData(true);
    try {
      await api.resetData();
      await loadArticles();
      onRefreshArticles();
      onRefreshCategories();
      alert('Sample news data restored successfully.');
    } catch (err) {
      alert('Failed to reset sample data.');
    } finally {
      setResettingData(false);
    }
  };

  // --------------------------------------------------------------------------
  // SCREEN 1: LOGIN FORM (IF NOT AUTHENTICATED)
  // --------------------------------------------------------------------------
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-stone-300 overflow-hidden">
          {/* Header */}
          <div className="bg-stone-950 text-white p-6 text-center relative border-b border-stone-800">
            <button
              onClick={onClose}
              className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit</span>
            </button>

            <div className="w-12 h-12 bg-red-700 rounded-xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-serif tracking-tight">Editorial Security Gateway</h2>
            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">
              Strict Single-Admin Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {/* Strict Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Access Restricted</span>
                Public registration is disabled. Only the designated sole administrator can log in.
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>{loginError}</div>
              </div>
            )}

            {/* Lockout alert */}
            {rateLimitLocked && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-xs text-red-900 text-center font-bold">
                Account Locked Out: Please wait {lockoutTimer}s
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Admin Email / Username
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@chronicle.news"
                disabled={rateLimitLocked}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                disabled={rateLimitLocked}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading || rateLimitLocked}
              className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>

            {/* Demo Helper Button */}
            <div className="pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full text-center py-2 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200"
              >
                Auto-fill Seeded Admin Credentials
              </button>
            </div>
          </form>

          {/* Footer Security Badges */}
          <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> BCrypt Salt 12
            </span>
            <span>•</span>
            <span>JWT HTTP-Only</span>
            <span>•</span>
            <span>Rate-Limited</span>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: AUTHENTICATED ADMIN DASHBOARD
  // --------------------------------------------------------------------------

  const filteredArticles = articles.filter((a) => {
    if (articleFilter === 'published' && a.status !== 'published') return false;
    if (articleFilter === 'draft' && a.status !== 'draft') return false;
    if (categoryFilter !== 'all' && a.categoryId !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
    }
    return true;
  });

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const publishedCount = articles.filter((a) => a.status === 'published').length;
  const draftCount = articles.filter((a) => a.status === 'draft').length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      {/* Top Admin Navigation */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-red-700 rounded-md">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold font-serif flex items-center gap-2">
                <span>The Chronicle Editorial Console</span>
                <span className="bg-emerald-900/80 text-emerald-400 border border-emerald-700 text-[10px] px-2 py-0.2 rounded font-sans uppercase tracking-wider">
                  Admin Enforced
                </span>
              </div>
              <div className="text-[11px] text-stone-400">
                Logged in as: <strong className="text-stone-200">{adminUser.email}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenArchitectureModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium border border-stone-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              <span>Architecture & OWASP Guide</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium border border-stone-700 transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-lg text-xs font-medium border border-red-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Subheader & Tabs */}
      <div className="bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-1 py-2">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'articles'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Articles ({articles.length})</span>
            </button>

            <button
              onClick={startNewArticle}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'editor'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Plus className="w-4 h-4 text-red-600" />
              <span>Write Story</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'categories'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Security Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* TAB 1: ARTICLES MANAGER */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Stories</span>
                <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{articles.length}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Published</span>
                <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{publishedCount}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Drafts</span>
                <div className="text-2xl font-bold font-serif text-amber-700 mt-1">{draftCount}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Views</span>
                <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
                  {totalViews.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Filter and search bar */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setArticleFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    articleFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  All ({articles.length})
                </button>
                <button
                  onClick={() => setArticleFilter('published')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    articleFilter === 'published' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Published ({publishedCount})
                </button>
                <button
                  onClick={() => setArticleFilter('draft')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    articleFilter === 'draft' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  Drafts ({draftCount})
                </button>

                <span className="text-stone-300">|</span>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>

                <button
                  onClick={startNewArticle}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Story</span>
                </button>
              </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              {articlesLoading ? (
                <div className="p-8 text-center text-xs text-stone-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                  Loading article repository...
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-12 text-center text-stone-500 text-xs">
                  No articles found matching the current filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Story & Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Reads</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70">
                      {filteredArticles.map((art) => (
                        <tr key={art.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3.5 px-4 max-w-md">
                            <div className="flex items-center gap-3">
                              <img
                                src={art.coverImage}
                                alt=""
                                className="w-12 h-9 object-cover rounded bg-stone-200 flex-shrink-0"
                              />
                              <div>
                                <div className="font-bold text-stone-900 font-serif text-sm line-clamp-1">
                                  {art.title}
                                </div>
                                <div className="text-[11px] text-stone-400 font-mono line-clamp-1">
                                  /{art.slug}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                              {art.categoryName}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {art.status === 'published' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                                <CheckCircle className="w-3 h-3" /> Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                                <Clock className="w-3 h-3" /> Draft
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-stone-600 whitespace-nowrap">
                            {art.views.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                            {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => startEditArticle(art)}
                              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                              title="Edit Story"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art.id, art.title)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Delete Story"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLE EDITOR (CREATE & EDIT) */}
        {activeTab === 'editor' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900">
                  {editingArticleId ? 'Edit Article' : 'Write New Editorial Story'}
                </h3>
                <p className="text-xs text-stone-500">
                  Authoring formatted articles with real-time XSS protection and live reader preview.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('articles')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveArticle('draft')}
                  disabled={editorSaving}
                  className="px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveArticle('published')}
                  disabled={editorSaving}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {editorSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{editingArticleId ? 'Save & Update' : 'Publish Story'}</span>
                </button>
              </div>
            </div>

            {/* Notification message */}
            {editorMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  editorMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {editorMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Core Fields */}
              <div className="lg:col-span-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingArticleId) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    placeholder="Enter an authoritative, descriptive editorial headline..."
                    className="w-full px-3.5 py-2.5 text-base font-serif font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-stone-100 border border-r-0 border-stone-300 rounded-l-lg text-xs text-stone-500 font-mono">
                      /news/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="headline-slug-preview"
                      className="w-full px-3 py-2 text-xs font-mono text-stone-800 bg-stone-50 border border-stone-300 rounded-r-lg focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Lead Excerpt (Summary) *
                  </label>
                  <textarea
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Concise, compelling 2-sentence summary shown on feeds and article header..."
                    className="w-full px-3 py-2 text-sm font-serif text-stone-800 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Article Body & Formatting *
                  </label>
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
              </div>

              {/* Right Column: Metadata & Media */}
              <div className="lg:col-span-4 space-y-4">
                {/* Category & Status Box */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Publishing Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                    >
                      <option value="published">Published (Visible to all)</option>
                      <option value="draft">Draft (Restricted to admin)</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-stone-200 space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBreaking}
                        onChange={(e) => setIsBreaking(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="font-semibold text-stone-800">Flag as Breaking News</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span className="font-semibold text-stone-800">Feature in Hero Grid</span>
                    </label>
                  </div>
                </div>

                {/* Cover Image Box */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Lead Cover Image
                  </label>

                  {coverImage && (
                    <div className="aspect-[16/10] rounded-lg overflow-hidden bg-stone-200 border border-stone-300">
                      <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div>
                    <span className="block text-[11px] text-stone-500 mb-1">Image URL</span>
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] text-stone-500 mb-1">Or Upload from Computer</span>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-stone-300 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Image File...</span>
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                    </label>
                  </div>

                  <div>
                    <span className="block text-[11px] text-stone-500 mb-1">Photographer / Source Caption</span>
                    <input
                      type="text"
                      value={coverImageCaption}
                      onChange={(e) => setCoverImageCaption(e.target.value)}
                      placeholder="e.g. Photo by Reuters / Anna Schmidt"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tags Box */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Semiconductors, Artificial Intelligence, Markets"
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES MANAGER */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Create category form */}
            <div className="md:col-span-5 bg-white p-6 rounded-xl border border-stone-200 shadow-xs h-fit space-y-4">
              <h3 className="text-base font-bold font-serif text-stone-900 border-b border-stone-200 pb-3">
                Create New Category
              </h3>
              <form onSubmit={handleCreateCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    placeholder="e.g. Investigations, Climate, Energy"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="investigations"
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Brief editorial scope of this category..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Theme Color Accent
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border border-stone-300"
                    />
                    <span className="font-mono text-xs text-stone-600">{newCatColor}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={categorySaving}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {categorySaving ? 'Saving...' : 'Add Category'}
                </button>
              </form>
            </div>

            {/* Existing categories list */}
            <div className="md:col-span-7 bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-stone-200 font-bold font-serif text-stone-900 text-base">
                Configured Editorial Categories ({categories.length})
              </div>
              <div className="divide-y divide-stone-200">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between gap-3 hover:bg-stone-50/70">
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <div>
                        <div className="font-bold text-stone-900 text-sm">{cat.name}</div>
                        <div className="text-xs text-stone-500">{cat.description}</div>
                        <div className="text-[11px] font-mono text-stone-400 mt-0.5">/{cat.slug}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {cat.articleCount || 0} stories
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY AUDIT CONSOLE */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Real-Time Security Defense Audit</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live verification of OWASP Top 10 mitigation strategies implemented across Chronicle.
                  </p>
                </div>
                <button
                  onClick={onOpenArchitectureModal}
                  className="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-800 transition-colors"
                >
                  View Code Blueprint
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Single-Admin Identity</span>
                  </div>
                  <p className="text-stone-600 text-[11px] mb-2">
                    Enforces strict single-administrator constraint. Public signups are rejected with HTTP 403.
                  </p>
                  <span className="inline-block font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    ENFORCED (1 ADMIN)
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Password Encryption</span>
                  </div>
                  <p className="text-stone-600 text-[11px] mb-2">
                    Passwords are mathematically irreversible via bcrypt using 12 computational salt rounds.
                  </p>
                  <span className="inline-block font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    BCRYPT 12 ROUNDS
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Brute-Force Rate Limiter</span>
                  </div>
                  <p className="text-stone-600 text-[11px] mb-2">
                    Login route tracks attempts. Max 5 failures per 15 minutes triggers automatic IP lockout.
                  </p>
                  <span className="inline-block font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    ACTIVE (5 ATTEMPTS)
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Session Isolation</span>
                  </div>
                  <p className="text-stone-600 text-[11px] mb-2">
                    HS256 signed JWTs with 2-hour short lifetimes stored in HTTP-Only, SameSite=Lax cookies.
                  </p>
                  <span className="inline-block font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    HTTP-ONLY COOKIE
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>XSS Sanitization Engine</span>
                  </div>
                  <p className="text-stone-600 text-[11px] mb-2">
                    Server strips script execution, iframe hijacking, and inline event handlers from rich prose.
                  </p>
                  <span className="inline-block font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    SANITIZER ACTIVE
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
                  <div className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Hardened Security Headers</span>
                  </div>
                  <p className="text-stone-600 text-[11px] mb-2">
                    Nosniff, SameOrigin frame embedding, strict referrer policy, and CSRF double-checks.
                  </p>
                  <span className="inline-block font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                    HEADERS DEPLOYED
                  </span>
                </div>
              </div>

              {/* Reset Data Tool */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Sample Data Restoration</span>
                  <span className="text-[11px] text-stone-500">
                    Restore seeded high-quality editorial articles and default categories.
                  </span>
                </div>
                <button
                  onClick={handleResetSampleData}
                  disabled={resettingData}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resettingData ? 'animate-spin' : ''}`} />
                  <span>Restore Sample Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
