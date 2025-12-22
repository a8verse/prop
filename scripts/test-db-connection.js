// Test database connection script
// Run: node scripts/test-db-connection.js

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  console.log('🔍 Testing database connection...\n');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
  console.log('');

  try {
    // Test connection
    console.log('1. Testing connection...');
    await prisma.$connect();
    console.log('✅ Connection successful!\n');

    // Test simple query
    console.log('2. Testing query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query successful:', result);
    console.log('');

    // Test table access
    console.log('3. Testing table access...');
    const categories = await prisma.category.findMany({ take: 1 });
    console.log('✅ Table access successful!');
    console.log(`   Found ${categories.length} categories\n`);

    console.log('🎉 All tests passed! Database connection is working.');
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('');

    // Provide specific guidance based on error
    if (error.code === 'P1000') {
      console.log('💡 This error means: Authentication failed');
      console.log('   - Check your username and password');
      console.log('   - Verify password is correctly URL-encoded');
      console.log('   - Ensure Hostinger allows external connections');
    } else if (error.code === 'P1001') {
      console.log('💡 This error means: Cannot reach database server');
      console.log('   - Check if Hostinger allows external connections');
      console.log('   - Verify the host address is correct');
      console.log('   - Check firewall settings');
    } else if (error.code === 'P1003') {
      console.log('💡 This error means: Database does not exist');
      console.log('   - Verify database name is correct');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

