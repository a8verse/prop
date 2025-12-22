#!/usr/bin/env node

/**
 * Verify slider images in Railway database
 */

const { PrismaClient } = require('@prisma/client');

async function main() {
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

    const sliderImages = await prisma.sliderImage.findMany({
      orderBy: { order: 'asc' },
    });

    console.log(`📊 Found ${sliderImages.length} slider images:\n`);

    sliderImages.forEach((img, idx) => {
      console.log(`${idx + 1}. ${img.title || 'Untitled'}`);
      console.log(`   ID: ${img.id}`);
      console.log(`   URL: ${img.imageUrl}`);
      console.log(`   Active: ${img.isActive ? 'Yes' : 'No'}`);
      console.log(`   Order: ${img.order}`);
      console.log('');
    });

    // Check if paths are correct
    const incorrectPaths = sliderImages.filter(img => 
      !img.imageUrl.startsWith('/images/') && 
      !img.imageUrl.startsWith('http://') && 
      !img.imageUrl.startsWith('https://')
    );

    if (incorrectPaths.length > 0) {
      console.log('⚠️  Images with incorrect paths:');
      incorrectPaths.forEach(img => {
        console.log(`   - ${img.imageUrl}`);
      });
      console.log('\n💡 Paths should start with /images/ for local images\n');
    }

    console.log('✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

