#!/bin/bash

# Deployment Script for Hostinger
# This script prepares your application for deployment

echo "🚀 Starting deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.production not found${NC}"
    echo "Creating .env.production.example as template..."
    echo "Please create .env.production with your production values"
fi

# Step 1: Clean previous builds
echo -e "\n${GREEN}Step 1: Cleaning previous builds...${NC}"
rm -rf .next
echo "✅ Cleaned .next directory"

# Step 2: Install dependencies (skip if node_modules exists)
echo -e "\n${GREEN}Step 2: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  npm install failed, but continuing...${NC}"
        echo -e "${YELLOW}   You may need to run 'npm install' manually${NC}"
    else
        echo "✅ Dependencies installed"
    fi
else
    echo "✅ Dependencies already installed (node_modules exists)"
fi

# Step 3: Generate Prisma Client
echo -e "\n${GREEN}Step 3: Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo "✅ Prisma Client generated"

# Step 4: Build for production
echo -e "\n${GREEN}Step 4: Building for production...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo "✅ Build completed successfully"

# Step 5: Create deployment package info
echo -e "\n${GREEN}Step 5: Creating deployment checklist...${NC}"
cat > DEPLOYMENT_CHECKLIST.txt << 'EOF'
📦 Files to Upload to Hostinger:

Required Files:
├── .next/              (build output - REQUIRED)
├── public/             (images, static files - REQUIRED)
├── prisma/             (schema and migrations - REQUIRED)
├── node_modules/       (or install on server with: npm install --production)
├── package.json        (REQUIRED)
├── package-lock.json   (REQUIRED)
├── next.config.js      (REQUIRED)
├── tsconfig.json       (REQUIRED)
├── tailwind.config.js  (REQUIRED)
├── postcss.config.js   (REQUIRED)
├── server.js           (REQUIRED - for Node.js hosting)
└── .env.production     (RENAME to .env on server - REQUIRED)

Optional Files:
├── scripts/            (for admin user creation)
└── README.md

📋 Post-Upload Steps:

1. SSH into your server or use Hostinger File Manager
2. Navigate to your domain directory (usually public_html)
3. Rename .env.production to .env
4. Install dependencies: npm install --production
5. Generate Prisma Client: npx prisma generate
6. Run migrations: npx prisma migrate deploy
7. Create admin user: node scripts/create-admin.js
8. Start application (via Hostinger Node.js panel or PM2)

🔐 Environment Variables to Set in Hostinger:

- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- FACEBOOK_CLIENT_ID
- FACEBOOK_CLIENT_SECRET
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- SMTP_FROM_EMAIL

✅ Verification Steps:

1. Visit https://yourdomain.com
2. Test admin login
3. Test visitor OAuth login
4. Test property creation
5. Verify images load
6. Check mobile responsiveness

EOF

echo "✅ Deployment checklist created: DEPLOYMENT_CHECKLIST.txt"

# Step 6: Summary
echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment preparation complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT_CHECKLIST.txt"
echo "2. Upload files to Hostinger (see checklist)"
echo "3. Configure environment variables"
echo "4. Run database migrations"
echo "5. Start your application"
echo ""
echo "For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""

