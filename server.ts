import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from './server/db.js';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginRateLimit,
  getClientIp,
  signJwtToken,
  verifyJwtToken,
  requireAdmin,
  sanitizeHtmlContent,
  securityHeadersMiddleware,
  generateCsrfToken
} from './server/security.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security middlewares
  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // --------------------------------------------------------------------------
  // AUTHENTICATION & ACCESS CONTROL (STRICT SINGLE-ADMIN POLICY)
  // --------------------------------------------------------------------------

  // Login endpoint with rate limiting (OWASP Top 10 brute-force protection)
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const clientIp = getClientIp(req);
    const identifier = `${clientIp}:${(email || '').toLowerCase().trim()}`;

    // 1. Rate Limiting Check
    const rateCheck = checkLoginRateLimit(identifier);
    if (!rateCheck.allowed) {
      res.status(429).json({
        error: `Too many failed login attempts. Brute-force protection activated. Please wait ${rateCheck.lockoutRemainingSeconds} seconds before retrying.`,
        isLockedOut: true,
        lockoutRemainingSeconds: rateCheck.lockoutRemainingSeconds
      });
      return;
    }

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const admin = db.getAdmin();
    const isEmailMatch = email.trim().toLowerCase() === admin.email.toLowerCase();

    // Verify password with bcrypt
    let isPasswordMatch = false;
    if (isEmailMatch) {
      isPasswordMatch = await bcrypt.compare(password, admin.passwordHash);
    } else {
      // Timing-safe dummy compare to mitigate username enumeration side-channel attacks
      await bcrypt.compare(password, '$2a$12$e8rUq86gWd1zV29R18p.yeM6V35v0lZzQZ4e8q4m5F6K.m9N0u8.6');
    }

    if (!isEmailMatch || !isPasswordMatch) {
      const failure = recordFailedLogin(identifier);
      res.status(401).json({
        error: failure.isLockedOut
          ? `Account temporarily locked due to excessive failed attempts. Try again in ${failure.lockoutRemainingSeconds} seconds.`
          : `Invalid credentials. ${failure.remainingAttempts} attempt(s) remaining before temporary lockout.`,
        remainingAttempts: failure.remainingAttempts,
        isLockedOut: failure.isLockedOut,
        lockoutRemainingSeconds: failure.lockoutRemainingSeconds
      });
      return;
    }

    // Success: Reset rate limiter
    resetLoginRateLimit(identifier);

    // Update last login timestamp
    db.updateAdminLastLogin(new Date().toISOString());

    // Generate JWT token & CSRF token
    const token = signJwtToken({
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: 'admin'
    });
    const csrfToken = generateCsrfToken();

    // Set secure HTTP-only cookie
    res.cookie('chronicle_auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000 // 2 hours
    });

    res.json({
      success: true,
      message: 'Authentication successful. Welcome to the editorial console.',
      token, // Also provided for clients using Authorization header
      csrfToken,
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin,
        avatar: admin.avatar,
        title: admin.title
      }
    });
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('chronicle_auth', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Check Current Session
  app.get('/api/auth/me', requireAdmin, (req, res) => {
    const adminUser = (req as any).adminUser;
    const admin = db.getAdmin();
    res.json({
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin,
        avatar: admin.avatar,
        title: admin.title
      }
    });
  });

  // Update Admin Profile (ADMIN ONLY) - Password changes strictly disabled
  app.put('/api/auth/profile', requireAdmin, async (req, res) => {
    try {
      const { username, avatar, title, email, newPassword, password } = req.body;

      if (newPassword || password) {
        res.status(403).json({
          error: 'Parol yangilash funksiyasi xavfsizlik nuqtai nazaridan butunlay o‘chirilgan. (Password modification is permanently disabled for system security).'
        });
        return;
      }

      if (username !== undefined && !String(username).trim()) {
        res.status(400).json({ error: 'Username cannot be empty.' });
        return;
      }
      if (email !== undefined && (!String(email).includes('@') || !String(email).includes('.'))) {
        res.status(400).json({ error: 'A valid email address is required.' });
        return;
      }

      const updatedAdmin = await db.updateAdminProfile({
        username: username !== undefined ? String(username).trim() : undefined,
        avatar: avatar !== undefined ? String(avatar).trim() : undefined,
        title: title !== undefined ? String(title).trim() : undefined,
        email: email !== undefined ? String(email).trim() : undefined,
      });

      res.json({
        success: true,
        message: 'Admin profile successfully updated.',
        user: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          username: updatedAdmin.username,
          role: updatedAdmin.role,
          lastLogin: updatedAdmin.lastLogin,
          avatar: updatedAdmin.avatar,
          title: updatedAdmin.title
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update admin profile.' });
    }
  });

  // Public Registration: PERMANENTLY DISABLED
  app.post('/api/auth/register', (req, res) => {
    res.status(403).json({
      error: 'Public registration is disabled. This platform enforces a strict single-administrator policy to guarantee absolute editorial integrity.'
    });
  });

  // Security Status & OWASP Defense Metrics
  app.get('/api/security/status', (req, res) => {
    const clientIp = getClientIp(req);
    const admin = db.getAdmin();
    const identifier = `${clientIp}:${admin.email.toLowerCase()}`;
    const rate = checkLoginRateLimit(identifier);

    res.json({
      singleAdminEnforced: true,
      registrationDisabled: true,
      bcryptSaltRounds: 12,
      jwtExpiryMinutes: 120,
      rateLimiterActive: true,
      remainingAttempts: rate.remainingAttempts,
      isLockedOut: !rate.allowed,
      lockoutRemainingSeconds: rate.lockoutRemainingSeconds,
      xssSanitizationActive: true,
      csrfProtected: true,
      sqlInjectionPrevented: true,
      adminEmail: admin.email
    });
  });

  // --------------------------------------------------------------------------
  // ARTICLES API (PUBLIC & ADMIN PROTECTED)
  // --------------------------------------------------------------------------

  // Get articles list
  app.get('/api/articles', (req, res) => {
    const { category, search, admin } = req.query;

    let includeDrafts = false;
    if (admin === 'true') {
      // Verify token for drafts
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.chronicle_auth;
      const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined);
      if (token) {
        const decoded = verifyJwtToken(token);
        if (decoded && decoded.role === 'admin') {
          includeDrafts = true;
        }
      }
    }

    const articles = db.getArticles({
      includeDrafts,
      categorySlug: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined
    });

    res.json({ articles, count: articles.length });
  });

  // Get single article by slug (and atomically increment views)
  app.get('/api/articles/:slug', (req, res) => {
    const { slug } = req.params;
    const { admin } = req.query;

    let includeDrafts = false;
    if (admin === 'true') {
      const authHeader = req.headers.authorization;
      const cookieToken = req.cookies?.chronicle_auth;
      const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined);
      if (token) {
        const decoded = verifyJwtToken(token);
        if (decoded?.role === 'admin') includeDrafts = true;
      }
    }

    const article = db.getArticleBySlug(slug, { includeDrafts: true });
    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    // Only increment views for public published articles
    if (article.status === 'published') {
      db.incrementArticleViews(slug);
      article.views = (article.views || 0) + 1;
    }

    res.json({ article });
  });

  // Create article (ADMIN ONLY)
  app.post('/api/articles', requireAdmin, (req, res) => {
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverImageCaption,
      categoryId,
      status,
      tags,
      isFeatured,
      isBreaking
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Title is required.' });
      return;
    }
    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Article content is required.' });
      return;
    }
    if (!categoryId) {
      res.status(400).json({ error: 'Category is required.' });
      return;
    }

    // OWASP A03 Sanitization: Strip dangerous script and event handler attributes
    const cleanContent = sanitizeHtmlContent(content);
    const cleanExcerpt = (excerpt || '').trim();

    const adminUser = (req as any).adminUser;

    const newArticle = db.createArticle({
      title: title.trim(),
      slug: slug ? slug.trim() : undefined as any,
      excerpt: cleanExcerpt,
      content: cleanContent,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      coverImageCaption: coverImageCaption || '',
      categoryId,
      status: status === 'draft' ? 'draft' : 'published',
      author: {
        name: adminUser.username || 'Chief Editor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Editor-in-Chief'
      },
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      isFeatured: Boolean(isFeatured),
      isBreaking: Boolean(isBreaking),
      publishedAt: status === 'published' ? new Date().toISOString() : ''
    });

    res.status(201).json({ success: true, article: newArticle });
  });

  // Update article (ADMIN ONLY)
  app.put('/api/articles/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const existing = db.getArticleById(id);
    if (!existing) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    const updates = { ...req.body };

    // Sanitize content if updated
    if (updates.content) {
      updates.content = sanitizeHtmlContent(updates.content);
    }

    if (updates.status === 'published' && existing.status === 'draft' && !existing.publishedAt) {
      updates.publishedAt = new Date().toISOString();
    }

    const updated = db.updateArticle(id, updates);
    res.json({ success: true, article: updated });
  });

  // Delete article (ADMIN ONLY)
  app.delete('/api/articles/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const success = db.deleteArticle(id);
    if (!success) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }
    res.json({ success: true, message: 'Article deleted successfully.' });
  });

  // --------------------------------------------------------------------------
  // CATEGORIES API
  // --------------------------------------------------------------------------

  app.get('/api/categories', (req, res) => {
    const categories = db.getCategories();
    res.json({ categories });
  });

  app.post('/api/categories', requireAdmin, (req, res) => {
    const { name, slug, description, color } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Category name is required.' });
      return;
    }
    const cat = db.createCategory({
      name: name.trim(),
      slug: slug || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || '',
      color: color || '#b91c1c'
    });
    res.status(201).json({ success: true, category: cat });
  });

  app.put('/api/categories/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const updated = db.updateCategory(id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }
    res.json({ success: true, category: updated });
  });

  app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const success = db.deleteCategory(id);
    if (!success) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }
    res.json({ success: true, message: 'Category deleted successfully.' });
  });

  // --------------------------------------------------------------------------
  // MEDIA UPLOAD API (BASE64 OR PRESET MEDIA)
  // --------------------------------------------------------------------------

  app.post('/api/upload', requireAdmin, (req, res) => {
    const { dataUrl, filename } = req.body;

    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      res.status(400).json({ error: 'Valid image dataUrl is required.' });
      return;
    }

    // In a real production deployment, this writes to S3/Cloud Storage.
    // For this server, we accept verified data URLs or return safe base64 storage.
    res.json({
      success: true,
      url: dataUrl,
      filename: filename || 'uploaded-image.png'
    });
  });

  // Reset sample articles (ADMIN ONLY)
  app.post('/api/admin/reset-data', requireAdmin, (req, res) => {
    db.resetSampleData();
    res.json({ success: true, message: 'Sample news data restored successfully.' });
  });

  // --------------------------------------------------------------------------
  // VITE DEVELOPMENT MIDDLEWARE OR PRODUCTION STATIC SERVING
  // --------------------------------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chronicle Editorial & News Server running on http://0.0.0.0:${PORT}`);
    console.log(`Default Admin Account: ${DEFAULT_ADMIN_EMAIL}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
