#!/bin/bash

# Quick Import Script for Railway MySQL
# Usage: ./scripts/quick-import-railway.sh

set -e

echo "🚀 Quick Railway SQL Import"
echo ""

# SQL file path
SQL_FILE="/Users/eaklovyachawla/Desktop/property new/property_portal_export_cleaned.sql"

# Check if file exists
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

echo "✅ Found SQL file: $SQL_FILE"
FILE_SIZE=$(du -h "$SQL_FILE" | cut -f1)
echo "📊 Size: $FILE_SIZE"
echo ""

# Get Railway connection details
echo "=== Railway Connection ==="
echo ""
echo "Paste your Railway MySQL connection string:"
echo "Format: mysql://user:password@host:port/database"
read -r RAILWAY_URL

if [[ ! "$RAILWAY_URL" =~ ^mysql:// ]]; then
    echo "❌ Invalid connection string. Must start with mysql://"
    exit 1
fi

# Parse connection string
# Remove mysql:// prefix
CLEAN_URL="${RAILWAY_URL#mysql://}"

# Extract parts
USER_PASS="${CLEAN_URL%%@*}"
HOST_PORT_DB="${CLEAN_URL#*@}"

DB_USER="${USER_PASS%%:*}"
DB_PASSWORD="${USER_PASS#*:}"
DB_HOST="${HOST_PORT_DB%%:*}"
DB_PORT_DB="${HOST_PORT_DB#*:}"
DB_PORT="${DB_PORT_DB%%/*}"
DB_NAME="${DB_PORT_DB#*/}"

# Remove query parameters if any
DB_NAME="${DB_NAME%%\?*}"

echo ""
echo "✅ Connection details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo ""

# Import SQL file
echo "=== Importing Data ==="
echo ""
echo "Importing SQL file (this may take a moment)..."
echo ""

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Import successful!"
    echo ""
    echo "=== Next Steps ==="
    echo ""
    echo "1. Update Vercel DATABASE_URL:"
    echo "   Go to Vercel Dashboard → Project → Settings → Environment Variables"
    echo "   Update DATABASE_URL with:"
    echo "   $RAILWAY_URL"
    echo ""
    echo "2. Select environments: Production, Preview"
    echo "3. Click Save"
    echo "4. Redeploy: Deployments → Redeploy latest"
    echo "5. Test: Visit https://oliofly.com/api/test-db"
    echo ""
    echo "🎉 Done!"
else
    echo ""
    echo "❌ Import failed!"
    echo "Please check your connection string and try again."
    exit 1
fi

