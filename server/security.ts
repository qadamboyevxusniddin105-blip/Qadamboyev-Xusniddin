import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'chronicle_super_secure_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = '2h';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

// In-memory rate limiting map: key is IP or IP+email
const rateLimitStore = new Map<string, RateLimitRecord>();

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Check and track login attempts (OWASP A07: Identification and Authentication Failures)
 */
export function checkLoginRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockoutRemainingSeconds: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockoutRemainingSeconds: 0 };
  }

  // Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutRemainingSeconds: remainingSeconds
    };
  }

  // Reset if window has elapsed
  if (now - record.lastAttempt > LOCKOUT_DURATION_MS) {
    rateLimitStore.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockoutRemainingSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_LOGIN_ATTEMPTS - record.attempts);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
    lockoutRemainingSeconds: 0
  };
}

export function recordFailedLogin(identifier: string): {
  isLockedOut: boolean;
  remainingAttempts: number;
  lockoutRemainingSeconds: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier) || {
    attempts: 0,
    lockedUntil: null,
    lastAttempt: now
  };

  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitStore.set(identifier, record);
    return {
      isLockedOut: true,
      remainingAttempts: 0,
      lockoutRemainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
    };
  }

  rateLimitStore.set(identifier, record);
  return {
    isLockedOut: false,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - record.attempts,
    lockoutRemainingSeconds: 0
  };
}

export function resetLoginRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Generate secure JWT token
 */
export function signJwtToken(payload: { id: string; email: string; username: string; role: 'admin' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyJwtToken(token: string): { id: string; email: string; username: string; role: 'admin' } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; username: string; role: 'admin' };
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Server-side Route Protection Middleware (Guards all /api/admin & admin mutations)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.chronicle_auth) {
    token = req.cookies.chronicle_auth;
  }

  // 2. Fallback to Authorization: Bearer <token>
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized: Authentication token missing. Access to administrative controls requires a verified session.'
    });
    return;
  }

  const decoded = verifyJwtToken(token);
  if (!decoded || decoded.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden: Invalid or expired administrator session. Please log in again.'
    });
    return;
  }

  // Strict Single-Admin Enforcement: Verify decoded email matches the single stored admin email
  const admin = db.getAdmin();
  if (decoded.email.toLowerCase() !== admin.email.toLowerCase()) {
    res.status(403).json({
      error: 'Access denied: Identity does not match the designated sole administrator.'
    });
    return;
  }

  // Attach user to request
  (req as any).adminUser = decoded;
  next();
}

/**
 * Robust HTML Sanitization to prevent Cross-Site Scripting (OWASP A03: Injection / XSS)
 * Strips script tags, style injections, event handlers, javascript: URIs, etc.
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // 1. Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove iframe, embed, object, frame, applet tags and contents
  sanitized = sanitized.replace(/<(iframe|embed|object|frame|frameset|applet|meta|link|base)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  sanitized = sanitized.replace(/<(iframe|embed|object|frame|frameset|applet|meta|link|base)[^>]*>/gi, '');

  // 3. Remove inline event handlers (onerror, onload, onclick, onmouseover, etc.)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Neutralize javascript: and vbscript: URIs
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*['"]\s*(?:javascript|vbscript|data:text\/html):[^'"]*['"]/gi, '$1="#"');

  // 5. Enforce rel="noopener noreferrer" on external links
  sanitized = sanitized.replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi, (match, quote, href) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer"`;
  });

  return sanitized;
}

/**
 * CSRF Token helper
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Security headers middleware (OWASP Top 10 Security Hardening)
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // XSS protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}
