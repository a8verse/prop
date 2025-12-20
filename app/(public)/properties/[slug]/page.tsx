import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import PropertyDetailContent from "@/components/property/PropertyDetailContent";

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const property = await prisma.property.findUnique({
      where: { slug: params.slug },
      include: {
        builder: true,
        location: true,
        category: true,
      },
    });

    if (!property) {
      return {
        title: "Property Not Found",
      };
    }

    // Access SEO fields directly - Prisma include should include all base fields
    // Use type assertion as a fallback for TypeScript inference
    const propertyWithSEO = property as any;

    const title = propertyWithSEO.metaTitle || `${property.name} - ${property.builder.name} | Property Portal`;
    const description = propertyWithSEO.metaDescription || property.description || `View ${property.name} by ${property.builder.name} in ${property.location.name}. Price: ₹${property.price.toLocaleString('en-IN')}`;
    const keywords = propertyWithSEO.metaKeywords || `${property.name}, ${property.builder.name}, ${property.location.name}, ${property.type}, real estate, property`;
    
    // Handle images as Json type (MySQL stores arrays as JSON)
    // Prisma returns Json fields as parsed objects, so if it's an array, use it directly
    const imagesArray = Array.isArray(property.images) ? property.images : [];
    const firstImage = imagesArray.length > 0 ? (typeof imagesArray[0] === 'string' ? imagesArray[0] : '') : null;
    const ogImage = propertyWithSEO.ogImage || firstImage || property.logo || "";

    return {
      title,
      description,
      keywords: keywords.split(',').map((k: string) => k.trim()),
      openGraph: {
        title: propertyWithSEO.ogTitle || title,
        description: propertyWithSEO.ogDescription || description,
        images: ogImage ? [{ url: ogImage }] : [],
        type: "website",
        locale: "en_IN",
      },
      twitter: {
        card: (propertyWithSEO.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
        title: propertyWithSEO.ogTitle || title,
        description: propertyWithSEO.ogDescription || description,
        images: ogImage ? [ogImage] : [],
      },
      alternates: {
        canonical: propertyWithSEO.canonicalUrl || undefined,
      },
    };
  } catch (error) {
    return {
      title: "Property Details",
    };
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await prisma.property.findUnique({
    where: { slug: params.slug },
    include: {
      builder: true,
      location: true,
      category: true,
      subCategory: true,
      priceHistory: {
        orderBy: { createdAt: "desc" },
        take: 12,
      },
      ratings: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

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

  const categories = await prisma.category.findMany({
    where: { showInMenu: { not: false } },
    orderBy: { order: "asc" },
  });

  const sliderImages = await prisma.sliderImage.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  // Calculate average rating
  const averageRating = property.ratings.length > 0
    ? property.ratings.reduce((sum, r) => sum + r.rating, 0) / property.ratings.length
    : 0;

  // Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": property.name,
    "description": property.description || `${property.name} by ${property.builder.name}`,
    "image": (() => {
      const imagesArray = Array.isArray(property.images) ? property.images : [];
      return imagesArray.length > 0 ? imagesArray : (property.logo ? [property.logo] : []);
    })(),
    "brand": {
      "@type": "Organization",
      "name": property.builder.name,
    },
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
    },
    "aggregateRating": property.ratings.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1),
      "reviewCount": property.ratings.length,
    } : undefined,
  };

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
        <Header email={email || "hello@oliofly.com"} phone={phone || "+919999999999"} />
        <Navigation categories={categories} socialLinks={socialLinks} />

        <main className="pt-24 pb-8 min-h-screen">
          <PropertyDetailContent property={property} />
        </main>

        <Footer images={sliderImages} />
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </div>
  );
}

