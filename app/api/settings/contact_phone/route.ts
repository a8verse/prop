import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "contact_phone" },
    });
    
    if (setting && setting.value) {
      return NextResponse.json({ value: setting.value });
    }
    
    return NextResponse.json({ value: "+919999999999" });
  } catch (error: any) {
    return NextResponse.json({ value: "+919999999999" });
  }
}

