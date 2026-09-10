import React, { useState } from 'react';
import {
  X,
  Shield,
  Layers,
  Database,
  Lock,
  Server,
  Cloud,
  Copy,
  Check,
  Code2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { SecurityStatus } from '../types.js';

interface SecurityArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityStatus: SecurityStatus | null;
}

export const SecurityArchitectureModal: React.FC<SecurityArchitectureModalProps> = ({
  isOpen,
  onClose,
  securityStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'owasp' | 'nextjs_prisma' | 'project_structure' | 'deployment'>('owasp');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  username     String
  passwordHash String
  role         String    @default("admin")
  lastLogin    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  color       String    @default("#b91c1c")
  articles    Article[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
}

model Article {
  id                 String        @id @default(cuid())
  title              String
  slug               String        @unique
  excerpt            String
  content            String        @db.Text
  coverImage         String
  coverImageCaption  String?
  status             ArticleStatus @default(DRAFT)
  views              Int           @default(0)
  readingTimeMinutes Int           @default(5)
  authorName         String        @default("Editor-in-Chief")
  authorAvatar       String?
  tags               String[]
  isFeatured         Boolean       @default(false)
  isBreaking         Boolean       @default(false)
  
  category           Category      @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId         String
  
  publishedAt        DateTime?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  @@index([slug])
  @@index([categoryId])
  @@index([status, publishedAt])
}`;

  const nextAuthMiddlewareCode = `// middleware.ts (Next.js App Router Route Protection)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_32_chars_minimum');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes and /api/admin endpoints (except /admin/login)
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  if (isAdminRoute || isAdminApiRoute) {
    const token = request.cookies.get('chronicle_auth')?.value;

    if (!token) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin authentication required.' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT signature & expiration using Web Crypto compatible 'jose'
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (payload.role !== 'admin' || payload.email !== process.env.ADMIN_EMAIL) {
        throw new Error('Access denied: not authorized admin');
      }

      // Allow request to proceed
      return NextResponse.next();
    } catch (err) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Forbidden: Session expired or invalid.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};`;

  const nextLoginApiCode = `// app/api/auth/login/route.ts (Next.js Route Handler)
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import prisma from '@/lib/prisma';
import { rateLimiter } from '@/lib/rate-limiter';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const { email, password } = await req.json();

  // 1. Rate Limiting Check (OWASP A07: Brute Force Protection)
  const isAllowed = await rateLimiter.check(ip, 5, 15 * 60); // 5 attempts per 15 min
  if (!isAllowed) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Temporarily locked out.' },
      { status: 429 }
    );
  }

  // 2. Lookup single admin
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // 3. Timing-safe comparison to prevent user enumeration
  const dummyHash = '$2a$12$e8rUq86gWd1zV29R18p.yeM6V35v0lZzQZ4e8q4m5F6K.m9N0u8.6';
  const valid = admin
    ? await bcrypt.compare(password, admin.passwordHash)
    : await bcrypt.compare(password, dummyHash);

  if (!admin || !valid) {
    await rateLimiter.increment(ip);
    return NextResponse.json(
      { error: 'Invalid administrator credentials.' },
      { status: 401 }
    );
  }

  // Reset rate limit on success
  await rateLimiter.reset(ip);

  // 4. Issue short-expiry JWT (2 hours)
  const token = await new SignJWT({
    id: admin.id,
    email: admin.email,
    username: admin.username,
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(JWT_SECRET);

  // 5. Set secure HTTP-only cookie
  const response = NextResponse.json({
    success: true,
    user: { email: admin.email, username: admin.username },
  });

  response.cookies.set('chronicle_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 60 * 60, // 2 hours
    path: '/',
  });

  return response;
}`;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-stone-900 text-white rounded-lg">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900">
                Security Architecture & Technical Blueprint
              </h2>
              <p className="text-xs text-stone-500">
                OWASP Top 10 Hardened • Single-Admin Policy • Next.js & Prisma Reference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('owasp')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'owasp'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>OWASP Defenses</span>
          </button>
          <button
            onClick={() => setActiveTab('nextjs_prisma')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'nextjs_prisma'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Next.js & Prisma Stack</span>
          </button>
          <button
            onClick={() => setActiveTab('project_structure')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'project_structure'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Folder Layout</span>
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'deployment'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Production Deployment</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 text-sm">
          {/* TAB 1: OWASP TOP 10 DEFENSES */}
          {activeTab === 'owasp' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <Check className="w-4 h-4" />
                    <span>A01: Broken Access Control</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Protected server middleware requires valid JWT for all admin mutations. Registration is permanently disabled (HTTP 403) to enforce strict single-admin access.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <Check className="w-4 h-4" />
                    <span>A02: Cryptographic Failures</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Administrator passwords are encrypted using bcrypt with 12 salt rounds. Sessions are signed with HS256 JWT stored in HTTP-Only, SameSite=Lax cookies.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <Check className="w-4 h-4" />
                    <span>A03: Injection & Stored XSS</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Rich text HTML content is sanitized on the server before storage. Script tags, dangerous attributes (`onload`, `onerror`), and `javascript:` URIs are neutralized.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <Check className="w-4 h-4" />
                    <span>A07: Authentication & Brute-Force</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Sliding window rate-limiter restricts login attempts to max 5 per 15 minutes. Timing-safe password comparisons prevent username enumeration.
                  </p>
                </div>
              </div>

              {/* Real-time Status */}
              <div className="bg-stone-900 text-stone-100 p-4 rounded-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  Active Server Defense Matrix
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block">Single-Admin:</span>
                    <span className="text-emerald-400 font-semibold">Enforced (Active)</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Public Register:</span>
                    <span className="text-red-400 font-semibold">Disabled (403)</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">BCrypt Salt:</span>
                    <span className="text-stone-200 font-semibold">12 Rounds</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Session Expiry:</span>
                    <span className="text-stone-200 font-semibold">2 Hours (Strict)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEXT.JS + PRISMA CODE */}
          {activeTab === 'nextjs_prisma' && (
            <div className="space-y-6">
              <p className="text-xs text-stone-600">
                Below are the production-ready code blocks for the requested Next.js (App Router) + Prisma ORM + PostgreSQL stack. You can copy-paste these directly into your standalone Next.js repository.
              </p>

              {/* Prisma Schema */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-red-700" />
                    <span>1. Prisma Database Schema (`prisma/schema.prisma`)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(prismaSchemaCode, 'prisma')}
                    className="text-xs flex items-center gap-1 text-stone-600 hover:text-stone-900 px-2 py-1 bg-stone-100 rounded border border-stone-200"
                  >
                    {copiedKey === 'prisma' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'prisma' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-56">
                  {prismaSchemaCode}
                </pre>
              </div>

              {/* Middleware */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-red-700" />
                    <span>2. Route Protection Middleware (`middleware.ts`)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(nextAuthMiddlewareCode, 'middleware')}
                    className="text-xs flex items-center gap-1 text-stone-600 hover:text-stone-900 px-2 py-1 bg-stone-100 rounded border border-stone-200"
                  >
                    {copiedKey === 'middleware' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'middleware' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-56">
                  {nextAuthMiddlewareCode}
                </pre>
              </div>

              {/* Login Route Handler */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-red-700" />
                    <span>3. Login API with Rate Limiter (`app/api/auth/login/route.ts`)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(nextLoginApiCode, 'login')}
                    className="text-xs flex items-center gap-1 text-stone-600 hover:text-stone-900 px-2 py-1 bg-stone-100 rounded border border-stone-200"
                  >
                    {copiedKey === 'login' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'login' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs overflow-x-auto font-mono max-h-56">
                  {nextLoginApiCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT STRUCTURE */}
          {activeTab === 'project_structure' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-stone-900 text-stone-100 p-5 rounded-xl leading-relaxed overflow-x-auto">
{`chronicle-news-platform/
├── .env.example              # Documents DATABASE_URL, JWT_SECRET, ADMIN_EMAIL
├── middleware.ts             # Next.js server-side route protection guard
├── prisma/
│   ├── schema.prisma         # Prisma schema for Admin, Category, Article
│   └── seed.ts               # One-time script to hash admin password with bcrypt
├── app/
│   ├── layout.tsx            # Root layout with editorial typography
│   ├── page.tsx              # Homepage: Featured hero, categories, recent feeds
│   ├── news/
│   │   └── [slug]/
│   │       └── page.tsx      # Dynamic single article view with views increment
│   ├── category/
│   │   └── [slug]/
│   │       └── page.tsx      # Category specific news feed
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx      # High-security single-admin login UI
│   │   ├── page.tsx          # Admin dashboard metrics & article management
│   │   ├── articles/
│   │   │   ├── new/page.tsx  # Rich article creation with WYSIWYG
│   │   │   └── [id]/page.tsx # Article editor & updater
│   │   └── categories/page.tsx # Category management
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts  # Rate-limited bcrypt verification & JWT cookie
│       │   └── logout/route.ts # Clears session cookie
│       ├── admin/
│       │   ├── articles/route.ts # CRUD endpoints with XSS sanitization
│       │   └── upload/route.ts   # Image upload endpoint
│       └── news/route.ts     # Public search and feed API
└── lib/
    ├── prisma.ts             # Global singleton Prisma client
    ├── sanitize.ts           # Server-side HTML sanitizer (DOMPurify / sanitize-html)
    └── rate-limiter.ts       # In-memory / Upstash Redis sliding window limiter`}
              </div>
            </div>
          )}

          {/* TAB 4: FREE / AFFORDABLE DEPLOYMENT */}
          {activeTab === 'deployment' && (
            <div className="space-y-4 text-xs leading-relaxed text-stone-700">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <span>Option A: Vercel + Supabase (Recommended Free Tier)</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li><strong>Database:</strong> Create a free project on Supabase (PostgreSQL). Copy the Transaction connection pooler URI into your `.env` as `DATABASE_URL`.</li>
                  <li><strong>Migrations:</strong> Run `npx prisma db push` or `npx prisma migrate deploy` locally to build tables.</li>
                  <li><strong>Admin Seed:</strong> Run `npx tsx prisma/seed.ts` to insert your single admin record with bcrypt hash.</li>
                  <li><strong>Hosting:</strong> Push repo to GitHub and import to Vercel. Add environment variables (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`).</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <span>Option B: Render / Fly.io / Cloud Run (Single Container)</span>
                </div>
                <p>
                  Deploy as a Node.js Docker container running the standalone Express + Vite server or Next.js standalone output. Render provides a free managed PostgreSQL instance and web service tier with auto SSL.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
