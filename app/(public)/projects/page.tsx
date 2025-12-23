import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import PropertyList from "@/components/property/PropertyList";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: {
    category?: string;
    area?: string;
    builder?: string;
    sort?: string;
    search?: string;
  };
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { category, area, builder, sort, search } = searchParams;

  // Build where clause
  const where: any = {};
  if (category) {
    const categoryRecord = await prisma.category.findUnique({
      where: { slug: category },
    });
    if (categoryRecord) {
      where.categoryId = categoryRecord.id;
    }
  }
  if (area) {
    const location = await prisma.location.findUnique({
      where: { name: area },
    });
    if (location) {
      where.locationId = location.id;
    }
  }
  if (builder) {
    const builderRecord = await prisma.builder.findUnique({
      where: { name: builder },
    });
    if (builderRecord) {
      where.builderId = builderRecord.id;
    }
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { builder: { name: { contains: search } } },
      { location: { name: { contains: search } } },
    ];
  }

  // Build orderBy
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "name") orderBy = { name: "asc" };
  if (sort === "date") orderBy = { updatedAt: "desc" };

  const properties = await prisma.property.findMany({
    where,
    include: {
      builder: true,
      location: true,
      category: true,
      priceHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy,
  });

  const allCategories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  const categories = allCategories.filter((cat: any) => cat.showInMenu !== false);

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  const builders = await prisma.builder.findMany({
    orderBy: { name: "asc" },
  });

  // Get site settings
  const emailSetting = await prisma.siteSettings.findUnique({
    where: { key: "contact_email" },
  });
  const phoneSetting = await prisma.siteSettings.findUnique({
    where: { key: "contact_phone" },
  });
  const socialLinksSetting = await prisma.siteSettings.findUnique({
    where: { key: "social_links" },
  });

  const email = emailSetting?.value as string | undefined;
  const phone = phoneSetting?.value as string | undefined;
  const socialLinks = (socialLinksSetting?.value as Array<{ name: string; url: string }>) || [];

  const sliderImages = await prisma.sliderImage.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10">
        <Header email={email} phone={phone} />
        <Navigation categories={categories} socialLinks={socialLinks} />

        <main className="pt-24 sm:pt-28 md:pt-32 pb-8 min-h-screen">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Property Listings</h1>
            <PropertyList
              properties={properties}
              categories={categories}
              locations={locations}
              builders={builders}
            />
          </div>
        </main>

        <Footer images={sliderImages} />
      </div>
    </div>
  );
}

