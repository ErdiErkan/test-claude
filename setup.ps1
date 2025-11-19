# Celebrity Bio Platform - Database Setup (Windows)

Write-Host "🚀 Celebrity Bio Platform - Database Setup" -ForegroundColor Cyan
Write-Host "==========================================="
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Blue
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop for Windows." -ForegroundColor Red
    Write-Host "Visit: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}

Write-Host ""

# Start Docker containers
Write-Host "Starting Docker containers..." -ForegroundColor Blue
docker-compose up -d

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    try {
        docker exec celebrity-bio-postgres pg_isready -U celebuser -d celebdb 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        } else {
            Write-Host "   Still waiting for PostgreSQL..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            $attempt++
        }
    } catch {
        Write-Host "   Still waiting for PostgreSQL..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if ($ready) {
    Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env.local exists
if (-not (Test-Path .env.local)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow

    @"
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
"@ | Out-File -FilePath .env.local -Encoding UTF8

    Write-Host "✅ .env.local created" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

Write-Host ""

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Blue
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Blue
npx prisma generate
Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Push database schema
Write-Host "Pushing database schema..." -ForegroundColor Blue
npx prisma db push --skip-generate
Write-Host "✅ Database schema pushed" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "Seeding database with sample data..." -ForegroundColor Blue
npx prisma db seed
Write-Host "✅ Database seeded" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Running services:" -ForegroundColor Blue
Write-Host "   - PostgreSQL: localhost:5432"
Write-Host "   - Redis: localhost:6379"
Write-Host "   - Meilisearch: localhost:7700"
Write-Host ""
Write-Host "👤 Admin Login:" -ForegroundColor Blue
Write-Host "   Email: admin@celebritybio.com"
Write-Host "   Password: admin123"
Write-Host ""
Write-Host "📦 Sample Data:" -ForegroundColor Blue
Write-Host "   - 2 celebrities (CZN Burak, Enes Batur)"
Write-Host "   - 6 tags"
Write-Host "   - 1 news item"
Write-Host ""
Write-Host "🚀 Start development server:" -ForegroundColor Blue
Write-Host "   npm run dev"
Write-Host ""
Write-Host "🔧 Useful commands:" -ForegroundColor Blue
Write-Host "   npm run db:studio    # Open Prisma Studio"
Write-Host "   docker-compose logs  # View container logs"
Write-Host "   docker-compose down  # Stop containers"
Write-Host ""
