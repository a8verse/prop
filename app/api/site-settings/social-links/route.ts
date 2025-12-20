import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "social_links" },
    });
    
    if (setting && setting.value) {
      return NextResponse.json(setting.value);
    }
    
    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newLink = await request.json();
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "social_links" },
    });

    const currentLinks = (setting?.value as Array<{ name: string; url: string }>) || [];
    const updatedLinks = [...currentLinks, newLink];

    await prisma.siteSettings.upsert({
      where: { key: "social_links" },
      update: { value: updatedLinks },
      create: { key: "social_links", value: updatedLinks },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const nameToDelete = searchParams.get("name");

    if (!nameToDelete) {
      return NextResponse.json({ error: "Name parameter required" }, { status: 400 });
    }

    const setting = await prisma.siteSettings.findUnique({
      where: { key: "social_links" },
    });

    const currentLinks = (setting?.value as Array<{ name: string; url: string }>) || [];
    const updatedLinks = currentLinks.filter((link) => link.name !== nameToDelete);

    await prisma.siteSettings.upsert({
      where: { key: "social_links" },
      update: { value: updatedLinks },
      create: { key: "social_links", value: updatedLinks },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

