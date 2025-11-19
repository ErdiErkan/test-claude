.PHONY: help install dev build start stop clean migrate seed docker-dev docker-prod logs ps health

# Default target
help:
	@echo "Celebrity Bio Platform - Available Commands"
	@echo "==========================================="
	@echo ""
	@echo "Local Development:"
	@echo "  make install       - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make start        - Start production server"
	@echo "  make migrate      - Run database migrations"
	@echo "  make seed         - Seed database with test data"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-dev   - Start development environment with Docker"
	@echo "  make docker-prod  - Start production environment with Docker"
	@echo "  make docker-stop  - Stop all Docker containers"
	@echo "  make docker-clean - Stop and remove all containers and volumes"
	@echo "  make logs         - Show Docker logs"
	@echo "  make ps           - Show running containers"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-push      - Push schema changes to database"
	@echo "  make db-studio    - Open Prisma Studio"
	@echo "  make db-reset     - Reset database (WARNING: deletes all data)"
	@echo ""
	@echo "Utilities:"
	@echo "  make health       - Check application health"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make setup-local  - Complete local setup"
	@echo "  make setup-docker - Complete Docker setup"

# Installation
install:
	@echo "📦 Installing dependencies..."
	npm ci
	npx prisma generate

# Development
dev:
	@echo "🚀 Starting development server..."
	npm run dev

build:
	@echo "🏗️  Building for production..."
	npm run build

start:
	@echo "▶️  Starting production server..."
	npm start

# Database
migrate:
	@echo "🗄️  Running database migrations..."
	npx prisma migrate deploy

seed:
	@echo "🌱 Seeding database..."
	npx prisma db seed

db-push:
	@echo "⬆️  Pushing schema to database..."
	npx prisma db push

db-studio:
	@echo "📊 Opening Prisma Studio..."
	npx prisma studio

db-reset:
	@echo "⚠️  Resetting database..."
	npx prisma migrate reset --force

# Docker Development
docker-dev:
	@echo "🐳 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build -d
	@echo "✅ Development environment started!"
	@echo "🌐 Application: http://localhost:3000"
	@echo "🔐 Admin Panel: http://localhost:3000/admin"

docker-prod:
	@echo "🐳 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up --build -d
	@echo "✅ Production environment started!"
	@echo "🌐 Application: http://localhost:3000"

docker-stop:
	@echo "🛑 Stopping Docker containers..."
	docker-compose -f docker-compose.dev.yml down || true
	docker-compose -f docker-compose.prod.yml down || true

docker-clean:
	@echo "🧹 Cleaning Docker environment..."
	docker-compose -f docker-compose.dev.yml down -v || true
	docker-compose -f docker-compose.prod.yml down -v || true
	@echo "✅ Docker environment cleaned!"

logs:
	@echo "📜 Showing Docker logs..."
	docker-compose -f docker-compose.dev.yml logs -f || docker-compose -f docker-compose.prod.yml logs -f

ps:
	@echo "📋 Running containers:"
	docker ps --filter "name=celebrity-bio"

# Utilities
health:
	@echo "🏥 Checking application health..."
	@curl -f http://localhost:3000/api/health || echo "❌ Health check failed"

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf out
	@echo "✅ Clean completed!"

setup-local:
	@echo "🚀 Running local setup..."
	./scripts/setup-local.sh

setup-docker:
	@echo "🐳 Running Docker setup..."
	./scripts/setup-docker.sh

# Type checking
type-check:
	@echo "🔍 Running type check..."
	npm run type-check

# Linting
lint:
	@echo "🔍 Running linter..."
	npm run lint

# Run all checks
check: type-check lint
	@echo "✅ All checks passed!"
