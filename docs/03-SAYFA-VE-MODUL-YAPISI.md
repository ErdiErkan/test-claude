# 3. SAYFA VE MODÜL YAPISI

## 3.1 Routing Stratejisi (Next.js App Router)

### i18n URL Yapısı
```
/tr/                          → Ana sayfa (Türkçe)
/en/                          → Ana sayfa (İngilizce)
/tr/u/[slug]                  → Biyografi detay (Türkçe)
/en/u/[slug]                  → Biyografi detay (İngilizce)
/tr/etiket/[slug]             → Tag sayfası (Türkçe)
/en/tag/[slug]                → Tag sayfası (İngilizce)
```

### Folder Structure
```
src/app/
├── [locale]/                  # i18n routing
│   ├── layout.tsx            # Locale-specific layout
│   ├── page.tsx              # Ana sayfa
│   │
│   ├── u/                    # "u" = user/celebrity
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   │
│   ├── (etiket)/             # Route group (URL'de görünmez)
│   │   ├── etiket/           # TR için
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── tag/              # EN için
│   │       └── [slug]/
│   │           └── page.tsx
│   │
│   ├── (haberler)/
│   │   ├── haberler/         # TR için
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── news/             # EN için
│   │       ├── page.tsx
│   │       └── [slug]/
│   │           └── page.tsx
│   │
│   ├── (populer)/
│   │   ├── populer/          # TR
│   │   │   └── page.tsx
│   │   └── popular/          # EN
│   │       └── page.tsx
│   │
│   ├── (dogum-gunu)/
│   │   ├── dogum-gunu/       # TR
│   │   │   └── page.tsx
│   │   └── birthdays/        # EN
│   │       └── page.tsx
│   │
│   ├── (ara)/
│   │   ├── ara/              # TR
│   │   │   └── page.tsx
│   │   └── search/           # EN
│   │       └── page.tsx
│   │
│   └── (static)/
│       ├── hakkimizda/       # TR
│       │   └── page.tsx
│       ├── about/            # EN
│       │   └── page.tsx
│       ├── iletisim/
│       │   └── page.tsx
│       └── contact/
│           └── page.tsx
│
└── api/                      # API Routes (dil-agnostik)
    ├── celebrities/
    ├── search/
    ├── news/
    └── analytics/
```

---

## 3.2 Ana Sayfa (`/`)

### URL
- TR: `https://celebritybio.com/tr`
- EN: `https://celebritybio.com/en`

### SEO Meta
```typescript
{
  title: "Ünlü ve Fenomen Biyografileri | Celebrity Bio",
  description: "Türkiye ve dünyanın en ünlü YouTuber, TikTok fenomeni, oyuncu ve şarkıcılarının hayat hikayeleri, sosyal medya hesapları ve ilginç bilgileri.",
  keywords: ["ünlü biyografileri", "fenomen", "YouTuber", "TikTok", "Instagram"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://celebritybio.com/tr",
    siteName: "Celebrity Bio"
  }
}
```

### Bölümler (Sections)

#### 1. Hero Section
```
┌────────────────────────────────────────────────────────┐
│  🎭 ÜNLÜLERİN HAYAT HİKAYELERİ                        │
│  En ünlü fenomenlerin biyografileri, sosyal medya     │
│  hesapları ve ilginç bilgileri                        │
│                                                        │
│  [Arama çubuğu - autocomplete]                        │
└────────────────────────────────────────────────────────┘
```

#### 2. Günün Ünlüsü (Celebrity of the Day)
```typescript
interface CelebrityOfTheDayProps {
  celebrity: {
    slug: string;
    fullName: string;
    profession: string;
    profileImage: string;
    bioShort: string;
    tags: Tag[];
  };
}
```

**Component:** `components/home/CelebrityOfTheDay.tsx`

```
┌────────────────────────────────────────────────────────┐
│  ⭐ GÜNÜN ÜNLÜSÜ                                       │
│  ┌──────────┐  Burak Özdemir                          │
│  │  [Foto]  │  CZN Burak - Chef & YouTuber             │
│  │          │                                          │
│  └──────────┘  Dubai'de restoran zinciri olan ve      │
│                 sosyal medyada milyonlarca takipçisi  │
│                 olan ünlü şef...                       │
│                                                        │
│                 [Profili İncele →]                     │
└────────────────────────────────────────────────────────┘
```

#### 3. Bugün Doğan Ünlüler
```typescript
interface BornTodayProps {
  celebrities: Array<{
    slug: string;
    fullName: string;
    birthDate: Date;
    age: number;
    profession: string;
    profileImage: string;
  }>;
  date: Date; // Bugünün tarihi
}
```

**Component:** `components/home/BornToday.tsx`

```
┌────────────────────────────────────────────────────────┐
│  🎂 BUGÜN DOĞAN ÜNLÜLER (17 Kasım)                     │
│                                                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │ [Foto] │  │ [Foto] │  │ [Foto] │  │ [Foto] │      │
│  │        │  │        │  │        │  │        │      │
│  │  İsim  │  │  İsim  │  │  İsim  │  │  İsim  │      │
│  │ (Yaş)  │  │ (Yaş)  │  │ (Yaş)  │  │ (Yaş)  │      │
│  └────────┘  └────────┘  └────────┘  └────────┘      │
│                                                        │
│  [Tüm Doğum Günlerini Gör →]                          │
└────────────────────────────────────────────────────────┘
```

**API Endpoint:** `GET /api/celebrities/born-today?date=2024-11-17`

#### 4. En Çok Arananlar (Bu Hafta)
```typescript
interface TopSearchedProps {
  celebrities: Array<{
    slug: string;
    fullName: string;
    profession: string;
    profileImage: string;
    searchCount: number;
    rank: number;
    trendDirection: 'up' | 'down' | 'stable';
  }>;
  period: 'week' | 'month';
}
```

**Component:** `components/home/TopSearched.tsx`

```
┌────────────────────────────────────────────────────────┐
│  🔥 EN ÇOK ARANANLAR (Bu Hafta)                        │
│                                                        │
│  1. ↗ Acun Ilıcalı           [Foto]   12.5K arama     │
│  2. ↗ Cem Yılmaz              [Foto]   10.2K arama     │
│  3. ↘ Hadise                  [Foto]    9.8K arama     │
│  4. → Burak Özdemir           [Foto]    8.3K arama     │
│  5. ↗ Enes Batur              [Foto]    7.1K arama     │
│                                                        │
│  [Tüm Sıralamayı Gör →]                               │
└────────────────────────────────────────────────────────┘
```

#### 5. Trend Biyografiler
```typescript
interface TrendingBiosProps {
  celebrities: Array<{
    slug: string;
    fullName: string;
    profession: string;
    profileImage: string;
    viewCount: number;
    tags: Tag[];
  }>;
}
```

**Component:** `components/home/TrendingBios.tsx`

```
┌────────────────────────────────────────────────────────┐
│  📈 TREND BİYOGRAFİLER (Son 7 Gün)                     │
│                                                        │
│  Grid Layout:                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │ [Foto] │  │ [Foto] │  │ [Foto] │  │ [Foto] │      │
│  │        │  │        │  │        │  │        │      │
│  │  İsim  │  │  İsim  │  │  İsim  │  │  İsim  │      │
│  │ Meslek │  │ Meslek │  │ Meslek │  │ Meslek │      │
│  │ 👁 15K │  │ 👁 12K │  │ 👁 10K │  │ 👁 9K  │      │
│  └────────┘  └────────┘  └────────┘  └────────┘      │
└────────────────────────────────────────────────────────┘
```

#### 6. Kategoriler (Featured Categories)
```
┌────────────────────────────────────────────────────────┐
│  📂 KATEGORİLER                                        │
│                                                        │
│  [📺 YouTuberlar]  [🎬 Oyuncular]  [🎵 Şarkıcılar]    │
│  [📱 TikTok]       [⚽ Sporcular]   [🎭 Sanatçılar]    │
└────────────────────────────────────────────────────────┘
```

---

## 3.3 Biyografi Detay Sayfası (`/u/[slug]`)

### URL Örnekleri
- `/tr/u/burak-ozdemir`
- `/en/u/burak-ozdemir`
- `/tr/u/enes-batur`

### Dinamik Metadata
```typescript
export async function generateMetadata({
  params
}: {
  params: { slug: string; locale: string }
}): Promise<Metadata> {
  const celebrity = await getCelebrityBySlug(params.slug, params.locale);

  return {
    title: `${celebrity.fullName} Kimdir? Biyografisi, Yaşı, Burcu | Celebrity Bio`,
    description: celebrity.bioShort,
    openGraph: {
      type: 'profile',
      firstName: celebrity.firstName,
      lastName: celebrity.lastName,
      images: [celebrity.profileImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: celebrity.fullName,
      description: celebrity.bioShort,
      images: [celebrity.profileImage],
    },
  };
}
```

### Sayfa Yapısı

#### 1. Hero Section (Profile Header)
```
┌────────────────────────────────────────────────────────┐
│  ┌─────────────┐                                       │
│  │             │   BURAK ÖZDEMİR                       │
│  │   [Profil]  │   CZN Burak                           │
│  │    Fotoğrafı│   Chef, Entrepreneur, YouTuber        │
│  │             │                                       │
│  │             │   ⭐ Doğrulanamdı Profil              │
│  └─────────────┘                                       │
│                                                        │
│  📅 15 Mart 1994 (30 yaş)  ♓ Balık                     │
│  📍 Hatay, Türkiye                                     │
│  💼 2016 - Günümüz                                     │
│                                                        │
│  [Instagram] [YouTube] [TikTok] [Twitter] [Website]   │
└────────────────────────────────────────────────────────┘
```

**Component:** `components/celebrity/ProfileHeader.tsx`

#### 2. Kısa Özet (Bio Short)
```
┌────────────────────────────────────────────────────────┐
│  Burak Özdemir, "CZN Burak" olarak bilinen Türk şef,  │
│  restoran sahibi ve sosyal medya fenomeni. Dubai'de   │
│  Hatay Medeniyetler Sofrası restoranının sahibi ve    │
│  gülümseyerek dev porsiyonlar hazırlayışıyla dünyaca  │
│  ünlü.                                                 │
└────────────────────────────────────────────────────────┘
```

#### 3. Detaylı Biyografi
```
┌────────────────────────────────────────────────────────┐
│  📖 BİYOGRAFİ                                          │
│                                                        │
│  [Detaylı biyografi metni - markdown destekli]        │
│                                                        │
│  ## Erken Hayatı                                       │
│  Burak Özdemir, 1994 yılında Hatay'da doğdu...        │
│                                                        │
│  ## Kariyeri                                           │
│  2016 yılında Dubai'de ilk restoranını açtı...        │
│                                                        │
│  ## Sosyal Medya Başarısı                              │
│  Instagram'da 50 milyondan fazla takipçisi var...     │
└────────────────────────────────────────────────────────┘
```

#### 4. İlginç Bilgiler (Fun Facts)
```
┌────────────────────────────────────────────────────────┐
│  💡 İLGİNÇ BİLGİLER                                    │
│                                                        │
│  ✨ Videolarında hiç konuşmaz, sadece gülümser         │
│  ✨ 50+ ülkede şubesi bulunan restoran zinciri sahibi  │
│  ✨ NASA'ya dev kebap gönderdi (viral olay)            │
│  ✨ Guinness Rekorlar Kitabı'nda yer aldı              │
│  ✨ 2019'da Türkiye'nin en ünlü şefi seçildi           │
└────────────────────────────────────────────────────────┘
```

**Component:** `components/celebrity/FunFacts.tsx`

#### 5. Sosyal Medya İstatistikleri
```
┌────────────────────────────────────────────────────────┐
│  📊 SOSYAL MEDYA                                       │
│                                                        │
│  Instagram    @cznburak         👥 54.2M  ✓ Doğrulandı│
│  TikTok       @cznburak         👥 32.1M  ✓ Doğrulandı│
│  YouTube      CZN Burak         👥 12.5M  ✓ Doğrulandı│
│  Twitter      @Cznburak         👥  2.1M  ✓ Doğrulandı│
│  Facebook     CZN Burak         👥  8.3M              │
│                                                        │
│  Toplam Takipçi: 109M+                                │
└────────────────────────────────────────────────────────┘
```

**Component:** `components/celebrity/SocialStats.tsx`

#### 6. Etiketler
```
┌────────────────────────────────────────────────────────┐
│  🏷️ ETİKETLER                                          │
│                                                        │
│  [Chef] [YouTuber] [Entrepreneur] [Turkish]           │
│  [Dubai] [Instagram Star] [TikTok Star]               │
└────────────────────────────────────────────────────────┘
```

**Component:** `components/celebrity/TagList.tsx`

#### 7. Benzer Kişiler
```
┌────────────────────────────────────────────────────────┐
│  👥 BENZER KİŞİLER                                     │
│                                                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │ [Foto] │  │ [Foto] │  │ [Foto] │  │ [Foto] │      │
│  │Nusret  │  │ Somer  │  │ Murat  │  │ Refika │      │
│  │Gökçe   │  │Sivrioğ.│  │Özdemir │  │Birgül  │      │
│  └────────┘  └────────┘  └────────┘  └────────┘      │
└────────────────────────────────────────────────────────┘
```

**Component:** `components/celebrity/SimilarPeople.tsx`

**Öneri Algoritması:**
```typescript
function getSimilarCelebrities(celebrity: Celebrity) {
  // 1. Aynı meslek
  // 2. Aynı ülke
  // 3. Benzer etiketler (en az 2 ortak tag)
  // 4. Popülerlik skoruna göre sırala
  // 5. Limit: 8 kişi
}
```

#### 8. Kişiye Özel Güncel Haberler
```
┌────────────────────────────────────────────────────────┐
│  📰 GÜNCEL HABERLER                                    │
│                                                        │
│  [Haber Görseli] CZN Burak New York'ta restoran açtı  │
│                  2 gün önce                            │
│                                                        │
│  [Haber Görseli] Messi ile Dubai'de buluştu           │
│                  5 gün önce                            │
│                                                        │
│  [Haber Görseli] 60 milyon takipçiye ulaştı            │
│                  1 hafta önce                          │
│                                                        │
│  [Tüm Haberleri Gör →]                                │
└────────────────────────────────────────────────────────┘
```

**Component:** `components/celebrity/RelatedNews.tsx`

---

## 3.4 Tag/Kategori Sayfası (`/tag/[slug]`)

### URL Örnekleri
- `/tr/etiket/youtuber`
- `/en/tag/youtuber`
- `/tr/etiket/turk-fenomenler`

### Metadata
```typescript
export async function generateMetadata({
  params
}: {
  params: { slug: string; locale: string }
}): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug, params.locale);

  return {
    title: `${tag.name} Biyografileri | Celebrity Bio`,
    description: `${tag.name} kategorisindeki ünlü ve fenomenlerin biyografileri, sosyal medya hesapları ve hayat hikayeleri.`,
  };
}
```

### Sayfa Yapısı
```
┌────────────────────────────────────────────────────────┐
│  📺 YOUTUBER BİYOGRAFİLERİ                             │
│  Türkiye ve dünyanın en ünlü YouTuberlarının           │
│  biyografileri ve sosyal medya hesapları               │
│                                                        │
│  📊 248 YouTuber bulundu                               │
│                                                        │
│  Sıralama: [En Popüler ▼]  Filtre: [Ülke ▼] [Tür ▼] │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  1. [Foto] Enes Batur                          │   │
│  │     Gaming & Vlog YouTuber                     │   │
│  │     👥 16M abonesi  👁 125K görüntüleme        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  2. [Foto] Reynmen                             │   │
│  │     Music & Entertainment YouTuber             │   │
│  │     👥 8.5M abonesi  👁 98K görüntüleme        │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  [Daha Fazla Yükle ↓]                                 │
└────────────────────────────────────────────────────────┘
```

**Pagination:** Infinite scroll veya sayfa bazlı (20 kişi/sayfa)

---

## 3.5 Arama Sayfası (`/search`)

### URL
- `/tr/ara?q=burak`
- `/en/search?q=burak`

### Özellikler
```typescript
interface SearchPageProps {
  searchParams: {
    q: string;              // Arama kelimesi
    profession?: string;    // Meslek filtresi
    country?: string;       // Ülke filtresi
    platform?: string;      // Platform filtresi (instagram, youtube, etc.)
    sort?: 'relevance' | 'popularity' | 'name';
  };
}
```

### Sayfa Yapısı
```
┌────────────────────────────────────────────────────────┐
│  🔍 "burak" için arama sonuçları                       │
│  12 sonuç bulundu (0.08 saniye)                        │
│                                                        │
│  Filtreler:                                            │
│  Meslek: [Tümü ▼]  Ülke: [Tümü ▼]  Platform: [Tümü ▼]│
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  [Foto] Burak Özdemir (CZN Burak)              │   │
│  │         Chef, YouTuber                         │   │
│  │         Dubai'de restoran zinciri sahibi...    │   │
│  │         [Instagram] [YouTube] [TikTok]         │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  [Foto] Burak Deniz                            │   │
│  │         Oyuncu                                 │   │
│  │         Türk dizi ve film oyuncusu...          │   │
│  │         [Instagram] [Twitter]                  │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Autocomplete Component
```
┌────────────────────────────────────────────────────────┐
│  [🔍 burak ________________________]                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 🔍 burak özdemir                                 │ │
│  │ 🔍 burak deniz                                   │ │
│  │ 🔍 burakabi (Burak Akbay)                        │ │
│  │ 📺 burak - YouTuber kategorisi                   │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

**Component:** `components/search/SearchAutocomplete.tsx`

---

## 3.6 Haberler Sayfası (`/news`)

### Ana Haberler Listesi
```
┌────────────────────────────────────────────────────────┐
│  📰 GÜNCEL HABERLER                                    │
│                                                        │
│  Filtre: [Tüm Kategoriler ▼]  [Tüm Ünlüler ▼]        │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  [Görsel]  CZN Burak New York'ta restoran açtı │   │
│  │            CZN Burak, New York Manhattan'da... │   │
│  │            🏷️ Burak Özdemir  📅 2 gün önce    │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  [Görsel]  Enes Batur yeni filmi açıklandı     │   │
│  │            Ünlü YouTuber Enes Batur'un...     │   │
│  │            🏷️ Enes Batur  📅 5 gün önce       │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Haber Detay Sayfası (`/news/[slug]`)
```
┌────────────────────────────────────────────────────────┐
│  [Kapak Görseli - Full width]                         │
│                                                        │
│  CZN Burak New York'ta Yeni Restoran Açtı             │
│  📅 17 Kasım 2024  ✍️ Editör: Admin  👁️ 12.5K       │
│                                                        │
│  İlgili: [Burak Özdemir]                               │
│                                                        │
│  [Haber içeriği - markdown destekli]                  │
│                                                        │
│  Kaynak: [CNN Türk →]                                  │
│                                                        │
│  Etiketler: [Burak Özdemir] [Restoran] [New York]     │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ 📰 İLGİLİ HABERLER                            │     │
│  │ - CZN Burak Dubai'de 5. restoranını açtı     │     │
│  │ - Messi ile Dubai'de buluştu                  │     │
│  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

---

## 3.7 Popülerlik Sıralaması (`/popular`)

### URL
- `/tr/populer?period=week`
- `/en/popular?period=month`

### Sayfa Yapısı
```
┌────────────────────────────────────────────────────────┐
│  🏆 POPÜLERLİK SIRALAMASI                              │
│                                                        │
│  [Bu Hafta] [Bu Ay] [Tüm Zamanlar]                    │
│                                                        │
│  📊 En çok aranan ve ziyaret edilen ünlüler            │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  🥇 1.  [Foto] Acun Ilıcalı                    │   │
│  │         TV Producer, Entrepreneur              │   │
│  │         🔍 12.5K arama  👁 45.2K görüntüleme   │   │
│  │         Trend: ↗ +15%                          │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  🥈 2.  [Foto] Cem Yılmaz                      │   │
│  │         Comedian, Actor, Director              │   │
│  │         🔍 10.2K arama  👁 38.1K görüntüleme   │   │
│  │         Trend: ↗ +8%                           │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │  🥉 3.  [Foto] Hadise                          │   │
│  │         Singer, TV Personality                 │   │
│  │         🔍 9.8K arama  👁 35.5K görüntüleme    │   │
│  │         Trend: ↘ -3%                           │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

**Trend hesaplama:**
```typescript
trend = ((currentPeriodScore - previousPeriodScore) / previousPeriodScore) * 100
```

---

## 3.8 Doğum Günü Takvimi (`/birthdays`)

### Bugün Doğanlar View
```
┌────────────────────────────────────────────────────────┐
│  🎂 DOĞUM GÜNÜ TAKVİMİ                                 │
│                                                        │
│  [Bugün] [Yarın] [Bu Hafta] [Takvim Seç 📅]          │
│                                                        │
│  📅 17 Kasım - Bugün Doğan Ünlüler                     │
│                                                        │
│  ┌────────┐  ┌────────┐  ┌────────┐                   │
│  │ [Foto] │  │ [Foto] │  │ [Foto] │                   │
│  │        │  │        │  │        │                   │
│  │ İsim 1 │  │ İsim 2 │  │ İsim 3 │                   │
│  │ (30)   │  │ (45)   │  │ (28)   │                   │
│  │ ♓ Balık│  │ ♏ Akrep│  │ ♎ Terazi                  │
│  └────────┘  └────────┘  └────────┘                   │
└────────────────────────────────────────────────────────┘
```

### Ay Bazlı View
```
┌────────────────────────────────────────────────────────┐
│  📅 KASIM AYINDA DOĞAN ÜNLÜLER                         │
│                                                        │
│  [Ay Seçici: Ocak, Şubat, ..., Kasım, Aralık]         │
│                                                        │
│  1 Kasım   - [İsim] [İsim]                             │
│  2 Kasım   - [İsim]                                    │
│  ...                                                   │
│  17 Kasım  - [İsim] [İsim] [İsim] ← Bugün             │
│  ...                                                   │
│  30 Kasım  - [İsim] [İsim]                             │
└────────────────────────────────────────────────────────┘
```

**API Endpoint:** `GET /api/celebrities/birthdays?month=11`

---

## 3.9 Component Kütüphanesi

### Core Components

```typescript
// components/celebrity/CelebrityCard.tsx
interface CelebrityCardProps {
  celebrity: {
    slug: string;
    fullName: string;
    profession: string;
    profileImage: string;
    tags?: Tag[];
  };
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
}

// components/search/SearchBar.tsx
interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showAutocomplete?: boolean;
  locale: string;
}

// components/seo/JsonLd.tsx
interface JsonLdProps {
  type: 'Person' | 'NewsArticle' | 'BreadcrumbList';
  data: any;
}

// components/layout/Header.tsx
interface HeaderProps {
  locale: string;
  showSearch?: boolean;
}

// components/layout/Footer.tsx
interface FooterProps {
  locale: string;
}
```

---

## 3.10 Loading States & Error Handling

### Loading Skeleton
```tsx
// app/[locale]/u/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200 rounded" />
      <div className="h-8 bg-gray-200 rounded mt-4 w-1/2" />
      <div className="h-4 bg-gray-200 rounded mt-2 w-3/4" />
    </div>
  );
}
```

### Error Page
```tsx
// app/[locale]/u/[slug]/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold">Bir hata oluştu!</h2>
      <p className="mt-2">{error.message}</p>
      <button onClick={reset} className="mt-4 btn">
        Tekrar Dene
      </button>
    </div>
  );
}
```

### 404 Not Found
```tsx
// app/[locale]/u/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4">Bu ünlü bulunamadı.</p>
      <Link href="/" className="mt-4 btn">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
```

---

Bu detaylı sayfa yapısı, kullanıcı deneyimini ve SEO performansını optimize edecek şekilde tasarlanmıştır. Sıradaki dokümanda örnek kodları ve implementasyonu göreceğiz.
