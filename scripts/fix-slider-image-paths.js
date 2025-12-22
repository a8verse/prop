#!/usr/bin/env node

/**
 * Fix slider image paths in Railway database to match actual files
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

    // Actual image files in public/images/slider/
    const actualImages = [
      {
        id: 'slider-1',
        imageUrl: '/images/slider/1765995366095_New_Project-3.jpg',
        title: 'Luxury Living',
        order: 1,
      },
      {
        id: 'slider-2',
        imageUrl: '/images/slider/1766038267783_Screenshot_2025-12-17_at_4.28.15_PM.png',
        title: 'Modern Design',
        order: 2,
      },
      {
        id: 'slider-3',
        imageUrl: '/images/slider/1766038281425_Screenshot_2025-12-02_at_4.00.57_PM.png',
        title: 'Prime Location',
        order: 3,
      },
    ];

    console.log('🖼️  Updating slider image paths...\n');

    for (const img of actualImages) {
      await prisma.sliderImage.update({
        where: { id: img.id },
        data: {
          imageUrl: img.imageUrl,
          title: img.title,
          order: img.order,
          isActive: true,
        },
      });
      console.log(`✅ Updated: ${img.title}`);
      console.log(`   Path: ${img.imageUrl}\n`);
    }

    console.log('🎉 All slider image paths updated!\n');
    console.log('📋 Next steps:');
    console.log('1. Push to GitHub: git push origin main');
    console.log('2. Visit https://oliofly.com');
    console.log('3. Slider images should now be visible!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

