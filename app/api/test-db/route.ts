import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    databaseUrl: {
      exists: !!process.env.DATABASE_URL,
      masked: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")
        : "Not set",
      hasSpecialChars: process.env.DATABASE_URL?.includes("@") && 
                      process.env.DATABASE_URL?.split("@").length > 2,
    },
    connection: {
      status: "unknown",
      error: null,
    },
    data: {
      categories: { count: 0, error: null },
      properties: { count: 0, featured: 0, error: null },
      sliderImages: { count: 0, active: 0, error: null },
      siteSettings: { count: 0, error: null },
    },
  };

  // Test database connection
  try {
    await prisma.$connect();
    diagnostics.connection.status = "connected";
  } catch (error: any) {
    diagnostics.connection.status = "failed";
    diagnostics.connection.error = {
      message: error.message,
      code: error.code,
      name: error.name,
    };
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // Test categories query
  try {
    const categories = await prisma.category.findMany({
      where: { showInMenu: { not: false } },
    });
    diagnostics.data.categories.count = categories.length;
  } catch (error: any) {
    diagnostics.data.categories.error = error.message;
  }

  // Test properties query
  try {
    const allProperties = await prisma.property.findMany({
      where: { isHidden: false },
    });
    const featuredProperties = await prisma.property.findMany({
      where: { isFeatured: true, isHidden: false },
    });
    diagnostics.data.properties.count = allProperties.length;
    diagnostics.data.properties.featured = featuredProperties.length;
  } catch (error: any) {
    diagnostics.data.properties.error = error.message;
  }

  // Test slider images query
  try {
    const allSliderImages = await prisma.sliderImage.findMany();
    const activeSliderImages = await prisma.sliderImage.findMany({
      where: { isActive: true },
    });
    diagnostics.data.sliderImages.count = allSliderImages.length;
    diagnostics.data.sliderImages.active = activeSliderImages.length;
  } catch (error: any) {
    diagnostics.data.sliderImages.error = error.message;
  }

  // Test site settings query
  try {
    const settings = await prisma.siteSettings.findMany();
    diagnostics.data.siteSettings.count = settings.length;
  } catch (error: any) {
    diagnostics.data.siteSettings.error = error.message;
  }

  // Disconnect
  try {
    await prisma.$disconnect();
  } catch (error) {
    // Ignore disconnect errors
  }

  return NextResponse.json(diagnostics, { status: 200 });
}

