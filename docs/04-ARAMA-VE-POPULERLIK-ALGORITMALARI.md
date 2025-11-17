# 4. ARAMA VE POPÜLERLİK ALGORİTMALARI

## 4.1 Arama Sistemi Mimarisi

### Genel Akış
```
Kullanıcı Input
     │
     ▼
Input Normalizasyonu (lowercase, trim, türkçe karakter)
     │
     ▼
Meilisearch Query
     │
     ├──► Fuzzy Search (yazım hatası toleransı)
     ├──► Typo Tolerance (1-2 karakter hata)
     ├──► Prefix Search (autocomplete)
     └──► Faceted Search (filtreleme)
     │
     ▼
Sonuçları Ranking ile Sırala
     │
     ├──► Popülerlik Skoru (40%)
     ├──► Relevance Score (40%)
     └──► Recency (20%)
     │
     ▼
Search Log Kaydet
     │
     ▼
Return Results
```

---

## 4.2 Meilisearch Konfigürasyonu

### Index Oluşturma
```typescript
// lib/search/meilisearch-setup.ts

import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
});

export async function setupCelebrityIndex() {
  const index = client.index('celebrities');

  // 1. Searchable Attributes (aranacak alanlar, öncelik sırasına göre)
  await index.updateSearchableAttributes([
    'full_name',           // En yüksek öncelik
    'nickname',
    'first_name',
    'last_name',
    'profession',
    'tags',
    'bio_short',
  ]);

  // 2. Filterable Attributes (filtrelenebilir alanlar)
  await index.updateFilterableAttributes([
    'country',
    'profession',
    'tags',
    'is_verified',
    'visibility',
  ]);

  // 3. Sortable Attributes (sıralanabilir alanlar)
  await index.updateSortableAttributes([
    'popularity_score',
    'total_views',
    'total_searches',
    'created_at',
  ]);

  // 4. Ranking Rules (sıralama kuralları)
  await index.updateRankingRules([
    'words',              // Eşleşen kelime sayısı
    'typo',               // Yazım hatası toleransı
    'proximity',          // Kelimelerin yakınlığı
    'attribute',          // Hangi attribute'ta eşleşti
    'sort',               // Popülerlik skoru
    'exactness',          // Tam eşleşme
  ]);

  // 5. Typo Tolerance
  await index.updateTypoTolerance({
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,   // 4 karakterden sonra 1 hata tolere et
      twoTypos: 8,  // 8 karakterden sonra 2 hata tolere et
    },
  });

  // 6. Pagination
  await index.updatePagination({
    maxTotalHits: 1000,
  });

  // 7. Faceting
  await index.updateFaceting({
    maxValuesPerFacet: 100,
  });

  // 8. Display Attributes
  await index.updateDisplayedAttributes([
    'id',
    'slug',
    'full_name',
    'nickname',
    'profession',
    'profile_image_url',
    'country',
    'tags',
    'popularity_score',
    'bio_short',
  ]);

  console.log('✅ Celebrity index configured successfully');
}
```

---

## 4.3 Veri Senkronizasyonu

### PostgreSQL → Meilisearch Sync
```typescript
// scripts/sync-search-index.ts

import { PrismaClient } from '@prisma/client';
import { MeiliSearch } from 'meilisearch';

const prisma = new PrismaClient();
const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
});

interface SearchDocument {
  id: number;
  slug: string;
  full_name: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  profession: string | null;
  country: string | null;
  profile_image_url: string | null;
  bio_short: string | null;
  popularity_score: number;
  total_views: number;
  total_searches: number;
  tags: string[];
  is_verified: boolean;
  visibility: string;
  created_at: number; // Unix timestamp
}

export async function syncCelebritiesToSearch() {
  console.log('🔄 Syncing celebrities to Meilisearch...');

  const celebrities = await prisma.celebrity.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      translations: {
        where: {
          languageCode: 'tr', // Default language
        },
      },
    },
  });

  const documents: SearchDocument[] = celebrities.map((celeb) => ({
    id: celeb.id,
    slug: celeb.slug,
    full_name: celeb.fullName,
    first_name: celeb.firstName,
    last_name: celeb.lastName,
    nickname: celeb.nickname,
    profession: celeb.profession,
    country: celeb.country,
    profile_image_url: celeb.profileImageUrl,
    bio_short: celeb.translations[0]?.bioShort || null,
    popularity_score: Number(celeb.popularityScore),
    total_views: Number(celeb.totalViews),
    total_searches: Number(celeb.totalSearches),
    tags: celeb.tags.map((ct) => ct.tag.slug),
    is_verified: celeb.isVerified,
    visibility: celeb.visibility,
    created_at: Math.floor(celeb.createdAt.getTime() / 1000),
  }));

  const index = meili.index('celebrities');
  await index.addDocuments(documents, { primaryKey: 'id' });

  console.log(`✅ ${documents.length} celebrities synced to search index`);
}

// Tek bir celebrity'yi güncelle (CRUD işlemlerinde kullan)
export async function updateCelebrityInSearch(celebrityId: number) {
  const celebrity = await prisma.celebrity.findUnique({
    where: { id: celebrityId },
    include: {
      tags: { include: { tag: true } },
      translations: { where: { languageCode: 'tr' } },
    },
  });

  if (!celebrity) return;

  const document: SearchDocument = {
    id: celebrity.id,
    slug: celebrity.slug,
    full_name: celebrity.fullName,
    first_name: celebrity.firstName,
    last_name: celebrity.lastName,
    nickname: celebrity.nickname,
    profession: celebrity.profession,
    country: celebrity.country,
    profile_image_url: celebrity.profileImageUrl,
    bio_short: celebrity.translations[0]?.bioShort || null,
    popularity_score: Number(celebrity.popularityScore),
    total_views: Number(celebrity.totalViews),
    total_searches: Number(celebrity.totalSearches),
    tags: celebrity.tags.map((ct) => ct.tag.slug),
    is_verified: celebrity.isVerified,
    visibility: celebrity.visibility,
    created_at: Math.floor(celebrity.createdAt.getTime() / 1000),
  };

  const index = meili.index('celebrities');
  await index.addDocuments([document], { primaryKey: 'id' });
}
```

---

## 4.4 Arama Servisi

### Search Service Implementation
```typescript
// lib/services/search.service.ts

import { MeiliSearch, SearchParams } from 'meilisearch';
import { prisma } from '@/lib/db/prisma';

const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
});

export interface SearchOptions {
  query: string;
  filters?: {
    country?: string;
    profession?: string;
    tags?: string[];
    isVerified?: boolean;
  };
  sort?: 'relevance' | 'popularity' | 'name';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: number;
  slug: string;
  fullName: string;
  nickname: string | null;
  profession: string | null;
  profileImage: string | null;
  bioShort: string | null;
  tags: string[];
  popularityScore: number;
  isVerified: boolean;
  _matchScore?: number; // Meilisearch relevance score
}

export async function searchCelebrities(
  options: SearchOptions
): Promise<{
  results: SearchResult[];
  total: number;
  query: string;
  processingTime: number;
}> {
  const {
    query,
    filters = {},
    sort = 'relevance',
    limit = 20,
    offset = 0,
  } = options;

  // Query normalizasyonu
  const normalizedQuery = normalizeQuery(query);

  // Filter string oluştur
  const filterArray: string[] = ['visibility = published'];

  if (filters.country) {
    filterArray.push(`country = "${filters.country}"`);
  }
  if (filters.profession) {
    filterArray.push(`profession = "${filters.profession}"`);
  }
  if (filters.tags && filters.tags.length > 0) {
    const tagFilter = filters.tags.map(tag => `tags = "${tag}"`).join(' OR ');
    filterArray.push(`(${tagFilter})`);
  }
  if (filters.isVerified !== undefined) {
    filterArray.push(`is_verified = ${filters.isVerified}`);
  }

  // Sort parametresi
  let sortParam: string[] = [];
  if (sort === 'popularity') {
    sortParam = ['popularity_score:desc', 'total_views:desc'];
  } else if (sort === 'name') {
    sortParam = ['full_name:asc'];
  }
  // 'relevance' için sort parametresi yok (Meilisearch default ranking kullanır)

  const searchParams: SearchParams = {
    q: normalizedQuery,
    filter: filterArray.length > 0 ? filterArray : undefined,
    sort: sortParam.length > 0 ? sortParam : undefined,
    limit,
    offset,
    attributesToHighlight: ['full_name', 'nickname'],
    showMatchesPosition: true,
  };

  const index = meili.index('celebrities');
  const searchResponse = await index.search(normalizedQuery, searchParams);

  const results: SearchResult[] = searchResponse.hits.map((hit: any) => ({
    id: hit.id,
    slug: hit.slug,
    fullName: hit.full_name,
    nickname: hit.nickname,
    profession: hit.profession,
    profileImage: hit.profile_image_url,
    bioShort: hit.bio_short,
    tags: hit.tags || [],
    popularityScore: hit.popularity_score,
    isVerified: hit.is_verified,
    _matchScore: hit._rankingScore,
  }));

  return {
    results,
    total: searchResponse.estimatedTotalHits || 0,
    query: normalizedQuery,
    processingTime: searchResponse.processingTimeMs,
  };
}

// Query Normalizasyonu
function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' '); // Birden fazla boşluğu tek boşluğa indir
}

// Autocomplete (prefix search)
export async function autocomplete(
  query: string,
  limit: number = 8
): Promise<SearchResult[]> {
  const normalizedQuery = normalizeQuery(query);

  const index = meili.index('celebrities');
  const searchResponse = await index.search(normalizedQuery, {
    limit,
    filter: ['visibility = published'],
    attributesToSearchOn: ['full_name', 'nickname'],
    sort: ['popularity_score:desc'],
  });

  return searchResponse.hits.map((hit: any) => ({
    id: hit.id,
    slug: hit.slug,
    fullName: hit.full_name,
    nickname: hit.nickname,
    profession: hit.profession,
    profileImage: hit.profile_image_url,
    bioShort: hit.bio_short,
    tags: hit.tags || [],
    popularityScore: hit.popularity_score,
    isVerified: hit.is_verified,
  }));
}

// Faceted search (filtreleme için değer önerileri)
export async function getFacets(query: string = '') {
  const index = meili.index('celebrities');

  const searchResponse = await index.search(query, {
    facets: ['country', 'profession', 'tags'],
    limit: 0, // Sadece facet bilgisi istiyoruz
  });

  return searchResponse.facetDistribution;
}
```

---

## 4.5 Arama Log Sistemi

### Search Tracking
```typescript
// lib/services/analytics.service.ts

import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export async function logSearch(params: {
  query: string;
  resultsCount: number;
  userIp?: string;
  userAgent?: string;
  matchedCelebrityId?: number;
  clickedPosition?: number;
}) {
  const {
    query,
    resultsCount,
    userIp,
    userAgent,
    matchedCelebrityId,
    clickedPosition,
  } = params;

  // IP hash (GDPR compliance)
  const userIpHash = userIp
    ? crypto.createHash('sha256').update(userIp).digest('hex')
    : null;

  // Normalized query
  const normalizedQuery = query.trim().toLowerCase();

  await prisma.searchLog.create({
    data: {
      query,
      normalizedQuery,
      resultsCount,
      matchedCelebrityId,
      clickedPosition,
      userIpHash,
      userAgent,
    },
  });

  // Eğer bir celebrity tıklandıysa, search count'u artır
  if (matchedCelebrityId) {
    await prisma.celebrity.update({
      where: { id: matchedCelebrityId },
      data: {
        totalSearches: {
          increment: 1,
        },
      },
    });
  }
}

export async function logView(params: {
  celebrityId: number;
  pageType?: string;
  referrer?: string;
  userIp?: string;
  userAgent?: string;
  sessionId?: string;
}) {
  const {
    celebrityId,
    pageType = 'profile',
    referrer,
    userIp,
    userAgent,
    sessionId,
  } = params;

  const userIpHash = userIp
    ? crypto.createHash('sha256').update(userIp).digest('hex')
    : null;

  await prisma.viewLog.create({
    data: {
      celebrityId,
      pageType,
      referrer,
      userIpHash,
      userAgent,
      sessionId,
    },
  });

  // View count artır
  await prisma.celebrity.update({
    where: { id: celebrityId },
    data: {
      totalViews: {
        increment: 1,
      },
    },
  });
}

// En çok aranan sorgular (analytics için)
export async function getTopSearchQueries(params: {
  period: 'day' | 'week' | 'month';
  limit?: number;
}) {
  const { period, limit = 20 } = params;

  const dateThreshold = new Date();
  if (period === 'day') {
    dateThreshold.setDate(dateThreshold.getDate() - 1);
  } else if (period === 'week') {
    dateThreshold.setDate(dateThreshold.getDate() - 7);
  } else {
    dateThreshold.setDate(dateThreshold.getDate() - 30);
  }

  const topQueries = await prisma.searchLog.groupBy({
    by: ['normalizedQuery'],
    where: {
      createdAt: {
        gte: dateThreshold,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  });

  return topQueries.map((q) => ({
    query: q.normalizedQuery,
    count: q._count.id,
  }));
}
```

---

## 4.6 Popülerlik Algoritması

### Popülerlik Skoru Formülü
```typescript
// scripts/calculate-popularity.ts

/**
 * Popülerlik Skoru Hesaplama
 *
 * Formula:
 * popularity_score = (
 *   view_count * VIEW_WEIGHT +
 *   search_count * SEARCH_WEIGHT +
 *   social_mention_count * SOCIAL_WEIGHT
 * ) * TIME_DECAY_FACTOR
 *
 * Weights:
 * - Views: 0.3 (düşük - pasif aktivite)
 * - Searches: 0.5 (yüksek - aktif ilgi)
 * - Social mentions: 0.2 (orta - dışarıdan ilgi)
 *
 * Time Decay:
 * - Son 7 gün: 1.0 (tam puan)
 * - 8-14 gün: 0.7
 * - 15-30 gün: 0.4
 * - 30+ gün: 0.1
 */

import { prisma } from '@/lib/db/prisma';

const WEIGHTS = {
  VIEW: 0.3,
  SEARCH: 0.5,
  SOCIAL: 0.2,
};

export async function calculatePopularityScores(
  periodType: 'daily' | 'weekly' | 'monthly'
) {
  console.log(`📊 Calculating ${periodType} popularity scores...`);

  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  if (periodType === 'daily') {
    periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 1);
  } else if (periodType === 'weekly') {
    periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - 7);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(now);
  } else {
    periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - 30);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(now);
  }

  // Get all celebrities
  const celebrities = await prisma.celebrity.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
  });

  for (const celebrity of celebrities) {
    // View count
    const viewCount = await prisma.viewLog.count({
      where: {
        celebrityId: celebrity.id,
        createdAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    });

    // Search count
    const searchCount = await prisma.searchLog.count({
      where: {
        matchedCelebrityId: celebrity.id,
        createdAt: {
          gte: periodStart,
          lt: periodEnd,
        },
      },
    });

    // Social mention count (placeholder - could integrate with social APIs)
    const socialMentionCount = 0;

    // Calculate score
    const score =
      viewCount * WEIGHTS.VIEW +
      searchCount * WEIGHTS.SEARCH +
      socialMentionCount * WEIGHTS.SOCIAL;

    // Time decay factor
    const timeDecayFactor = calculateTimeDecay(periodStart, now);
    const finalScore = score * timeDecayFactor;

    // Upsert popularity stat
    await prisma.popularityStat.upsert({
      where: {
        celebrityId_periodType_periodStart: {
          celebrityId: celebrity.id,
          periodType,
          periodStart,
        },
      },
      update: {
        periodEnd,
        viewCount,
        searchCount,
        socialMentionCount,
        popularityScore: finalScore,
      },
      create: {
        celebrityId: celebrity.id,
        periodType,
        periodStart,
        periodEnd,
        viewCount,
        searchCount,
        socialMentionCount,
        popularityScore: finalScore,
      },
    });
  }

  // Rank celebrities
  await rankCelebrities(periodType, periodStart);

  console.log(`✅ ${celebrities.length} celebrities processed`);
}

function calculateTimeDecay(periodStart: Date, now: Date): number {
  const daysAgo = Math.floor(
    (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysAgo <= 7) return 1.0;
  if (daysAgo <= 14) return 0.7;
  if (daysAgo <= 30) return 0.4;
  return 0.1;
}

async function rankCelebrities(periodType: string, periodStart: Date) {
  const stats = await prisma.popularityStat.findMany({
    where: {
      periodType,
      periodStart,
    },
    orderBy: {
      popularityScore: 'desc',
    },
  });

  let rank = 1;
  for (const stat of stats) {
    await prisma.popularityStat.update({
      where: { id: stat.id },
      data: { rankPosition: rank },
    });
    rank++;
  }
}

// Update overall celebrity popularity score
export async function updateCelebrityPopularityScore(celebrityId: number) {
  // Son 4 haftalık popülerlik skorlarının ortalaması
  const recentStats = await prisma.popularityStat.findMany({
    where: {
      celebrityId,
      periodType: 'weekly',
      periodStart: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
      },
    },
    orderBy: {
      periodStart: 'desc',
    },
    take: 4,
  });

  const avgScore =
    recentStats.reduce((sum, stat) => sum + Number(stat.popularityScore), 0) /
    (recentStats.length || 1);

  await prisma.celebrity.update({
    where: { id: celebrityId },
    data: {
      popularityScore: avgScore,
    },
  });
}
```

---

## 4.7 Cron Jobs (Zamanlanmış Görevler)

### Vercel Cron (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/calculate-popularity",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/sync-search-index",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/cron/cleanup-old-logs",
      "schedule": "0 4 * * 0"
    }
  ]
}
```

### Cron Endpoint Örneği
```typescript
// app/api/cron/calculate-popularity/route.ts

import { NextResponse } from 'next/server';
import { calculatePopularityScores } from '@/lib/services/popularity.service';

export async function GET(request: Request) {
  // Verify cron secret (güvenlik)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Günlük
    await calculatePopularityScores('daily');

    // Haftalık (her pazartesi)
    const today = new Date().getDay();
    if (today === 1) {
      await calculatePopularityScores('weekly');
    }

    // Aylık (her ayın 1'i)
    const dayOfMonth = new Date().getDate();
    if (dayOfMonth === 1) {
      await calculatePopularityScores('monthly');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 4.8 Önerilen Ünlüler (Similar People)

### Benzerlik Algoritması
```typescript
// lib/services/recommendation.service.ts

import { prisma } from '@/lib/db/prisma';

export async function getSimilarCelebrities(
  celebrityId: number,
  limit: number = 8
): Promise<Celebrity[]> {
  const baseCelebrity = await prisma.celebrity.findUnique({
    where: { id: celebrityId },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!baseCelebrity) return [];

  const baseTagIds = baseCelebrity.tags.map((ct) => ct.tagId);

  // Benzer ünlüler bul
  const similar = await prisma.celebrity.findMany({
    where: {
      id: { not: celebrityId },
      visibility: 'published',
      deletedAt: null,
      OR: [
        // Aynı meslek
        { profession: baseCelebrity.profession },
        // Aynı ülke
        { country: baseCelebrity.country },
        // En az 2 ortak tag
        {
          tags: {
            some: {
              tagId: { in: baseTagIds },
            },
          },
        },
      ],
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
    take: 50, // İlk 50'yi al, sonra skorlayacağız
  });

  // Benzerlik skorları hesapla
  const scored = similar.map((celeb) => {
    let score = 0;

    // Aynı meslek: +10
    if (celeb.profession === baseCelebrity.profession) {
      score += 10;
    }

    // Aynı ülke: +5
    if (celeb.country === baseCelebrity.country) {
      score += 5;
    }

    // Ortak tag'ler: her biri +3
    const celebTagIds = celeb.tags.map((ct) => ct.tagId);
    const commonTags = baseTagIds.filter((id) => celebTagIds.includes(id));
    score += commonTags.length * 3;

    // Popülerlik bonusu (normalize edilmiş)
    score += Number(celeb.popularityScore) * 0.1;

    return {
      celebrity: celeb,
      similarityScore: score,
    };
  });

  // Skora göre sırala ve limit uygula
  return scored
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map((item) => item.celebrity);
}
```

---

## 4.9 Performans Optimizasyonları

### Redis Cache Stratejisi
```typescript
// lib/cache/search-cache.ts

import { redis } from '@/lib/cache/redis';

const CACHE_TTL = {
  SEARCH_RESULTS: 60 * 5, // 5 dakika
  AUTOCOMPLETE: 60 * 10,  // 10 dakika
  POPULAR: 60 * 60,       // 1 saat
  TRENDING: 60 * 30,      // 30 dakika
};

export async function getCachedSearch(cacheKey: string) {
  const cached = await redis.get(cacheKey);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedSearch(
  cacheKey: string,
  data: any,
  ttl: number = CACHE_TTL.SEARCH_RESULTS
) {
  await redis.setex(cacheKey, ttl, JSON.stringify(data));
}

export function generateSearchCacheKey(
  query: string,
  filters: any,
  sort: string
): string {
  return `search:${query}:${JSON.stringify(filters)}:${sort}`;
}
```

### Debounced Search (Frontend)
```typescript
// hooks/useDebounce.ts

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

Bu arama ve popülerlik algoritmaları, platformun temel fonksiyonlarını oluşturur ve kullanıcı deneyimini optimize eder.
