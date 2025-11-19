#!/bin/bash
set -e

echo "🔧 Initializing database..."

# The database is created by POSTGRES_DB environment variable
# This script can be used for additional setup if needed

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create additional indexes if needed
    -- These will be created by Prisma migrations, but we can add custom ones here

    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

echo "✅ Database initialization completed!"
