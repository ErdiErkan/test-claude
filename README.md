# Celebrity Bio Platform 🌟

Ünlü ve fenomenlerin biyografilerini içeren, çok dilli, SEO dostu, yönetilebilir ve mobil uyumlu full-stack web platformu.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Teknoloji Stack'i](#teknoloji-stacki)
- [Kurulum](#kurulum)
- [Dokümantasyon](#dokümantasyon)
- [Proje Yapısı](#proje-yapısı)

---

## 🎯 Genel Bakış

Celebrity Bio Platform, fenomenler ve ünlülerin biyografilerini barındıran kapsamlı bir web platformudur. Platform, kullanıcıların ünlüleri keşfetmesini, detaylı bilgilere erişmesini ve güncel haberleri takip etmesini sağlar.

### Ana Özellikler

- 📱 **Tam Responsive**: Mobil, tablet ve desktop uyumlu
- 🌍 **Çoklu Dil**: Türkçe ve İngilizce (genişletilebilir)
- 🔍 **Güçlü Arama**: Fuzzy search, autocomplete, filtreleme
- 📊 **Popülerlik Takibi**: Gerçek zamanlı trend analizi
- 📰 **Haber Yönetimi**: Ünlülerle ilgili güncel haberler
- 🎂 **Doğum Günü Takvimi**: Günlük doğum günü bildirimleri
- 🏷️ **Etiket Sistemi**: Kategoriler ve dinamik etiketler
- 📈 **SEO Odaklı**: Schema.org, meta tags, sitemap
- 🔐 **Güvenli Admin Panel**: Rol bazlı erişim kontrolü
- ⚡ **Performans**: SSR/SSG, Redis cache, CDN optimizasyonu

---

## 🛠️ Teknoloji Stack'i

### Frontend
- **Next.js 14+** (App Router, Server Components)
- **TypeScript**
- **React 18+**
- **Tailwind CSS**
- **shadcn/ui**

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **PostgreSQL 14+**
- **Redis** (caching & session)

### Arama
- **Meilisearch** (veya Elasticsearch)

### Depolama
- **AWS S3 / Cloudflare R2**

### Deployment
- **Vercel** (önerilen) veya Docker

---

## 📚 Dokümantasyon

Detaylı dokümantasyon `docs/` klasöründe bulunmaktadır:

1. [**Genel Mimari**](docs/01-GENEL-MIMARI.md) - Teknoloji seçimleri, mimari diyagramlar
2. [**Veri Modeli**](docs/02-VERI-MODELI.md) - Veritabanı şeması, ilişkiler
3. [**Sayfa ve Modül Yapısı**](docs/03-SAYFA-VE-MODUL-YAPISI.md) - Tüm sayfalar ve bileşenler
4. [**Arama ve Popülerlik**](docs/04-ARAMA-VE-POPULERLIK-ALGORITMALARI.md) - Arama sistemi, sıralama
5. [**SEO Stratejisi**](docs/05-SEO-STRATEJISI.md) - Meta tags, schema.org, sitemap
6. [**i18n (Çoklu Dil)**](docs/06-I18N-COKLU-DIL.md) - Dil yönetimi, çeviri sistemi
7. [**Admin Panel**](docs/07-ADMIN-PANEL.md) - CMS özellikleri, kullanıcı yönetimi
8. [**Performans & Güvenlik**](docs/08-PERFORMANS-GUVENLIK-OLCEKLENEBILIRLIK.md) - Optimizasyon, güvenlik

---

## 📁 Proje Yapısı

```
celebrity-bio-platform/
├── docs/                      # Dokümantasyon
├── prisma/                    # Database schema & migrations
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # i18n routing
│   │   ├── api/               # API Routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities, services
│   ├── types/                 # TypeScript types
│   └── config/                # Configuration files
└── package.json
```

---

## 🎯 Ana Sayfalar

### Ana Sayfa (`/`)
- Günün Ünlüsü
- Bugün Doğan Ünlüler
- En Çok Arananlar
- Trend Biyografiler
- Kategoriler

### Biyografi Detay (`/u/[slug]`)
- Profil başlığı (fotoğraf, temel bilgiler)
- Detaylı biyografi
- İlginç bilgiler (Fun Facts)
- Sosyal medya linkleri
- Benzer kişiler
- İlgili haberler

### Diğer Sayfalar
- **Arama** (`/search`) - Güçlü arama ve filtreleme
- **Haberler** (`/news`) - Güncel haberler
- **Popülerlik** (`/popular`) - Sıralama ve trendler
- **Doğum Günü** (`/birthdays`) - Doğum günü takvimi
- **Admin Panel** (`/admin`) - İçerik yönetimi

---

## 📝 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

⭐ **Bu projeyi beğendiyseniz lütfen yıldız verin!**