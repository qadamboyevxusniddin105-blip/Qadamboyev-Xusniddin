import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { Article, Category, AdminUser } from '../src/types.js';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'news_db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export interface StoredAdmin {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'admin';
  lastLogin?: string;
}

export interface DBState {
  admin: StoredAdmin;
  categories: Category[];
  articles: Article[];
}

// Initial Admin Credentials
export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@chronicle.news';
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecure2026!#News';

// Pre-computed bcrypt hash for DEFAULT_ADMIN_PASSWORD with salt rounds 12
const INITIAL_ADMIN_HASH = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 12);

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-world',
    name: 'World & Politics',
    slug: 'world-politics',
    description: 'Geopolitical developments, international policy, and global diplomacy.',
    color: '#b91c1c'
  },
  {
    id: 'cat-tech',
    name: 'Technology & AI',
    slug: 'tech-ai',
    description: 'Frontiers of artificial intelligence, semiconductor shifts, and digital privacy.',
    color: '#0284c7'
  },
  {
    id: 'cat-business',
    name: 'Business & Markets',
    slug: 'business-markets',
    description: 'Macroeconomics, central bank maneuvers, energy markets, and enterprise.',
    color: '#059669'
  },
  {
    id: 'cat-science',
    name: 'Science & Climate',
    slug: 'science-climate',
    description: 'Breakthrough research, space exploration, and ecological transformations.',
    color: '#7c3aed'
  },
  {
    id: 'cat-culture',
    name: 'Culture & Ideas',
    slug: 'culture-ideas',
    description: 'Literary critiques, philosophical essays, architecture, and living history.',
    color: '#d97706'
  }
];

const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-001',
    title: 'The Great Semiconductor Shift: How Next-Gen Architectures Are Redefining Global Sovereignty',
    slug: 'great-semiconductor-shift-next-gen-architectures',
    excerpt: 'As sub-2-nanometer lithography reaches production and specialized neural processing units dominate datacenters, the geopolitical map of silicon fabrication enters an unprecedented era of strategic re-alignment.',
    content: `
      <p>In the high-precision cleanrooms of advanced semiconductor fabrication facilities, a quiet revolution is taking place. The transition to sub-2-nanometer gate-all-around (GAA) nanosheet transistors represents not merely an engineering milestone, but a fundamental realignment of technological power.</p>
      
      <h2>Beyond Moore's Law: The Physics of 2nm Fabrication</h2>
      <p>For decades, scaling followed the predictable cadence of Dennard scaling and classical optical lithography. Today, extreme ultraviolet (EUV) systems operating at high numerical apertures (High-NA) are etching circuits with tolerances measured in single-digit angstroms.</p>
      
      <blockquote>"Sovereignty in the twenty-first century is etched in silicon wafers. The nations that command the synthesis of design tools, lithography optics, and chemical purity will govern the contours of artificial intelligence."</blockquote>

      <p>Specialized accelerator architectures have largely supplanted general-purpose computing across enterprise workflows. Neural processing clusters, optical interconnects, and silicon photonics are eliminating the classic memory bottlenecks that have long constrained computing.</p>

      <h2>Geopolitical Realignment and Foundry Resilience</h2>
      <p>Global supply chains, once hyper-optimized for singular geographic nodes, are undergoing aggressive diversification. Multi-billion dollar capital expenditure programs in Europe, North America, and East Asia are establishing localized fabrication hubs designed to withstand systemic macroeconomic disruptions.</p>

      <ul>
        <li><strong>Thermal dissipation breakthroughs:</strong> Diamond-substrate heat spreaders enabling higher frequency ceilings.</li>
        <li><strong>Advanced 3D packaging:</strong> Heterogeneous chiplet stacking overcoming yield limitations of monolithic dies.</li>
        <li><strong>Supply chain domesticity:</strong> Critical isotope and photoresist manufacturing facilities coming online globally.</li>
      </ul>

      <p>As computational demand expands exponentially with multi-modal reasoning models, the strategic value of resilient foundry capacity will remain the defining macroeconomic focal point of this decade.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    coverImageCaption: 'Silicon wafer fabrication under ultra-pure extreme ultraviolet lithography illumination.',
    categoryId: 'cat-tech',
    status: 'published',
    views: 14280,
    readingTimeMinutes: 6,
    author: {
      name: 'Elena Vance, Senior Tech Editor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      role: 'Chief Technology Correspondent'
    },
    tags: ['Semiconductors', 'Artificial Intelligence', 'Hardware', 'Geopolitics'],
    isFeatured: true,
    isBreaking: true,
    publishedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'art-002',
    title: 'Central Banks at the Crossroads: Balancing Liquidity and Sovereign Debt in a Multipolar Economy',
    slug: 'central-banks-crossroads-liquidity-sovereign-debt',
    excerpt: 'Monetary authorities navigate stubborn inflationary pressures against mounting debt refinancing cycles, testing the limits of quantitative tightening.',
    content: `
      <p>Global bond markets are signaling a structural departure from the post-2008 low-rate paradigm. As sovereign debt maturities approach refinancing deadlines under elevated interest rate structures, central banking governors face an intricate balancing act between price stability and financial system liquidity.</p>
      
      <h2>The Terminal Rate Conundrum</h2>
      <p>Yield curve dynamics across sovereign debt instruments suggest that long-term real interest rates will settle substantially higher than the neutral estimates established in the previous decade. Supply chain re-shoring, climate adaptation expenditures, and demographic shifts are contributing to persistent baseline costs.</p>

      <blockquote>"We are witnessing the unwinding of an era of virtually free liquidity. Capital discipline is returning to asset allocation with undeniable clarity."</blockquote>

      <h2>Implications for Global Trade Settlements</h2>
      <p>Bilateral currency settlement mechanisms and expanded cross-border payment corridors are accelerating the shift toward multi-currency reserve holdings. Treasury departments and sovereign wealth funds are rebalancing portfolio allocations into tangible commodities and inflation-hedged infrastructure assets.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Financial exchange floors experiencing heightened trading volumes across sovereign instruments.',
    categoryId: 'cat-business',
    status: 'published',
    views: 8940,
    readingTimeMinutes: 5,
    author: {
      name: 'Julian Sterling',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Senior Economics Analyst'
    },
    tags: ['Economy', 'Central Banks', 'Macro', 'Sovereign Debt'],
    isFeatured: false,
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'art-003',
    title: 'The James Webb Survey Reveals Deep-Cosmos Anomalies Defying Standard Galactic Models',
    slug: 'james-webb-survey-deep-cosmos-anomalies',
    excerpt: 'High-redshift observations of ultra-massive early galaxies challenge our established timelines for stellar nucleation and dark matter halo formation.',
    content: `
      <p>Data streaming from the infrared spectrographs of the James Webb Space Telescope continues to challenge astrophysicists worldwide. Galaxies observed at redshifts exceeding z=10—corresponding to merely 350 million years after the Big Bang—display masses, luminosities, and metallicity levels previously deemed impossible under standard cosmological models.</p>
      
      <h2>The Early Massive Galaxy Paradox</h2>
      <p>Under standard Lambda-CDM cosmology, galactic structures assemble hierarchically through iterative gravitational accretion over billions of years. Yet, recent spectroscopic surveys confirm dense galactic cores teeming with mature stellar populations in the cosmic dawn.</p>

      <h2>Alternative Theoretical Frameworks</h2>
      <p>Researchers are exploring novel explanations, ranging from primordial black hole seeds acting as gravitational catalysts to modifications in primordial density perturbation power spectra.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Deep-field infrared survey capturing stellar nucleation across high-redshift cosmic dawn.',
    categoryId: 'cat-science',
    status: 'published',
    views: 12450,
    readingTimeMinutes: 4,
    author: {
      name: 'Dr. Aris Thorne',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Science & Cosmology Editor'
    },
    tags: ['Cosmology', 'JWST', 'Astrophysics', 'Space'],
    isFeatured: false,
    publishedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'art-004',
    title: 'Urban Architecture and the Revival of Tactile Materiality: Wood, Stone, and Daylight',
    slug: 'urban-architecture-revival-tactile-materiality',
    excerpt: 'Leading architects are discarding sterile glass-and-steel facades in favor of cross-laminated timber, local quarry stone, and biophilic natural airflow systems.',
    content: `
      <p>For more than half a century, the international urban landscape has been dominated by reflective curtain glass and anodized steel. However, a decisive cultural and ecological pivot is currently reshaping the skylines of global metropolises.</p>
      
      <h2>The Rise of Mass Timber and Carbon Sequestration</h2>
      <p>Cross-laminated timber (CLT) high-rises are no longer experimental novelties. Structurally engineered mass timber provides superior seismic resilience, natural acoustic dampening, and permanent carbon sequestration, turning architectural edifices into ecological assets.</p>

      <blockquote>"Architecture should engage human senses, not simply reflect sunlight into adjacent avenues. Tactility, scent, and natural light restore human dignity to metropolitan life."</blockquote>

      <h2>Passive Solar and Thermal Massing</h2>
      <p>By pairing local limestone and sandstone with smart geothermal ventilation plenums, contemporary architects are achieving net-zero operational footprints without reliance on fragile mechanical HVAC systems.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Sustainably engineered mass timber and natural stone civic forum pavilion.',
    categoryId: 'cat-culture',
    status: 'published',
    views: 6320,
    readingTimeMinutes: 5,
    author: {
      name: 'Marcus Bell',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      role: 'Architecture & Design Critic'
    },
    tags: ['Architecture', 'Sustainability', 'Urbanism', 'Design'],
    isFeatured: false,
    publishedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
  {
    id: 'art-005',
    title: 'Draft Preview: The Diplomatic Summit on Autonomous AI Treaties',
    slug: 'draft-preview-diplomatic-summit-autonomous-ai',
    excerpt: 'An internal editorial briefing ahead of the upcoming multilateral summit in Geneva regarding computational safety benchmarks and defensive deployment accords.',
    content: `
      <p>This draft briefing covers the projected agenda for the multilateral consultative accord in Geneva. Key negotiating pillars include verification protocols for high-capacity frontier weights, common auditing standards, and containment containment procedures.</p>
      <p>Further updates will be published once delegates formalize the preliminary working group communiqués.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Geneva convention hall preparatory session for international technology standards.',
    categoryId: 'cat-world',
    status: 'draft',
    views: 45,
    readingTimeMinutes: 2,
    author: {
      name: 'Elena Vance, Senior Tech Editor',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      role: 'Chief Technology Correspondent'
    },
    tags: ['Diplomacy', 'Artificial Intelligence', 'Regulation'],
    isFeatured: false,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

class DatabaseService {
  private state: DBState;

  constructor() {
    this.state = this.loadDatabase();
  }

  private loadDatabase(): DBState {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.admin && parsed.articles && parsed.categories) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to read existing DB file, re-initializing default data', err);
      }
    }

    const defaultState: DBState = {
      admin: {
        id: 'admin-01',
        email: DEFAULT_ADMIN_EMAIL,
        username: 'Chief Editor',
        passwordHash: INITIAL_ADMIN_HASH,
        role: 'admin'
      },
      categories: INITIAL_CATEGORIES,
      articles: INITIAL_ARTICLES
    };

    this.saveDatabase(defaultState);
    return defaultState;
  }

  private saveDatabase(state: DBState = this.state): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist DB to file:', err);
    }
  }

  // Admin access
  public getAdmin(): StoredAdmin {
    return this.state.admin;
  }

  public updateAdminLastLogin(date: string): void {
    this.state.admin.lastLogin = date;
    this.saveDatabase();
  }

  // Categories CRUD
  public getCategories(): Category[] {
    return this.state.categories.map(cat => ({
      ...cat,
      articleCount: this.state.articles.filter(a => a.categoryId === cat.id && a.status === 'published').length
    }));
  }

  public getCategoryById(id: string): Category | undefined {
    return this.state.categories.find(c => c.id === id);
  }

  public createCategory(data: { name: string; slug: string; description: string; color: string }): Category {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: data.description.trim(),
      color: data.color || '#b91c1c'
    };
    this.state.categories.push(newCategory);
    this.saveDatabase();
    return newCategory;
  }

  public updateCategory(id: string, data: Partial<Category>): Category | null {
    const idx = this.state.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.state.categories[idx] = {
      ...this.state.categories[idx],
      ...data,
      id
    };
    this.saveDatabase();
    return this.state.categories[idx];
  }

  public deleteCategory(id: string): boolean {
    const idx = this.state.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.state.categories.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  // Articles CRUD
  public getArticles(options?: { includeDrafts?: boolean; categorySlug?: string; search?: string }): Article[] {
    let result = [...this.state.articles];

    if (!options?.includeDrafts) {
      result = result.filter(a => a.status === 'published');
    }

    if (options?.categorySlug) {
      const category = this.state.categories.find(c => c.slug === options.categorySlug);
      if (category) {
        result = result.filter(a => a.categoryId === category.id);
      }
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort descending by publishedAt or createdAt
    result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());

    // Enrich with category name
    return result.map(a => {
      const cat = this.state.categories.find(c => c.id === a.categoryId);
      return {
        ...a,
        categoryName: cat?.name || 'General',
        categorySlug: cat?.slug || 'general'
      };
    });
  }

  public getArticleBySlug(slug: string, options?: { includeDrafts?: boolean }): Article | null {
    const article = this.state.articles.find(a => a.slug === slug);
    if (!article) return null;
    if (!options?.includeDrafts && article.status !== 'published') return null;

    const cat = this.state.categories.find(c => c.id === article.categoryId);
    return {
      ...article,
      categoryName: cat?.name || 'General',
      categorySlug: cat?.slug || 'general'
    };
  }

  public getArticleById(id: string): Article | null {
    const article = this.state.articles.find(a => a.id === id);
    if (!article) return null;
    const cat = this.state.categories.find(c => c.id === article.categoryId);
    return {
      ...article,
      categoryName: cat?.name || 'General',
      categorySlug: cat?.slug || 'general'
    };
  }

  public incrementArticleViews(slug: string): number {
    const article = this.state.articles.find(a => a.slug === slug);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.saveDatabase();
      return article.views;
    }
    return 0;
  }

  public createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'readingTimeMinutes'>): Article {
    // Generate unique slug
    let baseSlug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let finalSlug = baseSlug;
    let counter = 1;
    while (this.state.articles.some(a => a.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    const words = (data.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 220));

    const newArticle: Article = {
      ...data,
      id: `art-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: finalSlug,
      views: 0,
      readingTimeMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: data.status === 'published' ? (data.publishedAt || new Date().toISOString()) : new Date().toISOString()
    };

    this.state.articles.unshift(newArticle);
    this.saveDatabase();
    return newArticle;
  }

  public updateArticle(id: string, data: Partial<Article>): Article | null {
    const idx = this.state.articles.findIndex(a => a.id === id);
    if (idx === -1) return null;

    const existing = this.state.articles[idx];

    // Check slug uniqueness if slug changed
    let slug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      let baseSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let finalSlug = baseSlug;
      let counter = 1;
      while (this.state.articles.some(a => a.slug === finalSlug && a.id !== id)) {
        finalSlug = `${baseSlug}-${counter++}`;
      }
      slug = finalSlug;
    }

    let readingTimeMinutes = existing.readingTimeMinutes;
    if (data.content) {
      const words = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      readingTimeMinutes = Math.max(1, Math.ceil(words / 220));
    }

    this.state.articles[idx] = {
      ...existing,
      ...data,
      id,
      slug,
      readingTimeMinutes,
      updatedAt: new Date().toISOString()
    };

    this.saveDatabase();
    return this.state.articles[idx];
  }

  public deleteArticle(id: string): boolean {
    const idx = this.state.articles.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.state.articles.splice(idx, 1);
    this.saveDatabase();
    return true;
  }

  public resetSampleData(): void {
    this.state.categories = [...INITIAL_CATEGORIES];
    this.state.articles = [...INITIAL_ARTICLES];
    this.saveDatabase();
  }
}

export const db = new DatabaseService();
