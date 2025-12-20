const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Creating test data...\n');

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
        showInMenu: true,
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
        showInMenu: true,
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
        showInMenu: true,
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
        showInMenu: true,
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
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
    }),
    prisma.location.upsert({
      where: { name: 'Delhi' },
      update: {},
      create: {
        name: 'Delhi',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
      },
    }),
    prisma.location.upsert({
      where: { name: 'Bangalore' },
      update: {},
      create: {
        name: 'Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
      },
    }),
    prisma.location.upsert({
      where: { name: 'Mohali' },
      update: {},
      create: {
        name: 'Mohali',
        city: 'Mohali',
        state: 'Punjab',
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
        description: 'DLF Limited - Leading real estate developer',
        website: 'https://www.dlf.in',
        contactInfo: {
          phone: '+91-11-23456789',
          email: 'info@dlf.com',
          address: 'DLF Centre, New Delhi'
        },
      },
    }),
    prisma.builder.upsert({
      where: { name: 'Godrej Properties' },
      update: {},
      create: {
        name: 'Godrej Properties',
        description: 'Godrej Properties Limited',
        website: 'https://www.godrejproperties.com',
        contactInfo: {
          phone: '+91-22-23456789',
          email: 'info@godrejproperties.com',
          address: 'Mumbai, Maharashtra'
        },
      },
    }),
    prisma.builder.upsert({
      where: { name: 'Lodha Group' },
      update: {},
      create: {
        name: 'Lodha Group',
        description: 'Lodha Group - Premium real estate',
        website: 'https://www.lodhagroup.com',
        contactInfo: {
          phone: '+91-22-34567890',
          email: 'info@lodhagroup.com',
          address: 'Mumbai, Maharashtra'
        },
      },
    }),
  ]);

  console.log('✅ Builders created');

  // Create properties
  const residential = categories.find(c => c.slug === 'residential');
  const commercial = categories.find(c => c.slug === 'commercial');
  const mumbai = locations.find(l => l.name === 'Mumbai');
  const delhi = locations.find(l => l.name === 'Delhi');
  const mohali = locations.find(l => l.name === 'Mohali');
  const dlf = builders.find(b => b.name === 'DLF');
  const godrej = builders.find(b => b.name === 'Godrej Properties');
  const lodha = builders.find(b => b.name === 'Lodha Group');

  const properties = await Promise.all([
    prisma.property.upsert({
      where: { slug: 'dlf-magnolias' },
      update: {},
      create: {
        name: 'DLF Magnolias',
        slug: 'dlf-magnolias',
        description: 'Luxury residential apartments in Gurgaon with world-class amenities',
        type: 'Apartment',
        size: '3500 sqft',
        price: 50000000,
        categoryId: residential.id,
        locationId: delhi.id,
        builderId: dlf.id,
        isFeatured: true,
        images: ['/images/properties/dlf-magnolias.jpg'],
        priceHistory: {
          create: {
            price: 50000000,
            change: 5.2,
            isIncrease: true,
          },
        },
      },
    }),
    prisma.property.upsert({
      where: { slug: 'godrej-platinum' },
      update: {},
      create: {
        name: 'Godrej Platinum',
        slug: 'godrej-platinum',
        description: 'Premium commercial space in Mumbai with modern facilities',
        type: 'Commercial',
        size: '5000 sqft',
        price: 150000000,
        categoryId: commercial.id,
        locationId: mumbai.id,
        builderId: godrej.id,
        isFeatured: true,
        images: ['/images/properties/godrej-platinum.jpg'],
        priceHistory: {
          create: {
            price: 150000000,
            change: -2.1,
            isIncrease: false,
          },
        },
      },
    }),
    prisma.property.upsert({
      where: { slug: 'dlf-cyber-city' },
      update: {},
      create: {
        name: 'DLF Cyber City',
        slug: 'dlf-cyber-city',
        description: 'Modern office spaces in the heart of Gurgaon',
        type: 'Commercial',
        size: '3000 sqft',
        price: 80000000,
        categoryId: commercial.id,
        locationId: delhi.id,
        builderId: dlf.id,
        isFeatured: true,
        images: ['/images/properties/dlf-cyber-city.jpg'],
        priceHistory: {
          create: {
            price: 80000000,
            change: 3.5,
            isIncrease: true,
          },
        },
      },
    }),
    prisma.property.upsert({
      where: { slug: 'lodha-park' },
      update: {},
      create: {
        name: 'Lodha Park',
        slug: 'lodha-park',
        description: 'Luxury residential project in Mumbai',
        type: 'Apartment',
        size: '2800 sqft',
        price: 120000000,
        categoryId: residential.id,
        locationId: mumbai.id,
        builderId: lodha.id,
        isFeatured: true,
        images: ['/images/properties/lodha-park.jpg'],
        priceHistory: {
          create: {
            price: 120000000,
            change: 4.8,
            isIncrease: true,
          },
        },
      },
    }),
    prisma.property.upsert({
      where: { slug: 'dlf-new-town' },
      update: {},
      create: {
        name: 'DLF New Town',
        slug: 'dlf-new-town',
        description: 'Affordable housing in Mohali',
        type: 'Apartment',
        size: '1800 sqft',
        price: 35000000,
        categoryId: residential.id,
        locationId: mohali.id,
        builderId: dlf.id,
        isFeatured: true,
        images: ['/images/properties/dlf-new-town.jpg'],
        priceHistory: {
          create: {
            price: 35000000,
            change: 2.3,
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

  // Create slider images using existing images if available
  const existingSliderImages = await prisma.sliderImage.findMany();
  if (existingSliderImages.length === 0) {
    // Check if slider images exist in public folder
    const sliderImages = [
      { imageUrl: '/images/slider/1765995366095_New_Project-3.jpg', title: 'Property Showcase 1', order: 1 },
      { imageUrl: '/images/slider/1766038267783_Screenshot_2025-12-17_at_4.28.15_PM.png', title: 'Property Showcase 2', order: 2 },
      { imageUrl: '/images/slider/1766038281425_Screenshot_2025-12-02_at_4.00.57_PM.png', title: 'Property Showcase 3', order: 3 },
    ];

    for (const img of sliderImages) {
      await prisma.sliderImage.upsert({
        where: { id: img.imageUrl }, // This won't work, but we'll create new ones
        update: {},
        create: {
          imageUrl: img.imageUrl,
          title: img.title,
          order: img.order,
          isActive: true,
        },
      });
    }
    console.log('✅ Slider images created');
  } else {
    console.log('✅ Slider images already exist');
  }

  console.log('\n🎉 Test data created successfully!');
  console.log('\nSummary:');
  console.log(`- ${categories.length} categories`);
  console.log(`- ${locations.length} locations`);
  console.log(`- ${builders.length} builders`);
  console.log(`- ${properties.length} properties (${properties.filter(p => p.isFeatured).length} featured)`);
  console.log('\nYou can now:');
  console.log('1. Login as admin at http://localhost:3000/login/admin');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
  console.log('2. View properties on the homepage');
  console.log('3. Test categories in the menu bar');
  console.log('4. Test the slider at the bottom');
  console.log('5. Test project pages with filters');
}

main()
  .catch((e) => {
    console.error('Error creating test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

