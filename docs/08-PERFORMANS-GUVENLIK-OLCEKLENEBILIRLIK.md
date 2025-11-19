# 8. PERFORMANS, GÜVENLİK VE ÖLÇEKLENEBİLİRLİK

## 8.1 Performans Optimizasyonları

### 8.1.1 Next.js Performance Features

#### Image Optimization
```tsx
import Image from 'next/image';

// ✅ Next.js Image component (otomatik optimization)
<Image
  src="/celebrity.jpg"
  alt="Celebrity"
  width={800}
  height={600}
  priority={false}  // Above-the-fold için true
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ❌ Regular img tag
<img src="/celebrity.jpg" alt="Celebrity" />
```

**Avantajlar:**
- Automatic WebP/AVIF conversion
- Lazy loading
- Responsive images
- Blur placeholder
- CDN optimization

#### Font Optimization
```tsx
// app/layout.tsx
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

#### Code Splitting & Lazy Loading
```tsx
// Dynamic imports
import dynamic from 'next/dynamic';

// Heavy component - sadece gerektiğinde yükle
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-side only
});

// Modal - kullanıcı açana kadar yükleme
const Modal = dynamic(() => import('@/components/Modal'));
```

---

### 8.1.2 Caching Strategy

#### Redis Caching
```typescript
// lib/cache/redis.ts

import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!);

// Cache helper
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// Invalidate cache
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

**Cache Keys Convention:**
```
celebrity:{slug}:{locale}           # Celebrity data
search:{query}:{filters}:{sort}     # Search results
popular:{period}:{limit}            # Popular celebrities
birthdays:{date}                    # Born today
stats:{celebrity_id}:{period}       # Analytics
```

#### HTTP Caching (CDN)
```tsx
// API Route with cache headers
export async function GET(request: Request) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'public, s-maxage=7200',
    },
  });
}
```

#### ISR (Incremental Static Regeneration)
```tsx
// app/[locale]/u/[slug]/page.tsx

export default async function CelebrityPage() {
  // ...
}

// Revalidate every 1 hour
export const revalidate = 3600;

// On-demand revalidation (when content changes)
// app/api/revalidate/route.ts
export async function POST(request: Request) {
  const { slug } = await request.json();

  try {
    await revalidatePath(`/tr/u/${slug}`);
    await revalidatePath(`/en/u/${slug}`);
    return NextResponse.json({ revalidated: true });
  } catch (err) {
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
```

---

### 8.1.3 Database Optimization

#### Indexing Strategy
```sql
-- Kritik indexes
CREATE INDEX idx_celebrities_slug ON celebrities(slug);
CREATE INDEX idx_celebrities_visibility ON celebrities(visibility) WHERE deleted_at IS NULL;
CREATE INDEX idx_celebrities_popularity ON celebrities(popularity_score DESC);
CREATE INDEX idx_celebrities_birth_date ON celebrities(birth_date);
CREATE INDEX idx_celebrities_country_profession ON celebrities(country, profession);

-- Composite indexes
CREATE INDEX idx_celebrity_tags_lookup ON celebrity_tags(tag_id, celebrity_id);
CREATE INDEX idx_view_logs_analytics ON view_logs(celebrity_id, created_at DESC);
CREATE INDEX idx_search_logs_analytics ON search_logs(normalized_query, created_at DESC);

-- Partial indexes
CREATE INDEX idx_published_celebrities ON celebrities(popularity_score DESC)
  WHERE visibility = 'published' AND deleted_at IS NULL;
```

#### Query Optimization (Prisma)
```typescript
// ✅ Good - Select only needed fields
const celebrity = await prisma.celebrity.findUnique({
  where: { slug },
  select: {
    id: true,
    fullName: true,
    profileImageUrl: true,
    // Only needed fields
  },
});

// ❌ Bad - Select everything
const celebrity = await prisma.celebrity.findUnique({
  where: { slug },
});

// ✅ Good - Use include wisely
const celebrity = await prisma.celebrity.findUnique({
  where: { slug },
  include: {
    tags: {
      select: {
        tag: {
          select: { id: true, slug: true, nameTr: true },
        },
      },
    },
  },
});

// ✅ Good - Pagination
const celebrities = await prisma.celebrity.findMany({
  take: 20,
  skip: page * 20,
  cursor: lastId ? { id: lastId } : undefined,
});
```

#### Connection Pooling
```typescript
// lib/db/prisma.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

```env
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/celebdb?connection_limit=20&pool_timeout=20"
```

---

### 8.1.4 Bundle Size Optimization

#### Analyze Bundle
```bash
# package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}

npm install -D @next/bundle-analyzer
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... config
});
```

#### Tree Shaking & Code Splitting
```typescript
// ✅ Named imports (tree-shakable)
import { Button } from '@/components/ui/button';

// ❌ Default import (whole library)
import * as Components from '@/components';

// ✅ Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

---

## 8.2 Güvenlik

### 8.2.1 Authentication & Authorization

#### Secure Password Hashing
```typescript
import bcrypt from 'bcryptjs';

// Hash password
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, passwordHash);
```

#### JWT Token Management
```typescript
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export function generateToken(payload: any) {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
```

#### Role-Based Access Control
```typescript
// lib/auth/permissions.ts

export const PERMISSIONS = {
  ADMIN: ['read', 'write', 'delete', 'manage_users'],
  EDITOR: ['read', 'write'],
  VIEWER: ['read'],
};

export function hasPermission(role: string, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) || false;
}

// Middleware
export async function requirePermission(permission: string) {
  const session = await requireAuth();

  if (!hasPermission(session.user.role, permission)) {
    throw new Error('Insufficient permissions');
  }

  return session;
}
```

---

### 8.2.2 Input Validation & Sanitization

#### Zod Validation
```typescript
import { z } from 'zod';

// Celebrity schema
const celebritySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  nickname: z.string().max(100).optional(),
  birthDate: z.coerce.date().optional(),
  profession: z.string().max(255).optional(),
  profileImageUrl: z.string().url().optional(),
});

// Validate request body
export async function POST(request: Request) {
  const body = await request.json();

  try {
    const validData = celebritySchema.parse(body);
    // Process valid data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
  }
}
```

#### XSS Prevention
```tsx
// ✅ React automatically escapes
<p>{userInput}</p>

// ⚠️ Dangerous (only if absolutely needed)
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />

// Sanitize HTML
import DOMPurify from 'isomorphic-dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
  ALLOWED_ATTR: ['href', 'target'],
});
```

#### SQL Injection Prevention
```typescript
// ✅ Prisma (parameterized queries)
await prisma.celebrity.findMany({
  where: {
    fullName: {
      contains: userInput, // Safe - parameterized
    },
  },
});

// ❌ Raw SQL (vulnerable)
await prisma.$queryRaw`SELECT * FROM celebrities WHERE name = '${userInput}'`;

// ✅ Raw SQL (safe - parameterized)
await prisma.$queryRaw`SELECT * FROM celebrities WHERE name = ${userInput}`;
```

---

### 8.2.3 CSRF & CORS Protection

#### CSRF Tokens
```typescript
// Already handled by NextAuth.js

// For custom forms
import { getCsrfToken } from 'next-auth/react';

const csrfToken = await getCsrfToken();

<form method="post" action="/api/some-action">
  <input type="hidden" name="csrfToken" value={csrfToken} />
  {/* ... */}
</form>
```

#### CORS Configuration
```typescript
// app/api/public/route.ts

export async function GET(request: Request) {
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': 'https://celebritybio.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

### 8.2.4 Rate Limiting

```typescript
// lib/middleware/rate-limit.ts

import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function rateLimit(
  identifier: string, // IP, user ID, etc.
  limit: number = 10,
  window: number = 60 // seconds
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate-limit:${identifier}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, window);
  }

  const ttl = await redis.ttl(key);
  const remaining = Math.max(0, limit - current);

  return {
    success: current <= limit,
    remaining,
  };
}

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  const { success, remaining } = await rateLimit(ip, 10, 60);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'Retry-After': '60',
        },
      }
    );
  }

  // Process request
}
```

---

### 8.2.5 Security Headers

```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 8.3 Ölçeklenebilirlik

### 8.3.1 Horizontal Scaling

#### Load Balancing (Vercel)
```
Vercel otomatik olarak:
- Auto-scaling
- Load balancing
- Global CDN
- Edge functions
```

#### Self-hosted (Docker + Nginx)
```yaml
# docker-compose.yml

version: '3.8'

services:
  app1:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379

  app2:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app1
      - app2

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: celebdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
```

```nginx
# nginx.conf

upstream nextjs {
    server app1:3000;
    server app2:3000;
}

server {
    listen 80;
    server_name celebritybio.com;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### 8.3.2 Database Scaling

#### Read Replicas
```typescript
// lib/db/prisma-read.ts

// Read replica configuration
export const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_REPLICA_URL,
    },
  },
});

// Usage
// Writes → primary
await prisma.celebrity.create({ data: newCelebrity });

// Reads → replica
const celebrities = await prismaRead.celebrity.findMany();
```

#### Connection Pooling (PgBouncer)
```bash
# Install PgBouncer
docker run -d \
  --name pgbouncer \
  -e DATABASES_HOST=postgres \
  -e DATABASES_PORT=5432 \
  -e DATABASES_USER=user \
  -e DATABASES_PASSWORD=password \
  -e DATABASES_DBNAME=celebdb \
  -e PGBOUNCER_POOL_MODE=transaction \
  -e PGBOUNCER_MAX_CLIENT_CONN=1000 \
  -e PGBOUNCER_DEFAULT_POOL_SIZE=25 \
  -p 6432:6432 \
  edoburu/pgbouncer
```

```env
# Use PgBouncer
DATABASE_URL="postgresql://user:pass@localhost:6432/celebdb?pgbouncer=true"
```

---

### 8.3.3 Monitoring & Alerting

#### Sentry Error Tracking
```typescript
// sentry.client.config.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

#### Performance Monitoring
```typescript
// lib/monitoring/performance.ts

export function trackPerformance(name: string, duration: number) {
  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name,
      value: duration,
      event_category: 'Performance',
    });
  }
}

// Usage
const start = performance.now();
await someOperation();
const duration = performance.now() - start;
trackPerformance('some_operation', duration);
```

#### Health Check Endpoint
```typescript
// app/api/health/route.ts

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    meilisearch: false,
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Redis check
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  const allHealthy = Object.values(checks).every((check) => check === true);

  return NextResponse.json(
    { status: allHealthy ? 'healthy' : 'unhealthy', checks },
    { status: allHealthy ? 200 : 503 }
  );
}
```

---

### 8.3.4 CDN & Edge Caching

#### Vercel Edge Network
```typescript
// app/api/edge-function/route.ts

export const runtime = 'edge'; // Edge runtime

export async function GET(request: Request) {
  // Runs on edge (closer to user)
  return NextResponse.json({ message: 'Hello from edge!' });
}
```

#### Cloudflare Integration
```javascript
// cloudflare-worker.js

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const cache = caches.default;

  // Try cache first
  let response = await cache.match(request);

  if (!response) {
    // Fetch from origin
    response = await fetch(request);

    // Cache for 1 hour
    response = new Response(response.body, response);
    response.headers.set('Cache-Control', 'public, max-age=3600');

    event.waitUntil(cache.put(request, response.clone()));
  }

  return response;
}
```

---

Bu kapsamlı performans, güvenlik ve ölçeklenebilirlik stratejisi, platformun büyüme ihtiyaçlarını karşılamak için tasarlanmıştır.
