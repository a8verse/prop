#!/usr/bin/env node

/**
 * Populate Railway Database with Sample Data
 * This script connects to Railway and populates it with essential data
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 Populate Railway Database\n');

  // Get Railway connection string
  const railwayUrl = process.env.DATABASE_URL || await question('Railway connection string (or set DATABASE_URL env var): ');
  
  if (!railwayUrl || !railwayUrl.includes('mysql://')) {
    console.error('❌ Invalid connection string');
    process.exit(1);
  }

  // Create Prisma client with Railway connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: railwayUrl,
      },
    },
  });

  try {
    console.log('Connecting to Railway...');
    await prisma.$connect();
    console.log('✅ Connected!\n');

    // 1. Create Category
    console.log('📁 Creating categories...');
    const residential = await prisma.category.upsert({
      where: { id: 'cat-residential' },
      update: {},
      create: {
        id: 'cat-residential',
        name: 'Residential',
        slug: 'residential',
        description: 'Residential properties',
        order: 1,
        showInMenu: true,
      },
    });
    console.log(`✅ Created category: ${residential.name}`);

    // 2. Create Builder
    console.log('\n🏗️  Creating builder...');
    const builder = await prisma.builder.upsert({
      where: { id: 'builder-1' },
      update: {},
      create: {
        id: 'builder-1',
        name: 'Sample Builder',
        description: 'A sample builder company',
      },
    });
    console.log(`✅ Created builder: ${builder.name}`);

    // 3. Create Location
    console.log('\n📍 Creating location...');
    const location = await prisma.location.upsert({
      where: { id: 'loc-1' },
      update: {},
      create: {
        id: 'loc-1',
        name: 'Sample City',
        city: 'Sample City',
        state: 'Sample State',
        country: 'India',
      },
    });
    console.log(`✅ Created location: ${location.name}`);

    // 4. Create Properties
    console.log('\n🏠 Creating featured properties...');
    const properties = [
      {
        id: 'prop-1',
        name: 'Luxury Apartment Complex',
        slug: 'luxury-apartment-complex',
        description: 'Beautiful luxury apartments in prime location',
        price: 5000000,
        type: 'APARTMENT',
        categoryId: 'cat-residential',
        builderId: 'builder-1',
        locationId: 'loc-1',
        images: ['/images/property1.jpg'],
        isFeatured: true,
        isHidden: false,
        seller: 'Sample Seller',
      },
      {
        id: 'prop-2',
        name: 'Modern Villa',
        slug: 'modern-villa',
        description: 'Spacious modern villa with garden',
        price: 12000000,
        type: 'VILLA',
        categoryId: 'cat-residential',
        builderId: 'builder-1',
        locationId: 'loc-1',
        images: ['/images/property2.jpg'],
        isFeatured: true,
        isHidden: false,
        seller: 'Sample Seller',
      },
      {
        id: 'prop-3',
        name: 'Premium Condo',
        slug: 'premium-condo',
        description: 'Premium condominium with amenities',
        price: 8000000,
        type: 'CONDO',
        categoryId: 'cat-residential',
        builderId: 'builder-1',
        locationId: 'loc-1',
        images: ['/images/property3.jpg'],
        isFeatured: true,
        isHidden: false,
        seller: 'Sample Seller',
      },
    ];

    for (const prop of properties) {
      await prisma.property.upsert({
        where: { id: prop.id },
        update: {},
        create: prop,
      });
      console.log(`✅ Created property: ${prop.name}`);
    }

    // 5. Create Slider Images (using actual images from public folder)
    console.log('\n🖼️  Creating slider images...');
    const sliderImages = [
      {
        id: 'slider-1',
        imageUrl: '/images/slider/1765995366095_New_Project-3.jpg',
        title: 'Luxury Living',
        order: 1,
        isActive: true,
      },
      {
        id: 'slider-2',
        imageUrl: '/images/slider/1766038267783_Screenshot_2025-12-17_at_4.28.15_PM.png',
        title: 'Modern Design',
        order: 2,
        isActive: true,
      },
      {
        id: 'slider-3',
        imageUrl: '/images/slider/1766038281425_Screenshot_2025-12-02_at_4.00.57_PM.png',
        title: 'Prime Location',
        order: 3,
        isActive: true,
      },
    ];

    for (const img of sliderImages) {
      await prisma.sliderImage.upsert({
        where: { id: img.id },
        update: {},
        create: img,
      });
      console.log(`✅ Created slider image: ${img.title}`);
    }

    // 6. Create Site Settings
    console.log('\n⚙️  Creating site settings...');
    await prisma.siteSettings.upsert({
      where: { key: 'contact_email' },
      update: {},
      create: {
        key: 'contact_email',
        value: 'hello@oliofly.com',
      },
    });

    await prisma.siteSettings.upsert({
      where: { key: 'contact_phone' },
      update: {},
      create: {
        key: 'contact_phone',
        value: '+919999999999',
      },
    });

    await prisma.siteSettings.upsert({
      where: { key: 'social_links' },
      update: {},
      create: {
        key: 'social_links',
        value: [
          { name: 'Facebook', url: 'https://facebook.com' },
          { name: 'Instagram', url: 'https://instagram.com' },
        ],
      },
    });

    console.log('✅ Created site settings');

    // 7. Verify counts
    console.log('\n📊 Verifying data...');
    const categoryCount = await prisma.category.count();
    const propertyCount = await prisma.property.count();
    const featuredCount = await prisma.property.count({ where: { isFeatured: true } });
    const sliderImageCount = await prisma.sliderImage.count();
    const activeSliderCount = await prisma.sliderImage.count({ where: { isActive: true } });
    const siteSettingsCount = await prisma.siteSettings.count();

    console.log('\n✅ Data Summary:');
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Properties: ${propertyCount}`);
    console.log(`   Featured Properties: ${featuredCount}`);
    console.log(`   Slider Images: ${sliderImageCount}`);
    console.log(`   Active Slider Images: ${activeSliderCount}`);
    console.log(`   Site Settings: ${siteSettingsCount}`);

    // 8. Create Admin User
    console.log('\n👤 Creating admin user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('India@123', 10);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@oliofly.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        name: 'Admin User',
      },
      create: {
        email: 'admin@oliofly.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    console.log('✅ Created admin user: admin@oliofly.com');

    console.log('\n🎉 Database populated successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Visit https://oliofly.com/api/test-db to verify');
    console.log('2. Visit https://oliofly.com to see your website with data');
    console.log('3. Menu, featured properties, and slider should now be visible!');
    console.log('4. Admin login: https://oliofly.com/login?type=admin');
    console.log('   Email: admin@oliofly.com');
    console.log('   Password: India@123\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();

