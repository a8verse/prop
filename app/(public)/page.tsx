import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/home/HomeContent";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteSettings = await prisma.siteSettings.findMany({
      where: {
        key: {
          in: ["site_name", "site_description", "contact_email", "contact_phone"],
        },
      },
    });

    const settingsMap = new Map(siteSettings.map((s) => [s.key, s.value]));
    const siteName = (settingsMap.get("site_name") as string) || "Property Portal";
    const siteDescription = (settingsMap.get("site_description") as string) || "B2B Real Estate Portal for viewing projects, price trends, and inventory";

    return {
      title: siteName,
      description: siteDescription,
      openGraph: {
        title: siteName,
        description: siteDescription,
        type: "website",
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
      },
    };
  } catch (error) {
    return {
      title: "Property Portal - Luxury Real Estate",
      description: "B2B Real Estate Portal for viewing projects, price trends, and inventory",
    };
  }
}

export default async function HomePage() {
  // Fetch categories for navigation (with error handling) - only show in menu
  let categories: Array<{ id: string; name: string; slug: string }> = [];
  try {
    await prisma.$connect();
    const allCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    // Filter by showInMenu if the field exists, otherwise show all
    categories = allCategories.filter((cat: any) => cat.showInMenu !== false);
  } catch (error) {
    console.error("Error fetching categories:", error);
    // Database might not be connected, continue with empty array
  }

  // Fetch builders with ratings (with error handling)
  let builders: any[] = [];
  try {
    // Fetch all builders and sort manually to handle null ratings
    const allBuilders = await prisma.builder.findMany({
      where: { isSuspended: false },
      select: {
        id: true,
        name: true,
        logo: true,
        rating: true,
      },
    });
    
    // Sort by rating (highest first), then by name, with nulls last
    builders = allBuilders
      .sort((a, b) => {
        if (a.rating === null && b.rating === null) return a.name.localeCompare(b.name);
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);
  } catch (error) {
    console.error("Error fetching builders:", error);
    // Continue with empty array
  }

  // Fetch slider images (with error handling)
  let sliderImages: any[] = [];
  try {
    sliderImages = await prisma.sliderImage.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Error fetching slider images:", error);
    // Continue with empty array
  }

  // Get site settings for contact info, logo, and background image (with error handling)
  let email: string | undefined;
  let phone: string | undefined;
  let socialLinks: Array<{ name: string; url: string }> = [];
  let homeBackgroundImage: string | undefined;
  let logo: string | undefined;
  let logoBgColor: string = "#eae5d7";
  let logoBgTransparent: boolean = false;

  try {
    const emailSetting = await prisma.siteSettings.findUnique({
      where: { key: "contact_email" },
    });
    const phoneSetting = await prisma.siteSettings.findUnique({
      where: { key: "contact_phone" },
    });
    const socialLinksSetting = await prisma.siteSettings.findUnique({
      where: { key: "social_links" },
    });
    const backgroundImageSetting = await prisma.siteSettings.findUnique({
      where: { key: "home_background_image" },
    });
    const logoSetting = await prisma.siteSettings.findUnique({
      where: { key: "logo" },
    });

    email = emailSetting?.value as string | undefined;
    phone = phoneSetting?.value as string | undefined;
    socialLinks = (socialLinksSetting?.value as Array<{ name: string; url: string }>) || [];
    
    if (backgroundImageSetting?.value) {
      homeBackgroundImage = typeof backgroundImageSetting.value === 'string' 
        ? backgroundImageSetting.value 
        : (backgroundImageSetting.value as any)?.imageUrl || undefined;
    }

    if (logoSetting?.value) {
      const logoValue = logoSetting.value;
      if (typeof logoValue === 'string') {
        logo = logoValue;
      } else if (typeof logoValue === 'object' && logoValue !== null) {
        const logoObj = logoValue as any;
        logo = logoObj.logo || undefined;
        logoBgColor = logoObj.logoBgColor || "#eae5d7";
        logoBgTransparent = logoObj.logoBgTransparent || false;
      }
    }
  } catch (error) {
    console.error("Error fetching site settings:", error);
    // Use defaults
  }

  return (
    <div className="fixed inset-0 w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={homeBackgroundImage && homeBackgroundImage.startsWith('data:') ? homeBackgroundImage : (homeBackgroundImage || "/images/background.jpg")}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Fallback gradient if image doesn't exist */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-30" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content - Flexbox layout to fit screen */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header - Logo (Left), Search (Center), Email/Phone (Right) - Fully Transparent */}
        <Header 
          email={email || "hello@oliofly.com"} 
          phone={phone || "+919999999999"} 
          logo={logo}
          logoBgColor={logoBgColor}
          logoBgTransparent={logoBgTransparent}
        />
        
        {/* Menu Bar - Categories (Left), Social Icons + Burger Menu (Right) - Blurred Background */}
        <Navigation categories={categories} socialLinks={socialLinks} />

        {/* Main Content - Hero + Featured Properties or Property Listings */}
        <Suspense fallback={<div className="flex-1 flex items-center justify-center" style={{ paddingTop: '100px' }}><div className="text-white/60">Loading...</div></div>}>
          <HomeContent
            categories={categories}
            builders={builders}
          />
        </Suspense>

        {/* Footer - Bottom Slider */}
        <Footer images={sliderImages} />
      </div>

      {/* Structured Data - JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Property Portal",
            "description": "B2B Real Estate Portal for viewing projects, price trends, and inventory",
            "url": typeof window !== "undefined" ? window.location.origin : "",
            "telephone": phone || "+919999999999",
            "email": email || "hello@oliofly.com",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN",
            },
            "sameAs": socialLinks.map((link: { url: string }) => link.url),
          }),
        }}
      />
    </div>
  );
}

