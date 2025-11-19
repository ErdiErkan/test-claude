# 1. GENEL MİMARİ

## 1.1 Teknoloji Stack'i

### Frontend
- **Next.js 14+** (App Router)
  - Server-Side Rendering (SSR) ve Static Site Generation (SSG) desteği
  - File-based routing
  - Built-in image optimization
  - API Routes için backend entegrasyonu

- **TypeScript**
  - Tip güvenliği ve daha az hata
  - Gelişmiş IDE desteği
  - Kod dokümantasyonu

- **React 18+**
  - Server Components desteği
  - Suspense ve streaming

- **Tailwind CSS**
  - Hızlı UI geliştirme
  - Responsive design
  - Production'da küçük bundle boyutu

- **shadcn/ui**
  - Özelleştirilebilir component library
  - Accessibility odaklı

### Backend & API
- **Next.js API Routes** (alternatif: NestJS)
  - RESTful API endpoints
  - Route handlers
  - Middleware desteği

- **Prisma ORM**
  - Type-safe database client
  - Migration yönetimi
  - Multi-database desteği

### Database
- **PostgreSQL 14+**
  - İlişkisel veri yapısı
  - JSONB desteği (çoklu dil, metadata)
  - Full-text search yetenekleri
  - Güçlü indeksleme

### Arama Servisi
- **Meilisearch** (önerilen) veya **Elasticsearch**
  - Türkçe karakter desteği
  - Fuzzy search (yazım hatası toleransı)
  - Instant search / autocomplete
  - Typo tolerance
  - Faceted search (filtreleme)
  - Kolay kurulum ve ölçeklendirme

### Dosya Depolama
- **AWS S3** veya **Cloudflare R2**
  - Profil fotoğrafları
  - Haber görselleri
  - CDN entegrasyonu

### Cache & Performance
- **Redis**
  - API response caching
  - Session yönetimi
  - Rate limiting
  - Popülerlik skorları için geçici depolama

### İzleme & Analytics
- **Vercel Analytics** veya **Google Analytics 4**
- **Sentry** - Error tracking
- **Upstash** - Edge compatible Redis

---

## 1.2 Neden Bu Stack?

### Next.js Seçimi
```
✅ SEO için kritik: SSR/SSG desteği
✅ File-based routing: Kolay sayfa yönetimi
✅ Image optimization: Automatic WebP/AVIF conversion
✅ Built-in i18n: Çoklu dil desteği
✅ API Routes: Tek repo'da full-stack
✅ Edge Runtime: Global performans
✅ Incremental Static Regeneration (ISR): Dinamik + hızlı
```

### PostgreSQL + Prisma
```
✅ İlişkisel veri modeli için ideal
✅ ACID compliance (veri bütünlüğü)
✅ JSONB ile esnek veri yapıları
✅ Prisma: Type-safe, migration yönetimi
✅ N+1 problem çözümü (include, select)
```

### Meilisearch
```
✅ Türkçe karakter desteği (ü, ş, ğ, ı)
✅ Çok hızlı (Rust tabanlı)
✅ Kolay kurulum
✅ Autocomplete ve instant search
✅ Düşük resource kullanımı
✅ Self-hosted veya cloud seçenekleri
```

---

## 1.3 Yüksek Seviye Mimari Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                         KULLANICI                            │
│                    (Web Browser / Mobile)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    CDN (Cloudflare/Vercel)                   │
│          - Static Assets (CSS, JS, Images)                   │
│          - Edge Caching                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    NEXT.JS APPLICATION                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FRONTEND (React Server Components)                  │   │
│  │  - Pages (SSR/SSG)                                    │   │
│  │  - Components                                         │   │
│  │  - i18n Routing                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API ROUTES (Backend Logic)                          │   │
│  │  - /api/celebrities/[slug]                           │   │
│  │  - /api/search                                        │   │
│  │  - /api/news                                          │   │
│  │  - /api/admin/*                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BUSINESS LOGIC LAYER                                │   │
│  │  - Services (CelebrityService, NewsService)          │   │
│  │  - Utilities (SEO, Analytics, Cache)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└───────┬──────────────────┬────────────────┬────────────────┘
        │                  │                │
        │                  │                │
┌───────▼────────┐  ┌─────▼─────┐   ┌─────▼──────┐
│   PostgreSQL   │  │Meilisearch│   │   Redis    │
│                │  │           │   │            │
│ - Celebrities  │  │ - Search  │   │ - Cache    │
│ - News         │  │   Index   │   │ - Session  │
│ - Tags         │  │ - Auto    │   │ - Rate     │
│ - Stats        │  │   complete│   │   Limit    │
│ - Translations │  │           │   │            │
└────────────────┘  └───────────┘   └────────────┘
        │
        │
┌───────▼────────┐
│   S3/R2        │
│                │
│ - Profile Pics │
│ - News Images  │
│ - Media Assets │
└────────────────┘
```

---

## 1.4 Data Flow Örnekleri

### Biyografi Sayfası Yükleme (SSR)
```
1. User → /u/burak-ozdemir isteği
2. Next.js SSR → generateMetadata() çalışır
3. Prisma → PostgreSQL'den celebrity data çeker
4. Redis → Cache kontrolü (varsa return)
5. Page render → React Server Component
6. SEO tags inject → JSON-LD, meta tags
7. Response → HTML + data browser'a gönderilir
8. Client-side hydration
9. Analytics → View log kaydedilir
```

### Arama İşlemi
```
1. User → Arama kutusuna "burak öz" yazar
2. Debounced input (300ms)
3. API → /api/search?q=burak%20öz
4. Meilisearch → Fuzzy search + autocomplete
5. Results → Match edilen celebrities
6. Frontend → Dropdown'da sonuçları göster
7. User → Bir sonuca tıklar
8. Analytics → Search query + celebrity_id log'la
9. Redirect → Biyografi sayfasına
```

### Popülerlik Skoru Hesaplama (Cron Job)
```
1. Cron (her gece 02:00)
2. Aggregate → view_logs ve search_logs'dan data
3. Calculate → popularity_score formula uygula
4. Update → popularity_stats tablosunu güncelle
5. Cache invalidation → Redis cache temizle
6. Meilisearch → Popülerlik skorlarını güncelle (ranking)
```

---

## 1.5 Deployment Stratejisi

### Önerilen Platform: **Vercel**
```
✅ Next.js native desteği
✅ Automatic deployments (Git push)
✅ Preview deployments (PR'lar için)
✅ Edge Functions
✅ Analytics built-in
✅ Kolay environment variables
```

### Alternatif: **Self-hosted (Docker)**
```
- Docker Compose ile tüm servisler
- Nginx reverse proxy
- PostgreSQL container
- Meilisearch container
- Redis container
- Next.js standalone output
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml örneği
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run tests
      - Build Next.js
      - Run database migrations
      - Deploy to Vercel
      - Sync Meilisearch index
```

---

## 1.6 Ortam Yönetimi

### Environment Variables (.env)
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/celebdb"

# Search
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="masterKey"

# Storage
S3_BUCKET="celebrity-platform-media"
S3_REGION="eu-central-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Redis
REDIS_URL="redis://localhost:6379"

# Auth (Admin Panel)
NEXTAUTH_SECRET="random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
SENTRY_DSN="https://..."

# Public URLs
NEXT_PUBLIC_APP_URL="https://celebritybio.com"
```

---

## 1.7 Folder Structure (Detaylı)

```
celebrity-bio-platform/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docs/                          # Tüm dokümantasyon
│   ├── 01-GENEL-MIMARI.md
│   ├── 02-VERI-MODELI.md
│   ├── 03-SAYFA-YAPISI.md
│   ├── 04-ARAMA-ALGORITMALARI.md
│   ├── 05-SEO-STRATEJISI.md
│   └── 06-DEPLOYMENT.md
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/                # Migration history
│   └── seed.ts                    # Seed data
│
├── public/
│   ├── images/
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── [locale]/              # i18n routing
│   │   │   ├── (main)/           # Main site layout group
│   │   │   │   ├── page.tsx       # Ana sayfa
│   │   │   │   ├── u/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx  # Biyografi detay
│   │   │   │   ├── tag/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx  # Tag sayfası
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── news/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── popular/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── birthdays/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── (admin)/          # Admin layout group
│   │   │       └── admin/
│   │   │           ├── dashboard/
│   │   │           ├── celebrities/
│   │   │           ├── news/
│   │   │           └── settings/
│   │   │
│   │   ├── api/                   # API Routes
│   │   │   ├── celebrities/
│   │   │   │   ├── route.ts
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   ├── news/
│   │   │   ├── admin/
│   │   │   └── analytics/
│   │   │
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── celebrity/
│   │   │   ├── CelebrityCard.tsx
│   │   │   ├── CelebrityProfile.tsx
│   │   │   ├── SocialLinks.tsx
│   │   │   └── SimilarPeople.tsx
│   │   ├── home/
│   │   │   ├── CelebrityOfTheDay.tsx
│   │   │   ├── BornToday.tsx
│   │   │   ├── TrendingList.tsx
│   │   │   └── PopularSearches.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   └── seo/
│   │       ├── JsonLd.tsx
│   │       └── MetaTags.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts          # Prisma client singleton
│   │   ├── search/
│   │   │   └── meilisearch.ts     # Meilisearch client
│   │   ├── cache/
│   │   │   └── redis.ts           # Redis client
│   │   ├── services/
│   │   │   ├── celebrity.service.ts
│   │   │   ├── news.service.ts
│   │   │   ├── search.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── utils/
│   │   │   ├── seo.ts
│   │   │   ├── date.ts
│   │   │   ├── slug.ts
│   │   │   └── zodiac.ts          # Burç hesaplama
│   │   └── i18n/
│   │       ├── config.ts
│   │       └── translations/
│   │           ├── tr.json
│   │           └── en.json
│   │
│   ├── types/
│   │   ├── celebrity.ts
│   │   ├── news.ts
│   │   ├── search.ts
│   │   └── api.ts
│   │
│   └── config/
│       ├── site.ts                # Site metadata
│       ├── seo.ts                 # SEO config
│       └── constants.ts
│
├── scripts/
│   ├── sync-search-index.ts      # Meilisearch sync
│   ├── calculate-popularity.ts   # Cron job
│   └── generate-sitemap.ts       # Sitemap generator
│
├── .env.local
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 1.8 Geliştirme Workflow'u

```bash
# 1. Proje kurulumu
npm install

# 2. Database setup
npx prisma migrate dev
npx prisma db seed

# 3. Meilisearch index oluştur
npm run search:sync

# 4. Development server
npm run dev

# 5. Type checking
npm run type-check

# 6. Build production
npm run build

# 7. Start production
npm run start
```

---

## 1.9 Üçüncü Parti Entegrasyonlar

### Sosyal Medya Metadata
- **Open Graph** (Facebook, LinkedIn)
- **Twitter Cards**
- **WhatsApp preview**

### SEO Tools
- **Google Search Console** integration
- **Bing Webmaster Tools**
- **Schema.org** validation

### Analytics & Monitoring
- **Google Analytics 4**
- **Sentry** error tracking
- **Vercel Analytics** (opsiyonel)
- **LogRocket** (kullanıcı session replay)

### Performance Monitoring
- **Lighthouse CI**
- **Core Web Vitals** tracking
- **PageSpeed Insights** API

---

Bu mimari, ölçeklenebilir, performanslı ve SEO dostu bir platform için sağlam bir temel oluşturur. Sıradaki dokümanlarda her bir katmanı detaylandıracağız.
