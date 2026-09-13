import { Article, Category, AdminUser, SecurityStatus } from '../types.js';

const API_BASE = '/api';

// In-memory token storage for Authorization header fallback if cookies are restricted in iframes
let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem('chronicle_jwt', token);
  } else {
    localStorage.removeItem('chronicle_jwt');
  }
}

export function getAuthToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  const stored = localStorage.getItem('chronicle_jwt');
  if (stored) {
    inMemoryToken = stored;
    return stored;
  }
  return null;
}

function getHeaders(customHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setAuthToken(data.token);
    }
    return { ok: res.ok, status: res.status, data };
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } finally {
      setAuthToken(null);
    }
  },

  async getMe(): Promise<{ user: AdminUser } | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateProfile(payload: {
    username?: string;
    avatar?: string;
    title?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string; user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update admin profile');
    return data;
  },

  async getSecurityStatus(): Promise<SecurityStatus | null> {
    try {
      const res = await fetch(`${API_BASE}/security/status`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Articles
  async getArticles(params?: { category?: string; search?: string; admin?: boolean }): Promise<Article[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.admin) searchParams.set('admin', 'true');

    const res = await fetch(`${API_BASE}/articles?${searchParams.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch articles');
    const data = await res.json();
    return data.articles || [];
  },

  async getArticleBySlug(slug: string, admin: boolean = false): Promise<Article | null> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}${admin ? '?admin=true' : ''}`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.article;
  },

  async createArticle(payload: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create article');
    return data.article;
  },

  async updateArticle(id: string, payload: Partial<Article>): Promise<Article> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update article');
    return data.article;
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete article');
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    return data.categories || [];
  },

  async createCategory(payload: { name: string; slug?: string; description: string; color: string }): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create category');
    return data.category;
  },

  async updateCategory(id: string, payload: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update category');
    return data.category;
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete category');
    }
  },

  // Image upload
  async uploadImage(dataUrl: string, filename?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ dataUrl, filename }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  },

  // Reset sample data
  async resetData(): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/reset-data`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reset sample data');
  }
};
