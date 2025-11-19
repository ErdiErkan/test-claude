#!/bin/bash

echo "🚀 Celebrity Bio Platform - Database Setup"
echo "==========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo -e "${BLUE}Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo ""

# Start Docker containers
echo -e "${BLUE}Starting Docker containers...${NC}"
docker-compose up -d

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 10

# Check if PostgreSQL is ready
until docker exec celebrity-bio-postgres pg_isready -U celebuser -d celebdb &> /dev/null; do
    echo -e "${YELLOW}   Still waiting for PostgreSQL...${NC}"
    sleep 2
done

echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << 'EOF'
# Database (Docker)
DATABASE_URL="postgresql://celebuser:celebpass123@localhost:5432/celebdb"

# Redis (Docker)
REDIS_URL="redis://localhost:6379"

# Meilisearch (Docker)
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_API_KEY="masterKey123"

# NextAuth
NEXTAUTH_SECRET="celebrity-bio-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Public URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EOF
    echo -e "${GREEN}✅ .env.local created${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi
echo ""

# Install dependencies
echo -e "${BLUE}Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Generate Prisma Client
echo -e "${BLUE}Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Push database schema
echo -e "${BLUE}Pushing database schema...${NC}"
npx prisma db push --skip-generate
echo -e "${GREEN}✅ Database schema pushed${NC}"
echo ""

# Seed database
echo -e "${BLUE}Seeding database with sample data...${NC}"
npx prisma db seed
echo -e "${GREEN}✅ Database seeded${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📊 Running services:${NC}"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Meilisearch: localhost:7700"
echo ""
echo -e "${BLUE}👤 Admin Login:${NC}"
echo "   Email: admin@celebritybio.com"
echo "   Password: admin123"
echo ""
echo -e "${BLUE}📦 Sample Data:${NC}"
echo "   - 2 celebrities (CZN Burak, Enes Batur)"
echo "   - 6 tags"
echo "   - 1 news item"
echo ""
echo -e "${BLUE}🚀 Start development server:${NC}"
echo "   npm run dev"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo "   npm run db:studio    # Open Prisma Studio"
echo "   docker-compose logs  # View container logs"
echo "   docker-compose down  # Stop containers"
echo ""
