#!/bin/bash

# Vercel Database Connection Debugger
# This script helps identify database connection issues on Vercel

echo "🔍 Database Connection Diagnostic Report"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is NOT SET"
    echo ""
    echo "To fix this:"
    echo "1. Go to your Vercel project dashboard"
    echo "2. Navigate to Settings → Environment Variables"
    echo "3. Add DATABASE_URL with your database connection string"
    echo ""
    echo "Connection String Format (with pooling for Vercel):"
    echo "  mysql://user:password@host:3306/database?schema=public"
    echo ""
else
    echo "✅ DATABASE_URL is set"
    # Mask the password for security
    MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:*****@/')
    echo "   URL (masked): $MASKED_URL"
    echo ""
fi

# Check if database is MySQL
if [[ "$DATABASE_URL" == mysql://* ]]; then
    echo "✅ Database provider: MySQL"
else
    echo "⚠️  Database provider: Not MySQL (check compatibility)"
fi

# Check Prisma configuration
if [ -f "prisma/schema.prisma" ]; then
    echo "✅ Prisma schema file exists"
    if grep -q "provider = \"mysql\"" prisma/schema.prisma; then
        echo "✅ Prisma provider is MySQL"
    else
        echo "⚠️  Prisma provider is not MySQL (check compatibility)"
    fi
else
    echo "❌ Prisma schema file not found"
fi

echo ""
echo "Common Issues & Solutions:"
echo "=========================="
echo ""
echo "1. P1017 - Server has closed the connection"
echo "   Solution: Enable connection pooling in DATABASE_URL"
echo "   Or use a connection pooling service like PgBouncer"
echo ""
echo "2. ECONNREFUSED"
echo "   Solution: Check database host and port are correct"
echo "   Ensure database allows remote connections"
echo ""
echo "3. Authentication failed"
echo "   Solution: Verify username and password in DATABASE_URL"
echo ""
echo "4. Connection timeout"
echo "   Solution: Check network access/firewall rules"
echo "   Increase maxWaitRequestsPerConnection in Prisma"
echo ""
echo "Next Steps:"
echo "==========="
echo "1. Redeploy your Vercel project: vercel deploy --prod"
echo "2. Check Vercel logs: vercel logs"
echo "3. Test local connection first: npm run dev"
