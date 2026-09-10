export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  articleCount?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // rich HTML
  coverImage: string;
  coverImageCaption?: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  status: 'draft' | 'published';
  views: number;
  readingTimeMinutes: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  tags: string[];
  isFeatured?: boolean;
  isBreaking?: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'admin';
  lastLogin?: string;
}

export interface SecurityStatus {
  singleAdminEnforced: boolean;
  registrationDisabled: boolean;
  bcryptSaltRounds: number;
  jwtExpiryMinutes: number;
  rateLimiterActive: boolean;
  remainingAttempts?: number;
  isLockedOut?: boolean;
  lockoutRemainingSeconds?: number;
  xssSanitizationActive: boolean;
  csrfProtected: boolean;
  sqlInjectionPrevented: boolean;
}

export interface RateLimitInfo {
  attempts: number;
  lockedUntil: number | null;
}
