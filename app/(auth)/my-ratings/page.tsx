import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import MyRatingsList from "@/components/rating/MyRatingsList";

export const dynamic = "force-dynamic";

export default async function MyRatingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/");
  }

  const ratings = await prisma.rating.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      property: {
        include: {
          builder: true,
          location: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
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

  const categories = await prisma.category.findMany({
    where: { showInMenu: true },
    orderBy: { order: "asc" },
  });

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
        <Header email={email || "hello@oliofly.com"} phone={phone || "+919999999999"} />
        <Navigation categories={categories} socialLinks={socialLinks} />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-24">
          <h1 className="text-4xl font-bold text-white mb-8">My Ratings</h1>
          <MyRatingsList ratings={ratings} />
        </div>
        <Footer images={sliderImages} />
      </div>
    </div>
  );
}

