# 6. ÇOKLU DİL DESTEĞİ (i18n)

## 6.1 i18n Stratejisi

### Çoklu Dil Yaklaşımı
```
1. UI Metinleri → JSON translation files (next-intl)
2. Dinamik İçerik → Database (celebrity_translations, news_translations)
3. URL Routing → Locale-based routing ([locale]/...)
```

---

## 6.2 Next.js i18n Konfigürasyonu

### Middleware Setup
```typescript
// middleware.ts

import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Desteklenen diller
  locales: ['tr', 'en'],

  // Varsayılan dil
  defaultLocale: 'tr',

  // Locale detection
  localeDetection: true,

  // Locale prefix stratejisi
  localePrefix: 'always', // /tr/..., /en/...
});

export const config = {
  // Matcher: i18n için hangi path'ler
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### Root Layout
```typescript
// app/[locale]/layout.tsx

import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return [{ locale: 'tr' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`@/lib/i18n/translations/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## 6.3 Translation Files

### Turkish (tr.json)
```json
{
  "common": {
    "search": "Ara",
    "home": "Ana Sayfa",
    "about": "Hakkımızda",
    "contact": "İletişim",
    "language": "Dil",
    "readMore": "Devamını Oku",
    "viewAll": "Tümünü Gör",
    "loading": "Yükleniyor...",
    "error": "Bir hata oluştu"
  },
  "home": {
    "title": "Ünlü ve Fenomen Biyografileri",
    "subtitle": "En ünlü YouTuber, TikTok fenomeni, oyuncu ve şarkıcıların hayat hikayeleri",
    "searchPlaceholder": "Ünlü veya fenomen ara...",
    "celebrityOfDay": "Günün Ünlüsü",
    "bornToday": "Bugün Doğan Ünlüler",
    "topSearched": "En Çok Arananlar",
    "trending": "Trend Biyografiler",
    "categories": "Kategoriler"
  },
  "celebrity": {
    "biography": "Biyografi",
    "funFacts": "İlginç Bilgiler",
    "socialMedia": "Sosyal Medya",
    "tags": "Etiketler",
    "similarPeople": "Benzer Kişiler",
    "relatedNews": "Güncel Haberler",
    "birthDate": "Doğum Tarihi",
    "birthPlace": "Doğum Yeri",
    "profession": "Meslek",
    "age": "yaş",
    "verified": "Doğrulanmış Profil"
  },
  "news": {
    "title": "Güncel Haberler",
    "latest": "Son Haberler",
    "readMore": "Haberi Oku",
    "publishedOn": "Yayınlanma Tarihi",
    "source": "Kaynak",
    "relatedCelebrities": "İlgili Ünlüler"
  },
  "search": {
    "title": "Arama Sonuçları",
    "resultsFor": "\"{query}\" için sonuçlar",
    "noResults": "Sonuç bulunamadı",
    "foundResults": "{count} sonuç bulundu",
    "filters": "Filtreler",
    "sortBy": "Sırala",
    "relevance": "İlgili",
    "popularity": "Popülerlik",
    "name": "İsim"
  },
  "popular": {
    "title": "Popülerlik Sıralaması",
    "thisWeek": "Bu Hafta",
    "thisMonth": "Bu Ay",
    "allTime": "Tüm Zamanlar",
    "views": "görüntüleme",
    "searches": "arama"
  },
  "birthdays": {
    "title": "Doğum Günü Takvimi",
    "bornToday": "Bugün Doğanlar",
    "bornOn": "{date} tarihinde doğanlar",
    "selectDate": "Tarih Seç",
    "month": "Ay",
    "day": "Gün"
  },
  "footer": {
    "description": "Ünlülerin ve fenomenlerin biyografileri, sosyal medya hesapları ve ilginç bilgileri.",
    "categories": "Kategoriler",
    "pages": "Sayfalar",
    "legal": "Yasal",
    "privacyPolicy": "Gizlilik Politikası",
    "termsOfService": "Kullanım Koşulları",
    "cookiePolicy": "Çerez Politikası",
    "copyright": "© {year} Celebrity Bio. Tüm hakları saklıdır."
  }
}
```

### English (en.json)
```json
{
  "common": {
    "search": "Search",
    "home": "Home",
    "about": "About",
    "contact": "Contact",
    "language": "Language",
    "readMore": "Read More",
    "viewAll": "View All",
    "loading": "Loading...",
    "error": "An error occurred"
  },
  "home": {
    "title": "Celebrity & Influencer Biographies",
    "subtitle": "Life stories of the most famous YouTubers, TikTok stars, actors and singers",
    "searchPlaceholder": "Search for celebrities or influencers...",
    "celebrityOfDay": "Celebrity of the Day",
    "bornToday": "Born Today",
    "topSearched": "Most Searched",
    "trending": "Trending Biographies",
    "categories": "Categories"
  },
  "celebrity": {
    "biography": "Biography",
    "funFacts": "Fun Facts",
    "socialMedia": "Social Media",
    "tags": "Tags",
    "similarPeople": "Similar People",
    "relatedNews": "Latest News",
    "birthDate": "Birth Date",
    "birthPlace": "Birth Place",
    "profession": "Profession",
    "age": "years old",
    "verified": "Verified Profile"
  },
  "news": {
    "title": "Latest News",
    "latest": "Latest News",
    "readMore": "Read Article",
    "publishedOn": "Published On",
    "source": "Source",
    "relatedCelebrities": "Related Celebrities"
  },
  "search": {
    "title": "Search Results",
    "resultsFor": "Results for \"{query}\"",
    "noResults": "No results found",
    "foundResults": "{count} results found",
    "filters": "Filters",
    "sortBy": "Sort By",
    "relevance": "Relevance",
    "popularity": "Popularity",
    "name": "Name"
  },
  "popular": {
    "title": "Popularity Rankings",
    "thisWeek": "This Week",
    "thisMonth": "This Month",
    "allTime": "All Time",
    "views": "views",
    "searches": "searches"
  },
  "birthdays": {
    "title": "Birthday Calendar",
    "bornToday": "Born Today",
    "bornOn": "Born on {date}",
    "selectDate": "Select Date",
    "month": "Month",
    "day": "Day"
  },
  "footer": {
    "description": "Biographies, social media accounts and fun facts of celebrities and influencers.",
    "categories": "Categories",
    "pages": "Pages",
    "legal": "Legal",
    "privacyPolicy": "Privacy Policy",
    "termsOfService": "Terms of Service",
    "cookiePolicy": "Cookie Policy",
    "copyright": "© {year} Celebrity Bio. All rights reserved."
  }
}
```

---

## 6.4 Using Translations (Client Components)

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function SearchBar() {
  const t = useTranslations('common');

  return (
    <input
      type="text"
      placeholder={t('search')}
      className="px-4 py-2 border rounded"
    />
  );
}
```

---

## 6.5 Using Translations (Server Components)

```tsx
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

---

## 6.6 Database Content Translation

### Service Layer
```typescript
// lib/services/celebrity.service.ts

import { prisma } from '@/lib/db/prisma';

export async function getCelebrityBySlug(slug: string, locale: string) {
  const celebrity = await prisma.celebrity.findUnique({
    where: { slug },
    include: {
      translations: {
        where: {
          languageCode: locale,
        },
      },
      // ... other includes
    },
  });

  if (!celebrity) return null;

  // Fallback to default language if translation not found
  if (celebrity.translations.length === 0) {
    const defaultTranslation = await prisma.celebrityTranslation.findFirst({
      where: {
        celebrityId: celebrity.id,
        languageCode: 'en', // Default fallback
      },
    });

    if (defaultTranslation) {
      celebrity.translations = [defaultTranslation];
    }
  }

  return celebrity;
}
```

---

## 6.7 Language Switcher Component

```tsx
// components/layout/LanguageSwitcher.tsx

'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    // pathname: /tr/u/burak-ozdemir
    // → /en/u/burak-ozdemir
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
        <Globe className="w-5 h-5" />
        <span>{languages.find((l) => l.code === locale)?.flag}</span>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${
              locale === lang.code ? 'bg-purple-50 text-purple-600' : ''
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 6.8 URL Localization

### Route Mapping (TR ↔ EN)
```typescript
// lib/i18n/route-mapping.ts

export const routeMapping = {
  tr: {
    etiket: 'tag',
    ara: 'search',
    haberler: 'news',
    populer: 'popular',
    'dogum-gunu': 'birthdays',
    hakkimizda: 'about',
    iletisim: 'contact',
  },
  en: {
    tag: 'etiket',
    search: 'ara',
    news: 'haberler',
    popular: 'populer',
    birthdays: 'dogum-gunu',
    about: 'hakkimizda',
    contact: 'iletisim',
  },
};

export function getLocalizedRoute(path: string, fromLocale: string, toLocale: string): string {
  const mapping = routeMapping[fromLocale as keyof typeof routeMapping];

  let localizedPath = path;

  Object.entries(mapping).forEach(([from, to]) => {
    localizedPath = localizedPath.replace(`/${from}/`, `/${to}/`);
    localizedPath = localizedPath.replace(`/${from}`, `/${to}`);
  });

  return localizedPath;
}
```

---

## 6.9 Date & Number Localization

```typescript
// lib/utils/format.ts

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatNumber(num: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatRelativeTime(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const diffInSeconds = Math.floor((date.getTime() - Date.now()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) >= 1) {
    return rtf.format(diffInDays, 'day');
  }
  if (Math.abs(diffInHours) >= 1) {
    return rtf.format(diffInHours, 'hour');
  }
  if (Math.abs(diffInMinutes) >= 1) {
    return rtf.format(diffInMinutes, 'minute');
  }
  return rtf.format(diffInSeconds, 'second');
}
```

---

## 6.10 Best Practices

### Translation Management
```
✅ Merkezi translation files
✅ Nested JSON structure (organizasyon için)
✅ Fallback mechanism (eksik translation için)
✅ Type-safe translations (TypeScript)
✅ Translation validation (missing keys kontrolü)
```

### SEO Considerations
```
✅ hreflang tags (her sayfa için)
✅ Canonical URLs (dil bazlı)
✅ Separate sitemaps (dil başına)
✅ Localized meta tags
✅ x-default hreflang (default dil)
```

### Performance
```
✅ Static translations (JSON files)
✅ Database translation caching
✅ Lazy load translations
✅ Code splitting per locale
```

---

Bu çoklu dil yapısı, kolayca yeni diller eklemeye ve yönetmeye olanak tanır.
