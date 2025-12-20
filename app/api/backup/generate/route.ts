import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Export all database data
    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        users: await prisma.user.findMany(),
        categories: await prisma.category.findMany(),
        subCategories: await prisma.subCategory.findMany(),
        builders: await prisma.builder.findMany(),
        channelPartners: await prisma.channelPartner.findMany(),
        locations: await prisma.location.findMany(),
        properties: await prisma.property.findMany(),
        priceHistory: await prisma.priceHistory.findMany(),
        ratings: await prisma.rating.findMany(),
        sliderImages: await prisma.sliderImage.findMany(),
        pageViews: await prisma.pageView.findMany(),
        userActivities: await prisma.userActivity.findMany(),
        trackedProperties: await prisma.trackedProperty.findMany(),
        siteSettings: await prisma.siteSettings.findMany(),
        emailTemplates: await prisma.emailTemplate.findMany(),
        newsletterSubscribers: await prisma.newsletterSubscriber.findMany(),
        newsletterTemplates: await prisma.newsletterTemplate.findMany(),
        newsletterCampaigns: await prisma.newsletterCampaign.findMany(),
        notifications: await prisma.notification.findMany(),
      },
      config: {
        // Note: Sensitive data should be redacted
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        // Redact sensitive info
        databaseUrl: process.env.DATABASE_URL ? "[REDACTED]" : undefined,
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? "[REDACTED]" : undefined,
        smtpUser: process.env.SMTP_USER ? "[REDACTED]" : undefined,
        smtpPassword: process.env.SMTP_PASSWORD ? "[REDACTED]" : undefined,
      },
      files: {
        note: "Please manually backup files from public/images directory",
        imagePaths: [
          "public/images/background.jpg",
          "public/images/slider/",
          "public/logo.png",
        ],
      },
    };

    const jsonContent = JSON.stringify(backupData, null, 2);
    const buffer = Buffer.from(jsonContent, "utf-8");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Backup generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate backup" },
      { status: 500 }
    );
  }
}

