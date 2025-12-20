#!/bin/bash

# Complete Local MySQL Setup Script
# This script will:
# 1. Start MySQL service
# 2. Reset root password to India@123
# 3. Create database
# 4. Update .env file
# 5. Run Prisma migrations
# 6. Export database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

MYSQL_PASSWORD="India@123"
DB_NAME="property_portal"

echo -e "${GREEN}=== Local MySQL Setup Script ===${NC}\n"

# Step 1: Start MySQL
echo -e "${YELLOW}Step 1: Starting MySQL service...${NC}"
if brew services list | grep -q "mysql.*started"; then
    echo -e "${GREEN}✓ MySQL is already running${NC}"
else
    echo "Starting MySQL..."
    brew services start mysql || {
        echo -e "${RED}Failed to start MySQL via brew. Trying alternative method...${NC}"
        echo "Please run manually: brew services start mysql"
        echo "Or: sudo /opt/homebrew/bin/mysqld_safe --user=mysql &"
    }
    sleep 3
fi

# Step 2: Check if MySQL is accessible
echo -e "\n${YELLOW}Step 2: Checking MySQL connection...${NC}"
if mysql -u root -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✓ MySQL is accessible without password${NC}"
    NO_PASSWORD=true
elif mysql -u root -p"$MYSQL_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✓ MySQL is accessible with password${NC}"
    NO_PASSWORD=false
else
    echo -e "${RED}✗ Cannot connect to MySQL${NC}"
    echo "Attempting to reset password..."
    
    # Try to reset password using mysqladmin or safe mode
    echo "Please run these commands manually:"
    echo "1. Stop MySQL: brew services stop mysql"
    echo "2. Start MySQL in safe mode: sudo mysqld_safe --skip-grant-tables &"
    echo "3. Connect: mysql -u root"
    echo "4. Run: ALTER USER 'root'@'localhost' IDENTIFIED BY 'India@123';"
    echo "5. Run: FLUSH PRIVILEGES;"
    echo "6. Restart MySQL: brew services restart mysql"
    exit 1
fi

# Step 3: Reset/Set password
echo -e "\n${YELLOW}Step 3: Setting root password to India@123...${NC}"
if [ "$NO_PASSWORD" = true ]; then
    mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';
FLUSH PRIVILEGES;
EOF
    echo -e "${GREEN}✓ Password set successfully${NC}"
else
    echo -e "${GREEN}✓ Password already set${NC}"
fi

# Step 4: Create database
echo -e "\n${YELLOW}Step 4: Creating database '$DB_NAME'...${NC}"
mysql -u root -p"$MYSQL_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES LIKE '$DB_NAME';
EOF
echo -e "${GREEN}✓ Database created${NC}"

# Step 5: Update .env file
echo -e "\n${YELLOW}Step 5: Updating .env file...${NC}"
if [ -f .env ]; then
    # Backup existing .env
    cp .env .env.backup
    echo "Backed up existing .env to .env.backup"
    
    # Update DATABASE_URL
    if grep -q "DATABASE_URL=" .env; then
        # Replace existing DATABASE_URL
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME\"|" .env
        rm -f .env.bak
    else
        # Add DATABASE_URL if not exists
        echo "" >> .env
        echo "DATABASE_URL=\"mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME\"" >> .env
    fi
    echo -e "${GREEN}✓ .env file updated${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found. Creating new one...${NC}"
    cat > .env <<EOF
DATABASE_URL="mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="swp6i8CDUYwe6tTgLGRcDT8F/v5LZ0J+SaV2l1ZF2Kk="
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM_EMAIL=""
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
fi

# Step 6: Generate Prisma Client
echo -e "\n${YELLOW}Step 6: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Step 7: Run migrations
echo -e "\n${YELLOW}Step 7: Running database migrations...${NC}"
npx prisma migrate dev --name init
echo -e "${GREEN}✓ Migrations completed${NC}"

# Step 8: Export database
echo -e "\n${YELLOW}Step 8: Exporting database...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="property_portal_export_${TIMESTAMP}.sql"

mysqldump -u root -p"$MYSQL_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --default-character-set=utf8mb4 \
    "$DB_NAME" > "$EXPORT_FILE"

if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$EXPORT_FILE" | cut -f1)
    echo -e "${GREEN}✓ Database exported successfully!${NC}"
    echo -e "${GREEN}File: $EXPORT_FILE${NC}"
    echo -e "${GREEN}Size: $FILE_SIZE${NC}"
else
    echo -e "${RED}✗ Export failed${NC}"
fi

echo -e "\n${GREEN}=== Setup Complete! ===${NC}\n"
echo "Next steps:"
echo "1. Upload $EXPORT_FILE to Hostinger"
echo "2. Import via phpMyAdmin"
echo "3. Update production .env with Hostinger MySQL credentials"
echo ""
echo "MySQL Credentials:"
echo "  Username: root"
echo "  Password: $MYSQL_PASSWORD"
echo "  Database: $DB_NAME"

