import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "social_links" },
    });
    
    if (setting && setting.value) {
      return NextResponse.json({ value: setting.value });
    }
    
    return NextResponse.json({ value: [] });
  } catch (error: any) {
    return NextResponse.json({ value: [] });
  }
}

