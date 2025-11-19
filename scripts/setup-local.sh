#!/bin/bash
set -e

echo "🚀 Celebrity Bio Platform - Local Setup"
echo "========================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration!"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo ""
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.yml up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Seed database
echo ""
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "✅ Setup completed!"
echo ""
echo "🎉 You can now start the development server:"
echo "   npm run dev"
echo ""
echo "📊 Access Prisma Studio:"
echo "   npm run db:studio"
echo ""
echo "🔐 Default admin credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
