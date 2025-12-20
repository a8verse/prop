#!/bin/bash

# Database Export Script for phpMyAdmin Import
# This script exports your local MySQL database to a SQL file

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Database Export Script ===${NC}\n"

# Get database name from .env or use default
if [ -f .env ]; then
    # Extract database name from DATABASE_URL
    DB_NAME=$(grep DATABASE_URL .env | sed -n 's/.*\/\([^?]*\).*/\1/p')
    if [ -z "$DB_NAME" ]; then
        DB_NAME="property_portal"
    fi
else
    DB_NAME="property_portal"
    echo -e "${YELLOW}Warning: .env file not found. Using default database name: $DB_NAME${NC}\n"
fi

# Get MySQL credentials
echo "Enter MySQL username (default: root):"
read -r DB_USER
DB_USER=${DB_USER:-root}

echo "Enter MySQL password:"
read -s DB_PASSWORD

# Generate filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="property_portal_export_${TIMESTAMP}.sql"

echo -e "\n${GREEN}Exporting database: $DB_NAME${NC}"
echo -e "${GREEN}Output file: $EXPORT_FILE${NC}\n"

# Export database
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --default-character-set=utf8mb4 \
    "$DB_NAME" > "$EXPORT_FILE"

# Check if export was successful
if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$EXPORT_FILE" | cut -f1)
    echo -e "\n${GREEN}✅ Export successful!${NC}"
    echo -e "${GREEN}File: $EXPORT_FILE${NC}"
    echo -e "${GREEN}Size: $FILE_SIZE${NC}"
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "1. Upload $EXPORT_FILE to Hostinger"
    echo "2. Open phpMyAdmin"
    echo "3. Select your database"
    echo "4. Go to Import tab"
    echo "5. Choose $EXPORT_FILE"
    echo "6. Click Import"
    echo -e "\n${YELLOW}Security Note:${NC} This file contains database data. Keep it secure!"
else
    echo -e "\n${RED}❌ Export failed!${NC}"
    echo "Please check:"
    echo "- Database name is correct"
    echo "- Username and password are correct"
    echo "- MySQL is running"
    echo "- User has proper privileges"
    exit 1
fi

