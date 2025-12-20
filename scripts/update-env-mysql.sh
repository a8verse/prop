#!/bin/bash

# Quick script to update .env with MySQL credentials

MYSQL_PASSWORD="India@123"
DB_NAME="property_portal"

if [ -f .env ]; then
    echo "Updating existing .env file..."
    # Backup
    cp .env .env.backup
    
    # Update or add DATABASE_URL
    if grep -q "DATABASE_URL=" .env; then
        # Replace existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME\"|" .env
        else
            # Linux
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME\"|" .env
        fi
        echo "✓ Updated DATABASE_URL in .env"
    else
        # Add new
        echo "" >> .env
        echo "DATABASE_URL=\"mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME\"" >> .env
        echo "✓ Added DATABASE_URL to .env"
    fi
else
    echo "Creating new .env file..."
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
    echo "✓ Created .env file"
fi

echo ""
echo "MySQL Configuration:"
echo "  Username: root"
echo "  Password: $MYSQL_PASSWORD"
echo "  Database: $DB_NAME"
echo ""
echo "DATABASE_URL updated in .env file!"

