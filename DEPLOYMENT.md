# 🚀 Celebrity Bio Platform - Deployment Guide

Complete guide for deploying the Celebrity Bio Platform in various environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v20.x or higher
- **npm**: v9.x or higher
- **Docker**: v24.x or higher (for Docker deployment)
- **Docker Compose**: v2.x or higher (for Docker deployment)
- **PostgreSQL**: v14.x or higher (for local development without Docker)

### Optional Software

- **Redis**: v7.x or higher (for caching)
- **Meilisearch**: v1.5 or higher (for search functionality)

---

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

The fastest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd celebrity-bio-platform

# Run the setup script
chmod +x scripts/setup-docker.sh
./scripts/setup-docker.sh

# Select "1" for development environment
```

That's it! The application will be available at http://localhost:3000

### Option 2: Using Makefile

```bash
# Install dependencies
make install

# Start Docker services (database, Redis, Meilisearch)
docker-compose up -d

# Run migrations and seed
make migrate
make seed

# Start development server
make dev
```

### Option 3: Manual Setup

See [Local Development](#local-development) section below.

---

## 💻 Local Development

### Step 1: Install Dependencies

```bash
npm ci
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and update the values
nano .env
```

Required environment variables for local development:

```bash
DATABASE_URL="postgresql://celebuser:celebpass123@localhost:5432/celebdb"
NEXTAUTH_SECRET="your-secret-key-change-in-production-min-32-characters"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Start Database Services

```bash
# Start PostgreSQL, Redis, and Meilisearch using Docker
docker-compose up -d

# Or install them locally and start manually
```

### Step 4: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database with test data
npx prisma db seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

Default admin credentials:
- **Email**: admin@example.com
- **Password**: admin123

### Development Tools

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 🐳 Docker Deployment

### Development Environment

Full development environment with hot reload:

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up --build

# Or using Makefile
make docker-dev

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

Optimized production build:

```bash
# Create .env file with production values
cp .env.example .env
nano .env

# Important: Generate secure secret
openssl rand -base64 32

# Update NEXTAUTH_SECRET in .env with the generated value

# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d

# Or using Makefile
make docker-prod

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost:3000/api/health
```

### Docker Commands Reference

```bash
# View running containers
docker ps --filter "name=celebrity-bio"

# View logs of specific service
docker logs celebrity-bio-app -f

# Execute command in container
docker exec -it celebrity-bio-app sh

# Restart a service
docker-compose -f docker-compose.prod.yml restart app

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose -f docker-compose.prod.yml down -v
```

---

## 🌐 Production Deployment

### Prerequisites for Production

1. **Domain Name**: Configured DNS pointing to your server
2. **SSL Certificate**: Let's Encrypt or commercial SSL
3. **Server**: Ubuntu 22.04 LTS or similar (2GB RAM minimum, 4GB recommended)
4. **Docker & Docker Compose**: Installed on server

### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create application directory
mkdir -p /var/www/celebrity-bio
cd /var/www/celebrity-bio
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone <repository-url> .

# Create production .env
cp .env.example .env
nano .env
```

Update these critical values:

```bash
# Database (use strong passwords)
POSTGRES_USER="celebuser"
POSTGRES_PASSWORD="<generate-strong-password>"
POSTGRES_DB="celebdb"

# Database URL
DATABASE_URL="postgresql://celebuser:<password>@postgres:5432/celebdb"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="<generate-secure-secret-min-32-chars>"
NEXTAUTH_URL="https://yourdomain.com"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Meilisearch (generate strong key)
MEILI_MASTER_KEY="<generate-strong-key>"
MEILISEARCH_API_KEY="<same-as-master-key>"
```

### Step 3: SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Create SSL directory for Nginx
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/certificate.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/private.key
```

### Step 4: Configure Nginx

Update `nginx.conf` with your domain:

```bash
nano nginx.conf
```

Uncomment and configure the HTTPS section:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Step 5: Deploy

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
sleep 20

# Check health
curl https://yourdomain.com/api/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 6: Set Up Auto-Renewal for SSL

```bash
# Create renewal script
sudo nano /etc/cron.monthly/renew-ssl.sh
```

Add:

```bash
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /var/www/celebrity-bio/ssl/certificate.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /var/www/celebrity-bio/ssl/private.key
docker-compose -f /var/www/celebrity-bio/docker-compose.prod.yml restart nginx
```

Make it executable:

```bash
sudo chmod +x /etc/cron.monthly/renew-ssl.sh
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth (min 32 chars) | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `MEILISEARCH_HOST` | Meilisearch server URL | `http://localhost:7700` |
| `MEILISEARCH_API_KEY` | Meilisearch API key | `masterKey123` |
| `S3_BUCKET` | AWS S3 bucket for media | - |
| `S3_REGION` | AWS S3 region | `eu-central-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - |

### Docker-Specific Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `celebuser` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `celebpass123` |
| `POSTGRES_DB` | PostgreSQL database name | `celebdb` |
| `MEILI_MASTER_KEY` | Meilisearch master key | `masterKey123` |

---

## 🗄️ Database Setup

### Running Migrations

```bash
# Development
npx prisma migrate dev

# Production (doesn't prompt for reset)
npx prisma migrate deploy
```

### Seeding Database

The seed script creates:
- 8 sample celebrities
- 11 tags (professions, awards, etc.)
- 5 news articles
- 1 admin user (admin@example.com / admin123)

```bash
# Run seed
npx prisma db seed

# Or using npm
npm run db:seed
```

### Database Backup

```bash
# Backup from Docker container
docker exec celebrity-bio-postgres pg_dump -U celebuser celebdb > backup.sql

# Restore backup
docker exec -i celebrity-bio-postgres psql -U celebuser celebdb < backup.sql
```

### Reset Database (⚠️ Deletes all data)

```bash
# Local
npx prisma migrate reset --force

# Docker
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🏥 Health Checks

### Application Health Endpoint

```bash
# Check application health
curl http://localhost:3000/api/health

# Response when healthy:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "database": "connected",
    "application": "running"
  }
}
```

### Service Health Checks

```bash
# Check PostgreSQL
docker exec celebrity-bio-postgres pg_isready -U celebuser

# Check Redis
docker exec celebrity-bio-redis redis-cli ping

# Check Meilisearch
curl http://localhost:7700/health

# Check all containers
docker ps --filter "name=celebrity-bio" --format "table {{.Names}}\t{{.Status}}"
```

---

## 🔧 Troubleshooting

### Application Won't Start

**Issue**: Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Issue**: Database connection failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database logs
docker logs celebrity-bio-postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### Database Issues

**Issue**: Prisma Client not generated

```bash
# Regenerate Prisma Client
npx prisma generate
```

**Issue**: Migration failed

```bash
# Check migration status
npx prisma migrate status

# Reset and reapply (⚠️ deletes data)
npx prisma migrate reset
```

### Docker Issues

**Issue**: Container keeps restarting

```bash
# Check logs
docker logs celebrity-bio-app --tail 100

# Check health status
docker inspect celebrity-bio-app | grep Health -A 10
```

**Issue**: Out of disk space

```bash
# Remove unused Docker resources
docker system prune -a --volumes

# Check disk usage
df -h
docker system df
```

### Performance Issues

**Issue**: Slow database queries

```bash
# Open Prisma Studio to inspect data
npx prisma studio

# Check PostgreSQL slow queries
docker exec -it celebrity-bio-postgres psql -U celebuser -d celebdb -c "SELECT * FROM pg_stat_activity;"
```

**Issue**: Memory issues

```bash
# Check Docker memory usage
docker stats

# Increase memory limit in docker-compose.yml
# deploy:
#   resources:
#     limits:
#       memory: 1G
```

---

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### Application Metrics

Access Prisma Studio for database insights:

```bash
npx prisma studio
# Opens at http://localhost:5555
```

---

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d

# Run new migrations
docker exec celebrity-bio-app npx prisma migrate deploy

# Check health
curl https://yourdomain.com/api/health
```

---

## 📝 Additional Notes

### Security Checklist

- ✅ Change all default passwords
- ✅ Generate secure NEXTAUTH_SECRET (min 32 chars)
- ✅ Use HTTPS in production
- ✅ Configure firewall (allow only 80, 443, 22)
- ✅ Regular database backups
- ✅ Keep Docker images updated
- ✅ Monitor application logs
- ✅ Use strong PostgreSQL password
- ✅ Restrict database access to application only

### Performance Optimization

- Enable Redis caching for better performance
- Configure Meilisearch for fast search
- Use CDN for static assets
- Enable Nginx gzip compression
- Optimize images before upload
- Monitor and optimize database queries

### Scaling

For high-traffic scenarios:
- Use managed PostgreSQL (AWS RDS, DigitalOcean Managed Database)
- Use Redis for session storage
- Deploy multiple app containers with load balancer
- Use CDN for static assets
- Enable database read replicas

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Repository URL]
- Documentation: See README.md and SETUP_GUIDE.md

---

**Happy Deploying! 🚀**
