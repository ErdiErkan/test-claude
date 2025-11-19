# 5. SEO VE YAPILANDIRILMIŞ VERİ STRATEJİSİ

## 5.1 Teknik SEO Temelleri

### URL Yapısı
```
✅ Temiz ve Anlamlı
/tr/u/burak-ozdemir
/en/u/burak-ozdemir
/tr/etiket/youtuber
/en/tag/youtuber

❌ Kötü Örnekler
/celebrity?id=123
/profile.php?name=burak
/tr/ünlü/burç-özdemir (URL'de özel karakter)
```

### robots.txt
```txt
# public/robots.txt

User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin/
Disallow: /api/admin/

# Disallow API routes (except specific ones)
Disallow: /api/
Allow: /api/og-image/

# Sitemap
Sitemap: https://celebritybio.com/sitemap.xml
Sitemap: https://celebritybio.com/sitemap-celebrities.xml
Sitemap: https://celebritybio.com/sitemap-news.xml
Sitemap: https://celebritybio.com/sitemap-tags.xml
```

### Sitemap Generation
```typescript
// app/sitemap.ts (Next.js 14)

import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://celebritybio.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tr`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ];

  // Celebrity pages
  const celebrities = await prisma.celebrity.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
    select: {
      slug: true,
      updatedAt: true,
      popularityScore: true,
    },
    orderBy: {
      popularityScore: 'desc',
    },
  });

  const celebrityPages = celebrities.flatMap((celeb) => [
    {
      url: `${baseUrl}/tr/u/${celeb.slug}`,
      lastModified: celeb.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: Math.min(0.9, 0.6 + Number(celeb.popularityScore) / 1000),
    },
    {
      url: `${baseUrl}/en/u/${celeb.slug}`,
      lastModified: celeb.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: Math.min(0.9, 0.6 + Number(celeb.popularityScore) / 1000),
    },
  ]);

  return [...staticPages, ...celebrityPages];
}
```

---

## 5.2 Meta Tags Yapısı

### Meta Tags Component
```typescript
// lib/utils/seo.ts

import { Metadata } from 'next';

export function generateCelebrityMetadata(
  celebrity: any,
  translation: any,
  locale: string
): Metadata {
  const baseUrl = 'https://celebritybio.com';

  const title = locale === 'tr'
    ? `${celebrity.fullName} Kimdir? Biyografisi, Yaşı, Burcu | Celebrity Bio`
    : `Who is ${celebrity.fullName}? Biography, Age & Facts | Celebrity Bio`;

  const description = translation?.bioShort ||
    `${celebrity.fullName} - ${celebrity.profession}`;

  return {
    title,
    description,
    keywords: [
      celebrity.fullName,
      celebrity.nickname,
      celebrity.profession,
      celebrity.country,
      locale === 'tr' ? 'biyografi' : 'biography',
      locale === 'tr' ? 'kimdir' : 'who is',
    ].filter(Boolean) as string[],

    // Open Graph
    openGraph: {
      type: 'profile',
      title,
      description,
      url: `${baseUrl}/${locale}/u/${celebrity.slug}`,
      siteName: 'Celebrity Bio',
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      images: [
        {
          url: celebrity.profileImageUrl || `${baseUrl}/default-og.jpg`,
          width: 1200,
          height: 630,
          alt: celebrity.fullName,
        },
      ],
      firstName: celebrity.firstName,
      lastName: celebrity.lastName,
      username: celebrity.nickname || undefined,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@celebritybio',
      creator: '@celebritybio',
      title,
      description,
      images: [celebrity.profileImageUrl || `${baseUrl}/default-og.jpg`],
    },

    // Alternate Languages
    alternates: {
      canonical: `${baseUrl}/${locale}/u/${celebrity.slug}`,
      languages: {
        'tr': `${baseUrl}/tr/u/${celebrity.slug}`,
        'en': `${baseUrl}/en/u/${celebrity.slug}`,
        'x-default': `${baseUrl}/en/u/${celebrity.slug}`,
      },
    },

    // Additional Meta
    authors: [{ name: 'Celebrity Bio Team' }],
    category: celebrity.profession || 'Celebrity',

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification (optional)
    verification: {
      google: 'google-site-verification-code',
      yandex: 'yandex-verification-code',
    },
  };
}
```

---

## 5.3 Yapılandırılmış Veri (Schema.org)

### Person Schema (JSON-LD)
```typescript
// lib/utils/seo.ts

import { Celebrity } from '@prisma/client';

export function generatePersonSchema(celebrity: any, locale: string) {
  const baseUrl = 'https://celebritybio.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/${locale}/u/${celebrity.slug}#person`,
    name: celebrity.fullName,
    alternateName: celebrity.nickname || undefined,
    description: celebrity.translations[0]?.bioShort || celebrity.profession,
    url: `${baseUrl}/${locale}/u/${celebrity.slug}`,
    image: {
      '@type': 'ImageObject',
      url: celebrity.profileImageUrl || `${baseUrl}/default-avatar.jpg`,
      width: 800,
      height: 800,
    },
    birthDate: celebrity.birthDate?.toISOString().split('T')[0],
    birthPlace: celebrity.birthPlace
      ? {
          '@type': 'Place',
          name: celebrity.birthPlace,
        }
      : undefined,
    nationality: celebrity.country
      ? {
          '@type': 'Country',
          name: celebrity.country,
        }
      : undefined,
    jobTitle: celebrity.profession || undefined,

    // Social Media Links
    sameAs: celebrity.socialLinks
      ?.filter((link: any) => link.url)
      .map((link: any) => link.url) || [],

    // Additional Properties
    knowsAbout: celebrity.tags?.map((ct: any) => ct.tag.slug) || [],

    // Aggregate Rating (optional - if you have user ratings)
    aggregateRating: celebrity.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: celebrity.rating.average,
          reviewCount: celebrity.rating.count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}
```

### NewsArticle Schema
```typescript
// lib/utils/seo.ts

export function generateNewsArticleSchema(news: any, locale: string) {
  const baseUrl = 'https://celebritybio.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${baseUrl}/${locale}/news/${news.slug}#article`,
    headline: news.translations[0]?.title,
    description: news.translations[0]?.summary,
    image: news.featuredImageUrl
      ? {
          '@type': 'ImageObject',
          url: news.featuredImageUrl,
          width: 1200,
          height: 630,
        }
      : undefined,
    datePublished: news.publishedAt?.toISOString(),
    dateModified: news.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Celebrity Bio',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Celebrity Bio',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/${locale}/news/${news.slug}`,
    },
    // Related persons
    about: news.celebrities?.map((nc: any) => ({
      '@type': 'Person',
      name: nc.celebrity.fullName,
      url: `${baseUrl}/${locale}/u/${nc.celebrity.slug}`,
    })),
  };
}
```

### BreadcrumbList Schema
```typescript
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  locale: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Kullanım örneği
const breadcrumbs = generateBreadcrumbSchema(
  [
    { name: 'Ana Sayfa', url: 'https://celebritybio.com/tr' },
    { name: 'YouTuberlar', url: 'https://celebritybio.com/tr/etiket/youtuber' },
    { name: 'Burak Özdemir', url: 'https://celebritybio.com/tr/u/burak-ozdemir' },
  ],
  'tr'
);
```

### WebSite Schema (Site-wide)
```typescript
// app/layout.tsx veya root layout

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Celebrity Bio',
    url: 'https://celebritybio.com',
    description: 'Celebrity and influencer biographies, social media stats, and interesting facts.',
    publisher: {
      '@type': 'Organization',
      name: 'Celebrity Bio',
      logo: {
        '@type': 'ImageObject',
        url: 'https://celebritybio.com/logo.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://celebritybio.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['tr', 'en'],
  };
}
```

---

## 5.4 JSON-LD Component
```typescript
// components/seo/JsonLd.tsx

interface JsonLdProps {
  data: object;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}

// Kullanım
import JsonLd from '@/components/seo/JsonLd';
import { generatePersonSchema } from '@/lib/utils/seo';

export default function CelebrityPage({ celebrity }) {
  const personSchema = generatePersonSchema(celebrity, 'tr');

  return (
    <>
      <JsonLd data={personSchema} />
      {/* Page content */}
    </>
  );
}
```

---

## 5.5 hreflang Implementation

### Next.js Metadata API ile hreflang
```typescript
// app/[locale]/u/[slug]/page.tsx

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug, locale } = params;
  const baseUrl = 'https://celebritybio.com';

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}/u/${slug}`,
      languages: {
        'tr': `${baseUrl}/tr/u/${slug}`,
        'en': `${baseUrl}/en/u/${slug}`,
        'x-default': `${baseUrl}/en/u/${slug}`,
      },
    },
  };
}
```

Çıktı:
```html
<link rel="canonical" href="https://celebritybio.com/tr/u/burak-ozdemir" />
<link rel="alternate" hreflang="tr" href="https://celebritybio.com/tr/u/burak-ozdemir" />
<link rel="alternate" hreflang="en" href="https://celebritybio.com/en/u/burak-ozdemir" />
<link rel="alternate" hreflang="x-default" href="https://celebritybio.com/en/u/burak-ozdemir" />
```

---

## 5.6 İç Linkleme Stratejisi

### Otomatik İç Link Ekleme
```typescript
// lib/utils/internal-linking.ts

/**
 * Biyografi metnine otomatik iç linkler ekle
 */
export function addInternalLinks(
  content: string,
  relatedCelebrities: Array<{ fullName: string; slug: string }>,
  locale: string
): string {
  let linkedContent = content;

  relatedCelebrities.forEach(({ fullName, slug }) => {
    // İlk eşleşmeyi linkle (duplicate linkleri önle)
    const regex = new RegExp(`\\b${fullName}\\b`, 'i');
    linkedContent = linkedContent.replace(
      regex,
      `<a href="/${locale}/u/${slug}" class="text-purple-600 hover:underline">${fullName}</a>`
    );
  });

  return linkedContent;
}
```

### Stratejik İç Linkler
```
1. Ana Sayfa → Kategoriler (YouTuber, Oyuncu, vb.)
2. Ana Sayfa → Popüler Biyografiler
3. Biyografi → Benzer Kişiler
4. Biyografi → Etiket Sayfaları
5. Biyografi → İlgili Haberler
6. Haberler → İlgili Ünlüler
7. Etiket Sayfası → Benzer Etiketler
8. Footer → Tüm Ana Kategoriler
```

---

## 5.7 Performans SEO (Core Web Vitals)

### Image Optimization
```tsx
// Next.js Image component kullanımı

import Image from 'next/image';

<Image
  src={celebrity.profileImageUrl}
  alt={celebrity.fullName}
  width={800}
  height={800}
  priority={false} // Above-the-fold için true
  loading="lazy"
  placeholder="blur"
  blurDataURL={celebrity.blurDataUrl} // Optional
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Font Optimization
```tsx
// app/layout.tsx

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Lazy Loading
```tsx
// components/home/TrendingBios.tsx

'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function TrendingBios() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView ? <ActualContent /> : <Skeleton />}
    </div>
  );
}
```

---

## 5.8 SEO Checklist

### On-Page SEO
```
✅ Unique, descriptive titles (50-60 karakter)
✅ Compelling meta descriptions (150-160 karakter)
✅ H1 tag (sadece 1 tane, sayfanın ana başlığı)
✅ H2-H6 hiyerarşisi (mantıklı yapı)
✅ Alt text for all images
✅ Internal linking (en az 3-5 link/sayfa)
✅ External linking (kaynak linkler için nofollow)
✅ URL structure (clean, keyword-rich)
✅ Mobile-friendly (responsive design)
✅ Fast loading (Core Web Vitals)
✅ HTTPS (SSL certificate)
✅ Canonical tags
✅ Structured data (JSON-LD)
```

### Technical SEO
```
✅ XML sitemap
✅ robots.txt
✅ 301 redirects (eski URL'ler için)
✅ 404 error handling (custom page)
✅ hreflang tags (multi-language)
✅ Pagination (rel=next/prev veya load more)
✅ Duplicate content önleme
✅ Breadcrumbs
✅ Rich snippets (schema markup)
```

### Content SEO
```
✅ Unique content (duplicate değil)
✅ Long-form content (en az 300 kelime)
✅ Keyword optimization (natural, not stuffed)
✅ Fresh content (regular updates)
✅ Multimedia (images, videos)
✅ User engagement (comments, shares)
```

---

## 5.9 Google Search Console Integration

### Sitemap Submission
```typescript
// scripts/submit-sitemap.ts

async function submitSitemap() {
  const sitemaps = [
    'https://celebritybio.com/sitemap.xml',
    'https://celebritybio.com/sitemap-celebrities.xml',
    'https://celebritybio.com/sitemap-news.xml',
  ];

  for (const sitemap of sitemaps) {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`;
    await fetch(pingUrl);
    console.log(`Submitted: ${sitemap}`);
  }
}
```

### Rich Results Testing
- https://search.google.com/test/rich-results
- https://validator.schema.org/

---

Bu SEO stratejisi, organik arama trafiğini maksimize etmek için tasarlanmıştır. Düzenli olarak Google Search Console ve Google Analytics verilerini analiz ederek optimizasyonlar yapılmalıdır.
