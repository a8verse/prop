#!/usr/bin/env node

/**
 * Create Admin User in Railway Database
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log('\n👤 Creating Admin User\n');

  const railwayUrl = process.env.DATABASE_URL || 'mysql://root:yFSSouKwfzNXXmSMyWzWyyomCjLXHDIQ@shuttle.proxy.rlwy.net:23969/railway';
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: railwayUrl,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log('✅ Connected to Railway database\n');

    const email = 'admin@oliofly.com';
    const password = 'India@123';
    const name = 'Admin User';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name,
        },
      });
      console.log('✅ Updated existing admin user');
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'ADMIN',
        },
      });
      console.log('✅ Created new admin user');
    }

    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n🔗 Login URL: https://oliofly.com/login?type=admin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();

