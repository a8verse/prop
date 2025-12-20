import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all unique property types from the database
    const properties = await prisma.property.findMany({
      select: {
        type: true,
      },
      distinct: ['type'],
      where: {
        isHidden: false,
      },
    });

    const types = properties
      .map((p: { type: string }) => p.type)
      .filter(Boolean)
      .sort();

    return NextResponse.json({ types });
  } catch (error: any) {
    console.error("Error fetching property types:", error);
    return NextResponse.json({ types: [] });
  }
}

