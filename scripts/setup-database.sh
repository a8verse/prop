#!/bin/bash

# Database Setup Script
echo "Setting up Property Portal Database..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS: brew services start postgresql"
    exit 1
fi

# Database configuration
DB_NAME="property_portal"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

echo "Creating database: $DB_NAME"

# Create database (will fail if exists, that's okay)
psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database may already exist"

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database credentials"
echo "2. Run: npx prisma generate"
echo "3. Run: npx prisma migrate dev --name init"

