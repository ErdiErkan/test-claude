# 🚀 Celebrity Bio Platform - Kurulum Rehberi

Bu rehber, projeyi sıfırdan kurup çalıştırmanız için adım adım talimatlar içerir.

## 📋 Gereksinimler

### Zorunlu
- **Node.js 18+** - [İndir](https://nodejs.org/)
- **Docker Desktop** - [İndir](https://www.docker.com/products/docker-desktop/)
- **Git** - [İndir](https://git-scm.com/)

### Opsiyonel
- **VS Code** - [İndir](https://code.visualstudio.com/)
- **Prisma Extension** - VS Code için

---

## 🎯 Kurulum Yöntemleri

### Yöntem 1: Otomatik Kurulum (Önerilen) ⚡

Bu yöntem tüm kurulum adımlarını otomatik olarak yapar.

#### Linux/macOS

```bash
# Projeyi klonlayın
git clone <repo-url>
cd celebrity-bio-platform

# Setup script'ini çalıştırın
chmod +x setup.sh
./setup.sh

# Development server'ı başlatın
npm run dev
```

#### Windows (PowerShell)

```powershell
# Projeyi klonlayın
git clone <repo-url>
cd celebrity-bio-platform

# Setup script'ini çalıştırın
.\setup.ps1

# Development server'ı başlatın
npm run dev
```

✅ **Kurulum tamamlandı!** `http://localhost:3000` adresine gidin.

---

### Yöntem 2: Manuel Kurulum 🛠️

Adım adım manuel kurulum yapmak isterseniz:

#### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd celebrity-bio-platform
```

#### 2. Docker Container'ları Başlatın

```bash
docker-compose up -d
```

Bu komut şu servisleri başlatır:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Meilisearch (port 7700)

Container'ların durumunu kontrol edin:
```bash
docker-compose ps
```

#### 3. Environment Variables

`.env.local` dosyasını oluşturun (veya `.env.example`'dan kopyalayın):

```bash
cp .env.example .env.local
```

`.env.local` içeriği:
```env
DATABASE_URL="postgresql://celebuser:celebpass123@localhost:5432/celebdb"
REDIS_URL="redis://localhost:6379"
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="masterKey123"
NEXTAUTH_SECRET="celebrity-bio-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4. Dependencies Yükleyin

```bash
npm install
```

#### 5. Prisma Setup

```bash
# Prisma client oluştur
npx prisma generate

# Veritabanı şemasını push et
npx prisma db push

# Örnek verileri ekle
npx prisma db seed
```

#### 6. Development Server

```bash
npm run dev
```

🎉 Tarayıcınızda `http://localhost:3000` adresini açın!

---

## 🔍 Kurulum Doğrulama

### 1. Docker Container'ları Kontrol Edin

```bash
docker-compose ps
```

Tüm servisler "Up" durumunda olmalı:
```
NAME                         STATUS
celebrity-bio-postgres       Up (healthy)
celebrity-bio-redis          Up (healthy)
celebrity-bio-meilisearch    Up (healthy)
```

### 2. Veritabanını Kontrol Edin

```bash
# Prisma Studio'yu açın
npm run db:studio
```

Tarayıcınızda `http://localhost:5555` açılacak ve veritabanı tablolarını görebilirsiniz.

### 3. Servislere Erişim Kontrol Edin

- **PostgreSQL:** `localhost:5432`
  ```bash
  docker exec -it celebrity-bio-postgres psql -U celebuser -d celebdb
  ```

- **Redis:** `localhost:6379`
  ```bash
  docker exec -it celebrity-bio-redis redis-cli ping
  # Response: PONG
  ```

- **Meilisearch:** `http://localhost:7700/health`

---

## 👤 Admin Panel Erişimi

Seed işlemi otomatik olarak bir admin kullanıcı oluşturur:

- **Email:** `admin@celebritybio.com`
- **Password:** `admin123`

Admin panele erişim: `http://localhost:3000/admin`

> ⚠️ **Önemli:** Production'da mutlaka şifreyi değiştirin!

---

## 📦 Örnek Veriler

Seed işlemi (`npx prisma db seed`) şunları oluşturur:

### Ünlüler (2)
1. **CZN Burak** (Burak Özdemir)
   - Chef, Entrepreneur
   - Instagram: 54.2M followers
   - TikTok: 32.1M followers

2. **Enes Batur**
   - YouTuber, Content Creator
   - YouTube: 16M subscribers
   - Instagram: 8.5M followers

### Etiketler (6)
- YouTuber
- TikTok Star
- Chef
- Turkish
- Entrepreneur
- Gaming

### Diğer
- 1 haber makalesi
- 5 sosyal medya linki
- 2 popülerlik istatistiği

---

## 🔧 Yararlı Komutlar

### Development

```bash
npm run dev              # Development server (port 3000)
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint kontrolü
npm run type-check       # TypeScript kontrolü
```

### Database

```bash
npm run db:generate      # Prisma client oluştur
npm run db:push          # Schema'yı veritabanına push et
npm run db:migrate       # Migration oluştur ve çalıştır
npm run db:seed          # Örnek verileri ekle
npm run db:studio        # Prisma Studio aç
```

### Docker

```bash
docker-compose up -d     # Container'ları başlat (detached mode)
docker-compose down      # Container'ları durdur
docker-compose logs      # Logları görüntüle
docker-compose ps        # Container durumlarını göster
docker-compose restart   # Container'ları yeniden başlat
```

---

## ❌ Sorun Giderme

### Docker container'lar başlamıyor

```bash
# Container'ları temizle ve yeniden başlat
docker-compose down -v
docker-compose up -d
```

### PostgreSQL bağlantı hatası

```bash
# PostgreSQL'in hazır olup olmadığını kontrol edin
docker exec celebrity-bio-postgres pg_isready -U celebuser -d celebdb

# Eğer ready değilse, logları kontrol edin
docker-compose logs postgres
```

### Prisma client hatası

```bash
# Prisma client'i yeniden oluştur
npx prisma generate
```

### Port çakışması

Eğer port'lar başka bir uygulama tarafından kullanılıyorsa, `docker-compose.yml` dosyasındaki port'ları değiştirin:

```yaml
ports:
  - "5433:5432"  # PostgreSQL için alternatif port
```

### Module not found hatası

```bash
# node_modules ve lock dosyasını silin, yeniden yükleyin
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Veritabanını Sıfırlama

Eğer veritabanını tamamen sıfırlamak isterseniz:

```bash
# Container'ı durdur ve volume'leri sil
docker-compose down -v

# Yeniden başlat
docker-compose up -d

# Schema ve seed'i yeniden çalıştır
npx prisma db push
npx prisma db seed
```

---

## 🌐 Production Deployment

### Vercel'e Deploy

1. Vercel hesabı oluşturun: https://vercel.com
2. GitHub repo'nuzu bağlayın
3. Environment variables ekleyin (Vercel dashboard)
4. Deploy edin

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://..."  # Production database (Vercel Postgres, Supabase, vb.)
REDIS_URL="redis://..."
MEILISEARCH_HOST="https://..."
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## 📞 Yardım

Sorun yaşıyorsanız:

1. Bu rehberi baştan okuyun
2. Dokümantasyonu kontrol edin: `docs/`
3. GitHub Issues açın
4. Discord/Slack kanalımıza katılın

---

**Başarılı bir kurulum dileriz! 🚀**
