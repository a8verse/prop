import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import PriceTrendsChart from "@/components/charts/PriceTrendsChart";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function PriceTrendsPage() {
  const session = await getServerSession(authOptions);
  
  // Only allow authenticated CPs and Visitors
  if (!session || (session.user.role !== "CHANNEL_PARTNER" && session.user.role !== "VISITOR")) {
    redirect("/login?type=visitor");
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  const properties = await prisma.property.findMany({
    include: {
      builder: true,
      priceHistory: {
        orderBy: { createdAt: "asc" },
      },
    },
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

        <main className="pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Price Trends</h1>
              <p className="text-white/60">View historical price data and trends</p>
            </div>

            <PriceTrendsChart properties={properties} categories={categories} />
          </div>
        </main>

        <Footer images={sliderImages} />
      </div>
    </div>
  );
}

