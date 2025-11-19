#!/bin/bash
set -e

echo "🐳 Celebrity Bio Platform - Docker Setup"
echo "========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env

    # Generate secure secret
    SECRET=$(openssl rand -base64 32)

    # Update NEXTAUTH_SECRET in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|g" .env
    else
        # Linux
        sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|g" .env
    fi

    echo "✅ Generated secure NEXTAUTH_SECRET"
    echo "⚠️  Please review and update other values in .env if needed!"
else
    echo "✅ .env file already exists"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo ""
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Choose environment
echo ""
echo "Select environment:"
echo "1) Development (with hot reload)"
echo "2) Production"
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        COMPOSE_FILE="docker-compose.dev.yml"
        ENV="development"
        ;;
    2)
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV="production"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🐳 Starting $ENV environment..."
docker-compose -f $COMPOSE_FILE up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

echo ""
echo "✅ Setup completed!"
echo ""
echo "🌐 Application is running at: http://localhost:3000"
echo "🔐 Admin panel: http://localhost:3000/admin"
echo ""
echo "📊 Services:"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - Meilisearch: http://localhost:7700"
echo ""
echo "🔐 Default admin credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "📝 View logs:"
echo "   docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f $COMPOSE_FILE down"
