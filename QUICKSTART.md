# ⚡ Quick Start Guide

Get the Celebrity Bio Platform running in 5 minutes!

## 🚀 Fastest Way (Docker)

```bash
# 1. Clone the repository
git clone <repository-url>
cd celebrity-bio-platform

# 2. Run the setup script
chmod +x scripts/setup-docker.sh
./scripts/setup-docker.sh

# 3. Select "1" for development
# Wait for setup to complete...

# 4. Open your browser
# http://localhost:3000
```

**That's it!** 🎉

## 🔐 Login Credentials

**Admin Panel**: http://localhost:3000/admin

- **Email**: admin@example.com
- **Password**: admin123

## 📦 What You Get

- ✅ 8 sample celebrities
- ✅ 11 tags (professions, awards, etc.)
- ✅ 5 news articles
- ✅ Full admin panel
- ✅ Search functionality
- ✅ Multi-language support (TR/EN)

## 🎯 Key URLs

| Service | URL |
|---------|-----|
| Homepage | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin |
| Popular Celebrities | http://localhost:3000/en/popular |
| Birthdays | http://localhost:3000/en/birthdays |
| News | http://localhost:3000/en/news |
| Health Check | http://localhost:3000/api/health |
| Prisma Studio | Run `make db-studio` |
| Meilisearch | http://localhost:7700 |

## 🛠️ Alternative: Local Development

If you prefer not to use Docker:

```bash
# 1. Install dependencies
npm ci

# 2. Start services
docker-compose up -d  # Only database, Redis, Meilisearch

# 3. Setup database
cp .env.example .env
npx prisma migrate deploy
npx prisma db seed

# 4. Start dev server
npm run dev
```

## 📝 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart app
docker-compose restart app

# Open database GUI
make db-studio

# Check health
curl http://localhost:3000/api/health
```

## 🆘 Having Issues?

### Port already in use?

```bash
# Stop all containers
docker-compose down

# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database connection error?

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres
```

### Need help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

## 🎓 Next Steps

1. **Explore the Admin Panel**
   - Create new celebrities
   - Add news articles
   - Manage tags and users

2. **Customize Content**
   - Edit existing celebrity profiles
   - Add your own data
   - Configure search settings

3. **Learn the Stack**
   - Read [README.md](./README.md) for architecture
   - Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for details
   - Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production

## 🚀 Deploy to Production

When you're ready:

```bash
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Or see DEPLOYMENT.md for full production guide
```

---

**Happy Building! 🎉**
