const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test data...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'residential' },
      update: {},
      create: {
        name: 'Residential',
        slug: 'residential',
        description: 'Residential properties',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'commercial' },
      update: {},
      create: {
        name: 'Commercial',
        slug: 'commercial',
        description: 'Commercial properties',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'industrial' },
      update: {},
      create: {
        name: 'Industrial',
        slug: 'industrial',
        description: 'Industrial properties',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'lands' },
      update: {},
      create: {
        name: 'Lands',
        slug: 'lands',
        description: 'Land plots',
        order: 4,
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { name: 'Mumbai' },
      update: {},
      create: {
        name: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
    }),
    prisma.location.upsert({
      where: { name: 'Delhi' },
      update: {},
      create: {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
      },
    }),
    prisma.location.upsert({
      where: { name: 'Bangalore' },
      update: {},
      create: {
        name: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
      },
    }),
  ]);

  console.log('✅ Locations created');

  // Create builders
  const builders = await Promise.all([
    prisma.builder.upsert({
      where: { name: 'DLF' },
      update: {},
      create: {
        name: 'DLF',
        description: 'DLF Limited',
        contactEmail: 'info@dlf.com',
        contactPhone: '+91-11-23456789',
      },
    }),
    prisma.builder.upsert({
      where: { name: 'Godrej Properties' },
      update: {},
      create: {
        name: 'Godrej Properties',
        description: 'Godrej Properties Limited',
        contactEmail: 'info@godrejproperties.com',
        contactPhone: '+91-22-23456789',
      },
    }),
    prisma.builder.upsert({
      where: { name: 'Lodha Group' },
      update: {},
      create: {
        name: 'Lodha Group',
        description: 'Lodha Group',
        contactEmail: 'info@lodhagroup.com',
        contactPhone: '+91-22-34567890',
      },
    }),
  ]);

  console.log('✅ Builders created');

  // Create properties
  const residential = categories.find(c => c.slug === 'residential');
  const commercial = categories.find(c => c.slug === 'commercial');
  const mumbai = locations.find(l => l.name === 'Mumbai');
  const delhi = locations.find(l => l.name === 'Delhi');
  const dlf = builders.find(b => b.name === 'DLF');
  const godrej = builders.find(b => b.name === 'Godrej Properties');

  const properties = await Promise.all([
    prisma.property.create({
      data: {
        name: 'DLF Magnolias',
        description: 'Luxury residential apartments in Gurgaon',
        price: 50000000,
        size: 3500,
        categoryId: residential.id,
        locationId: delhi.id,
        builderId: dlf.id,
        isFeatured: true,
        priceHistory: {
          create: {
            price: 50000000,
            change: 5.2,
            isIncrease: true,
          },
        },
      },
    }),
    prisma.property.create({
      data: {
        name: 'Godrej Platinum',
        description: 'Premium commercial space in Mumbai',
        price: 150000000,
        size: 5000,
        categoryId: commercial.id,
        locationId: mumbai.id,
        builderId: godrej.id,
        isFeatured: true,
        priceHistory: {
          create: {
            price: 150000000,
            change: -2.1,
            isIncrease: false,
          },
        },
      },
    }),
    prisma.property.create({
      data: {
        name: 'DLF Cyber City',
        description: 'Modern office spaces',
        price: 80000000,
        size: 3000,
        categoryId: commercial.id,
        locationId: delhi.id,
        builderId: dlf.id,
        isFeatured: false,
        priceHistory: {
          create: {
            price: 80000000,
            change: 3.5,
            isIncrease: true,
          },
        },
      },
    }),
  ]);

  console.log('✅ Properties created');

  // Create site settings
  await Promise.all([
    prisma.siteSettings.upsert({
      where: { key: 'contact_email' },
      update: { value: 'hello@oliofly.com' },
      create: { key: 'contact_email', value: 'hello@oliofly.com' },
    }),
    prisma.siteSettings.upsert({
      where: { key: 'contact_phone' },
      update: { value: '+919999999999' },
      create: { key: 'contact_phone', value: '+919999999999' },
    }),
    prisma.siteSettings.upsert({
      where: { key: 'social_links' },
      update: {
        value: [
          { name: 'Facebook', url: 'https://facebook.com' },
          { name: 'Instagram', url: 'https://instagram.com' },
          { name: 'YouTube', url: 'https://youtube.com' },
        ],
      },
      create: {
        key: 'social_links',
        value: [
          { name: 'Facebook', url: 'https://facebook.com' },
          { name: 'Instagram', url: 'https://instagram.com' },
          { name: 'YouTube', url: 'https://youtube.com' },
        ],
      },
    }),
  ]);

  console.log('✅ Site settings created');

  // Create slider images (placeholder URLs - replace with actual images)
  await Promise.all([
    prisma.sliderImage.create({
      data: {
        imageUrl: '/images/slider1.jpg',
        title: 'Slider Image 1',
        order: 1,
        isActive: true,
      },
    }),
    prisma.sliderImage.create({
      data: {
        imageUrl: '/images/slider2.jpg',
        title: 'Slider Image 2',
        order: 2,
        isActive: true,
      },
    }),
    prisma.sliderImage.create({
      data: {
        imageUrl: '/images/slider3.jpg',
        title: 'Slider Image 3',
        order: 3,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Slider images created');

  console.log('\n🎉 Test data created successfully!');
  console.log('\nYou can now:');
  console.log('1. Login as admin (use the admin credentials you created)');
  console.log('2. View properties on the homepage');
  console.log('3. Test the slider (add actual images to /public/images/)');
  console.log('4. Test project pages with filters');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

