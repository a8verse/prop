#!/usr/bin/env node

/**
 * Quick script to verify Railway database has data
 */

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to Railway database\n');
    
    const categories = await prisma.category.count();
    const properties = await prisma.property.count();
    const users = await prisma.user.count();
    const sliderImages = await prisma.sliderImage.count();
    const siteSettings = await prisma.siteSettings.count();
    const builders = await prisma.builder.count();
    const locations = await prisma.location.count();
    
    console.log('📊 Data Summary:');
    console.log(`   Categories: ${categories}`);
    console.log(`   Properties: ${properties}`);
    console.log(`   Featured Properties: ${await prisma.property.count({ where: { isFeatured: true } })}`);
    console.log(`   Users: ${users}`);
    console.log(`   Slider Images: ${sliderImages}`);
    console.log(`   Active Slider Images: ${await prisma.sliderImage.count({ where: { isActive: true } })}`);
    console.log(`   Site Settings: ${siteSettings}`);
    console.log(`   Builders: ${builders}`);
    console.log(`   Locations: ${locations}\n`);
    
    if (categories > 0 && properties > 0) {
      console.log('✅ Data imported successfully!');
      console.log('\n🎉 Your website should now show:');
      console.log('   - Menu categories');
      console.log('   - Featured properties');
      console.log('   - Slider images');
    } else {
      console.log('⚠️  Database is empty. Data may not have imported correctly.');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

