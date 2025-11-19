# 2. VERİ MODELİ VE VERİTABANI ŞEMASI

## 2.1 Veritabanı Tasarım Prensipleri

```
✅ Normalizasyon (3NF)
✅ Çoklu dil için ayrı translation tabloları
✅ Soft delete desteği (deleted_at)
✅ Audit fields (created_at, updated_at)
✅ Index optimization (sık aranan alanlar)
✅ Foreign key constraints
✅ JSONB kullanımı (esnek metadata)
```

---

## 2.2 Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│   celebrities   │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼──────────────┐
│ celebrity_translations│
└───────────────────────┘

         │ 1:N
         │
┌────────▼────────┐
│  social_links   │
└─────────────────┘

         │ N:M
         │
┌────────▼────────┐      ┌──────────┐
│ celebrity_tags  │──────│   tags   │
└─────────────────┘      └──────────┘

         │ 1:N
         │
┌────────▼────────┐
│   news_items    │
└────────┬────────┘
         │ 1:N
         │
┌────────▼──────────────┐
│  news_translations    │
└───────────────────────┘

         │ 1:N
         │
┌────────▼────────┐
│popularity_stats │
└─────────────────┘

         │ 1:N
         │
┌────────▼────────┐
│   view_logs     │
└─────────────────┘

         │ 1:N
         │
┌────────▼────────┐
│  search_logs    │
└─────────────────┘
```

---

## 2.3 Tablo Detayları

### `celebrities` Tablosu (Ana tablo)

```sql
CREATE TABLE celebrities (
    id                  SERIAL PRIMARY KEY,
    slug                VARCHAR(255) UNIQUE NOT NULL,

    -- Temel Bilgiler
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    full_name           VARCHAR(255) NOT NULL,
    nickname            VARCHAR(100),

    -- Doğum Bilgileri
    birth_date          DATE,
    birth_place         VARCHAR(255),
    country             VARCHAR(100),

    -- Kariyer
    profession          VARCHAR(255),
    active_years_start  INTEGER,
    active_years_end    INTEGER,  -- NULL = hala aktif

    -- Media
    profile_image_url   TEXT,
    cover_image_url     TEXT,

    -- Meta
    is_featured         BOOLEAN DEFAULT FALSE,  -- "Günün ünlüsü"
    is_verified         BOOLEAN DEFAULT FALSE,
    visibility          VARCHAR(20) DEFAULT 'published',  -- draft, published, archived

    -- SEO
    seo_title           VARCHAR(255),
    seo_description     TEXT,
    canonical_url       TEXT,

    -- Stats (denormalized for performance)
    total_views         BIGINT DEFAULT 0,
    total_searches      BIGINT DEFAULT 0,
    popularity_score    DECIMAL(10, 2) DEFAULT 0,

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP,  -- Soft delete

    -- Indexes
    INDEX idx_slug (slug),
    INDEX idx_birth_date (birth_date),
    INDEX idx_country (country),
    INDEX idx_profession (profession),
    INDEX idx_popularity_score (popularity_score DESC),
    INDEX idx_is_featured (is_featured),
    INDEX idx_visibility (visibility),
    FULLTEXT INDEX idx_fulltext_search (full_name, nickname, profession)
);
```

---

### `celebrity_translations` Tablosu (Çoklu dil)

```sql
CREATE TABLE celebrity_translations (
    id                  SERIAL PRIMARY KEY,
    celebrity_id        INTEGER NOT NULL,
    language_code       VARCHAR(5) NOT NULL,  -- 'tr', 'en', 'de', etc.

    -- İçerik
    bio_short           TEXT,                  -- Kısa özet (150-200 karakter)
    bio_long            TEXT,                  -- Detaylı biyografi
    career_summary      TEXT,                  -- Kariyer özeti
    fun_facts           JSONB,                 -- ["Fact 1", "Fact 2", ...]

    -- Meta
    meta_title          VARCHAR(255),
    meta_description    TEXT,

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (celebrity_id) REFERENCES celebrities(id) ON DELETE CASCADE,
    UNIQUE (celebrity_id, language_code),
    INDEX idx_language (language_code)
);
```

**Fun Facts JSON Örneği:**
```json
[
  "İlk YouTube videosunu 2014'te yayınladı",
  "5 dil konuşuyor: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca",
  "Vegan yaşam tarzını benimsiyor",
  "Himalayalar'a tırmanış yaptı"
]
```

---

### `social_links` Tablosu

```sql
CREATE TABLE social_links (
    id                  SERIAL PRIMARY KEY,
    celebrity_id        INTEGER NOT NULL,

    platform            VARCHAR(50) NOT NULL,  -- 'instagram', 'tiktok', 'youtube', etc.
    handle              VARCHAR(255),          -- Kullanıcı adı
    url                 TEXT NOT NULL,
    followers_count     BIGINT,                -- Takipçi sayısı (optional, güncellenebilir)
    is_verified         BOOLEAN DEFAULT FALSE,

    -- Display order
    sort_order          INTEGER DEFAULT 0,

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (celebrity_id) REFERENCES celebrities(id) ON DELETE CASCADE,
    INDEX idx_celebrity_platform (celebrity_id, platform)
);
```

**Platform değerleri:**
```typescript
type SocialPlatform =
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'facebook'
  | 'twitch'
  | 'linkedin'
  | 'spotify'
  | 'website'
  | 'other';
```

---

### `tags` Tablosu

```sql
CREATE TABLE tags (
    id                  SERIAL PRIMARY KEY,
    slug                VARCHAR(255) UNIQUE NOT NULL,

    -- Multilingual name
    name_tr             VARCHAR(100),
    name_en             VARCHAR(100),

    -- Kategorileştirme
    category            VARCHAR(50),  -- 'profession', 'platform', 'genre', 'country', etc.

    -- Meta
    description         TEXT,
    icon                VARCHAR(100),  -- Icon name veya emoji
    color               VARCHAR(7),    -- Hex color code

    -- Stats
    celebrity_count     INTEGER DEFAULT 0,  -- Denormalized

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_category (category),
    INDEX idx_slug (slug)
);
```

**Örnek tag'ler:**
```sql
INSERT INTO tags (slug, name_tr, name_en, category) VALUES
('youtuber', 'YouTuber', 'YouTuber', 'profession'),
('tiktok-star', 'TikTok Fenomeni', 'TikTok Star', 'profession'),
('actor', 'Oyuncu', 'Actor', 'profession'),
('musician', 'Müzisyen', 'Musician', 'profession'),
('turkish', 'Türk', 'Turkish', 'country'),
('american', 'Amerikalı', 'American', 'country'),
('gaming', 'Oyun', 'Gaming', 'genre'),
('lifestyle', 'Yaşam Tarzı', 'Lifestyle', 'genre');
```

---

### `celebrity_tags` Tablosu (Many-to-Many)

```sql
CREATE TABLE celebrity_tags (
    celebrity_id        INTEGER NOT NULL,
    tag_id              INTEGER NOT NULL,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (celebrity_id, tag_id),
    FOREIGN KEY (celebrity_id) REFERENCES celebrities(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,

    INDEX idx_tag_celebrity (tag_id, celebrity_id)
);
```

---

### `news_items` Tablosu

```sql
CREATE TABLE news_items (
    id                  SERIAL PRIMARY KEY,
    slug                VARCHAR(255) UNIQUE NOT NULL,

    -- İlişki (opsiyonel: bir haber birden fazla ünlüyle ilgili olabilir)
    primary_celebrity_id INTEGER,

    -- Media
    featured_image_url  TEXT,

    -- Kaynak
    source_name         VARCHAR(255),
    source_url          TEXT,

    -- Kategorileştirme
    category            VARCHAR(50),  -- 'relationship', 'project', 'scandal', 'achievement'

    -- Meta
    is_featured         BOOLEAN DEFAULT FALSE,
    visibility          VARCHAR(20) DEFAULT 'published',

    -- Stats
    view_count          BIGINT DEFAULT 0,

    -- Timestamps
    published_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP,

    FOREIGN KEY (primary_celebrity_id) REFERENCES celebrities(id) ON DELETE SET NULL,
    INDEX idx_published_at (published_at DESC),
    INDEX idx_category (category),
    INDEX idx_visibility (visibility)
);
```

---

### `news_celebrities` Tablosu (Haber-Ünlü Many-to-Many)

```sql
CREATE TABLE news_celebrities (
    news_id             INTEGER NOT NULL,
    celebrity_id        INTEGER NOT NULL,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (news_id, celebrity_id),
    FOREIGN KEY (news_id) REFERENCES news_items(id) ON DELETE CASCADE,
    FOREIGN KEY (celebrity_id) REFERENCES celebrities(id) ON DELETE CASCADE
);
```

---

### `news_translations` Tablosu

```sql
CREATE TABLE news_translations (
    id                  SERIAL PRIMARY KEY,
    news_id             INTEGER NOT NULL,
    language_code       VARCHAR(5) NOT NULL,

    -- İçerik
    title               VARCHAR(255) NOT NULL,
    summary             TEXT,
    content             TEXT,

    -- SEO
    meta_title          VARCHAR(255),
    meta_description    TEXT,

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (news_id) REFERENCES news_items(id) ON DELETE CASCADE,
    UNIQUE (news_id, language_code)
);
```

---

### `popularity_stats` Tablosu (Günlük/Haftalık Agregasyon)

```sql
CREATE TABLE popularity_stats (
    id                  SERIAL PRIMARY KEY,
    celebrity_id        INTEGER NOT NULL,

    -- Zaman aralığı
    period_type         VARCHAR(20) NOT NULL,  -- 'daily', 'weekly', 'monthly'
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,

    -- Metrikler
    view_count          BIGINT DEFAULT 0,
    search_count        BIGINT DEFAULT 0,
    social_mention_count BIGINT DEFAULT 0,

    -- Hesaplanan skor
    popularity_score    DECIMAL(10, 2) DEFAULT 0,
    rank_position       INTEGER,

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (celebrity_id) REFERENCES celebrities(id) ON DELETE CASCADE,
    UNIQUE (celebrity_id, period_type, period_start),
    INDEX idx_period (period_type, period_start, period_end),
    INDEX idx_popularity (period_type, popularity_score DESC)
);
```

---

### `search_logs` Tablosu (Arama logları)

```sql
CREATE TABLE search_logs (
    id                  BIGSERIAL PRIMARY KEY,

    -- Arama bilgisi
    query               TEXT NOT NULL,
    normalized_query    TEXT,  -- Lowercase, trimmed version

    -- Sonuç
    results_count       INTEGER,
    matched_celebrity_id INTEGER,  -- İlk tıklanan sonuç
    clicked_position    INTEGER,   -- Kaçıncı sıradaki sonuca tıklandı

    -- Kullanıcı bilgisi (anonim)
    user_ip_hash        VARCHAR(64),  -- Hashed IP (GDPR)
    user_agent          TEXT,
    country_code        VARCHAR(2),

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (matched_celebrity_id) REFERENCES celebrities(id) ON DELETE SET NULL,
    INDEX idx_query (query),
    INDEX idx_normalized_query (normalized_query),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_matched_celebrity (matched_celebrity_id)
);
```

---

### `view_logs` Tablosu (Sayfa görüntüleme)

```sql
CREATE TABLE view_logs (
    id                  BIGSERIAL PRIMARY KEY,
    celebrity_id        INTEGER NOT NULL,

    -- Sayfa bilgisi
    page_type           VARCHAR(50) DEFAULT 'profile',  -- 'profile', 'news', 'search'
    referrer            TEXT,

    -- Kullanıcı bilgisi
    user_ip_hash        VARCHAR(64),
    user_agent          TEXT,
    country_code        VARCHAR(2),

    -- Session tracking (opsiyonel)
    session_id          VARCHAR(255),

    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (celebrity_id) REFERENCES celebrities(id) ON DELETE CASCADE,
    INDEX idx_celebrity_date (celebrity_id, created_at DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_session (session_id)
);
```

**Not:** View logs büyük boyutlara ulaşabileceği için:
- Partitioning kullanılabilir (aylık partition'lar)
- 90 gün sonra arşivleme veya silme stratejisi
- Time-series database alternatifi (InfluxDB, TimescaleDB)

---

### `users` Tablosu (Admin Panel için)

```sql
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,

    -- Profil
    full_name           VARCHAR(255),
    avatar_url          TEXT,

    -- Roller
    role                VARCHAR(50) DEFAULT 'editor',  -- 'admin', 'editor', 'viewer'

    -- Durum
    is_active           BOOLEAN DEFAULT TRUE,
    email_verified_at   TIMESTAMP,

    -- Timestamps
    last_login_at       TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_email (email)
);
```

---

## 2.4 Prisma Schema Örneği

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Celebrity {
  id                 Int       @id @default(autoincrement())
  slug               String    @unique

  // Basic info
  firstName          String    @map("first_name") @db.VarChar(100)
  lastName           String    @map("last_name") @db.VarChar(100)
  fullName           String    @map("full_name") @db.VarChar(255)
  nickname           String?   @db.VarChar(100)

  // Birth info
  birthDate          DateTime? @map("birth_date") @db.Date
  birthPlace         String?   @map("birth_place") @db.VarChar(255)
  country            String?   @db.VarChar(100)

  // Career
  profession         String?   @db.VarChar(255)
  activeYearsStart   Int?      @map("active_years_start")
  activeYearsEnd     Int?      @map("active_years_end")

  // Media
  profileImageUrl    String?   @map("profile_image_url")
  coverImageUrl      String?   @map("cover_image_url")

  // Meta
  isFeatured         Boolean   @default(false) @map("is_featured")
  isVerified         Boolean   @default(false) @map("is_verified")
  visibility         String    @default("published") @db.VarChar(20)

  // SEO
  seoTitle           String?   @map("seo_title") @db.VarChar(255)
  seoDescription     String?   @map("seo_description")
  canonicalUrl       String?   @map("canonical_url")

  // Stats (denormalized)
  totalViews         BigInt    @default(0) @map("total_views")
  totalSearches      BigInt    @default(0) @map("total_searches")
  popularityScore    Decimal   @default(0) @map("popularity_score") @db.Decimal(10, 2)

  // Timestamps
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")
  deletedAt          DateTime? @map("deleted_at")

  // Relations
  translations       CelebrityTranslation[]
  socialLinks        SocialLink[]
  tags               CelebrityTag[]
  newsItems          NewsCelebrity[]
  popularityStats    PopularityStat[]
  viewLogs           ViewLog[]
  searchLogs         SearchLog[]

  @@index([slug])
  @@index([birthDate])
  @@index([country])
  @@index([profession])
  @@index([popularityScore])
  @@index([isFeatured])
  @@map("celebrities")
}

model CelebrityTranslation {
  id              Int      @id @default(autoincrement())
  celebrityId     Int      @map("celebrity_id")
  languageCode    String   @map("language_code") @db.VarChar(5)

  bioShort        String?  @map("bio_short")
  bioLong         String?  @map("bio_long")
  careerSummary   String?  @map("career_summary")
  funFacts        Json?    @map("fun_facts")

  metaTitle       String?  @map("meta_title") @db.VarChar(255)
  metaDescription String?  @map("meta_description")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  celebrity       Celebrity @relation(fields: [celebrityId], references: [id], onDelete: Cascade)

  @@unique([celebrityId, languageCode])
  @@index([languageCode])
  @@map("celebrity_translations")
}

model SocialLink {
  id              Int      @id @default(autoincrement())
  celebrityId     Int      @map("celebrity_id")

  platform        String   @db.VarChar(50)
  handle          String?  @db.VarChar(255)
  url             String
  followersCount  BigInt?  @map("followers_count")
  isVerified      Boolean  @default(false) @map("is_verified")
  sortOrder       Int      @default(0) @map("sort_order")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  celebrity       Celebrity @relation(fields: [celebrityId], references: [id], onDelete: Cascade)

  @@index([celebrityId, platform])
  @@map("social_links")
}

model Tag {
  id              Int      @id @default(autoincrement())
  slug            String   @unique @db.VarChar(255)

  nameTr          String?  @map("name_tr") @db.VarChar(100)
  nameEn          String?  @map("name_en") @db.VarChar(100)

  category        String?  @db.VarChar(50)
  description     String?
  icon            String?  @db.VarChar(100)
  color           String?  @db.VarChar(7)

  celebrityCount  Int      @default(0) @map("celebrity_count")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  celebrities     CelebrityTag[]

  @@index([category])
  @@map("tags")
}

model CelebrityTag {
  celebrityId     Int      @map("celebrity_id")
  tagId           Int      @map("tag_id")

  createdAt       DateTime @default(now()) @map("created_at")

  celebrity       Celebrity @relation(fields: [celebrityId], references: [id], onDelete: Cascade)
  tag             Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([celebrityId, tagId])
  @@index([tagId, celebrityId])
  @@map("celebrity_tags")
}

model NewsItem {
  id                  Int       @id @default(autoincrement())
  slug                String    @unique @db.VarChar(255)

  primaryCelebrityId  Int?      @map("primary_celebrity_id")

  featuredImageUrl    String?   @map("featured_image_url")
  sourceName          String?   @map("source_name") @db.VarChar(255)
  sourceUrl           String?   @map("source_url")

  category            String?   @db.VarChar(50)
  isFeatured          Boolean   @default(false) @map("is_featured")
  visibility          String    @default("published") @db.VarChar(20)

  viewCount           BigInt    @default(0) @map("view_count")

  publishedAt         DateTime? @map("published_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  updatedAt           DateTime  @updatedAt @map("updated_at")
  deletedAt           DateTime? @map("deleted_at")

  translations        NewsTranslation[]
  celebrities         NewsCelebrity[]

  @@index([publishedAt])
  @@index([category])
  @@map("news_items")
}

model NewsCelebrity {
  newsId          Int      @map("news_id")
  celebrityId     Int      @map("celebrity_id")

  createdAt       DateTime @default(now()) @map("created_at")

  news            NewsItem  @relation(fields: [newsId], references: [id], onDelete: Cascade)
  celebrity       Celebrity @relation(fields: [celebrityId], references: [id], onDelete: Cascade)

  @@id([newsId, celebrityId])
  @@map("news_celebrities")
}

model NewsTranslation {
  id              Int      @id @default(autoincrement())
  newsId          Int      @map("news_id")
  languageCode    String   @map("language_code") @db.VarChar(5)

  title           String   @db.VarChar(255)
  summary         String?
  content         String?

  metaTitle       String?  @map("meta_title") @db.VarChar(255)
  metaDescription String?  @map("meta_description")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  news            NewsItem @relation(fields: [newsId], references: [id], onDelete: Cascade)

  @@unique([newsId, languageCode])
  @@map("news_translations")
}

model PopularityStat {
  id              Int      @id @default(autoincrement())
  celebrityId     Int      @map("celebrity_id")

  periodType      String   @map("period_type") @db.VarChar(20)
  periodStart     DateTime @map("period_start") @db.Date
  periodEnd       DateTime @map("period_end") @db.Date

  viewCount       BigInt   @default(0) @map("view_count")
  searchCount     BigInt   @default(0) @map("search_count")
  socialMentionCount BigInt @default(0) @map("social_mention_count")

  popularityScore Decimal  @default(0) @map("popularity_score") @db.Decimal(10, 2)
  rankPosition    Int?     @map("rank_position")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  celebrity       Celebrity @relation(fields: [celebrityId], references: [id], onDelete: Cascade)

  @@unique([celebrityId, periodType, periodStart])
  @@index([periodType, periodStart, periodEnd])
  @@index([periodType, popularityScore])
  @@map("popularity_stats")
}

model SearchLog {
  id                  BigInt    @id @default(autoincrement())

  query               String
  normalizedQuery     String?   @map("normalized_query")

  resultsCount        Int?      @map("results_count")
  matchedCelebrityId  Int?      @map("matched_celebrity_id")
  clickedPosition     Int?      @map("clicked_position")

  userIpHash          String?   @map("user_ip_hash") @db.VarChar(64)
  userAgent           String?   @map("user_agent")
  countryCode         String?   @map("country_code") @db.VarChar(2)

  createdAt           DateTime  @default(now()) @map("created_at")

  celebrity           Celebrity? @relation(fields: [matchedCelebrityId], references: [id], onDelete: SetNull)

  @@index([query])
  @@index([normalizedQuery])
  @@index([createdAt])
  @@index([matchedCelebrityId])
  @@map("search_logs")
}

model ViewLog {
  id              BigInt    @id @default(autoincrement())
  celebrityId     Int       @map("celebrity_id")

  pageType        String    @default("profile") @db.VarChar(50)
  referrer        String?

  userIpHash      String?   @map("user_ip_hash") @db.VarChar(64)
  userAgent       String?   @map("user_agent")
  countryCode     String?   @map("country_code") @db.VarChar(2)
  sessionId       String?   @map("session_id") @db.VarChar(255)

  createdAt       DateTime  @default(now()) @map("created_at")

  celebrity       Celebrity @relation(fields: [celebrityId], references: [id], onDelete: Cascade)

  @@index([celebrityId, createdAt])
  @@index([createdAt])
  @@index([sessionId])
  @@map("view_logs")
}

model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique @db.VarChar(255)
  passwordHash    String    @map("password_hash")

  fullName        String?   @map("full_name") @db.VarChar(255)
  avatarUrl       String?   @map("avatar_url")

  role            String    @default("editor") @db.VarChar(50)
  isActive        Boolean   @default(true) @map("is_active")
  emailVerifiedAt DateTime? @map("email_verified_at")

  lastLoginAt     DateTime? @map("last_login_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  @@index([email])
  @@map("users")
}
```

---

## 2.5 Veri İlişkileri ve Kurallar

### Cascade Delete Kuralları
```
celebrities silindikçe:
  ✅ celebrity_translations (CASCADE)
  ✅ social_links (CASCADE)
  ✅ celebrity_tags (CASCADE)
  ✅ view_logs (CASCADE)
  ✅ popularity_stats (CASCADE)
  ❌ search_logs (SET NULL) - geçmiş veri korunur
  ❌ news_celebrities (RESTRICT) - önce haberleri kontrol et
```

### Veri Bütünlüğü
```sql
-- Trigger: Popülerlik skorunu güncelle
CREATE OR REPLACE FUNCTION update_celebrity_popularity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE celebrities
    SET popularity_score = (
        SELECT COALESCE(SUM(popularity_score), 0)
        FROM popularity_stats
        WHERE celebrity_id = NEW.celebrity_id
          AND period_type = 'weekly'
          AND period_start >= CURRENT_DATE - INTERVAL '4 weeks'
    )
    WHERE id = NEW.celebrity_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_popularity
AFTER INSERT OR UPDATE ON popularity_stats
FOR EACH ROW
EXECUTE FUNCTION update_celebrity_popularity();
```

```sql
-- Trigger: Tag celebrity count güncelle
CREATE OR REPLACE FUNCTION update_tag_celebrity_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET celebrity_count = celebrity_count + 1
        WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET celebrity_count = celebrity_count - 1
        WHERE id = OLD.tag_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_count
AFTER INSERT OR DELETE ON celebrity_tags
FOR EACH ROW
EXECUTE FUNCTION update_tag_celebrity_count();
```

---

## 2.6 Optimizasyon Stratejileri

### Denormalizasyon (Performance için)
```
celebrities.total_views        ← view_logs aggregate
celebrities.total_searches     ← search_logs aggregate
celebrities.popularity_score   ← popularity_stats aggregate
tags.celebrity_count           ← celebrity_tags count
```

### Partitioning (Büyük tablolar)
```sql
-- view_logs tablosu için aylık partition
CREATE TABLE view_logs_2024_01 PARTITION OF view_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE view_logs_2024_02 PARTITION OF view_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Otomatik partition yönetimi için pg_partman extension
```

### Materialized Views
```sql
-- Popüler ünlüler view'i (günlük refresh)
CREATE MATERIALIZED VIEW mv_popular_celebrities AS
SELECT
    c.id,
    c.slug,
    c.full_name,
    c.profile_image_url,
    c.popularity_score,
    COUNT(DISTINCT vl.id) as recent_views,
    ROW_NUMBER() OVER (ORDER BY c.popularity_score DESC) as rank
FROM celebrities c
LEFT JOIN view_logs vl ON c.id = vl.celebrity_id
    AND vl.created_at >= CURRENT_DATE - INTERVAL '7 days'
WHERE c.visibility = 'published'
  AND c.deleted_at IS NULL
GROUP BY c.id
ORDER BY c.popularity_score DESC
LIMIT 100;

CREATE UNIQUE INDEX ON mv_popular_celebrities (id);

-- Günlük refresh (cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_celebrities;
```

---

Bu detaylı veri modeli, ölçeklenebilir ve performanslı bir celebrity biyografi platformu için sağlam bir temel oluşturur.
