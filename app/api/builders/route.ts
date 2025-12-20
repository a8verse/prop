import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const builders = await prisma.builder.findMany({
      include: {
        _count: {
          select: {
            properties: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(builders);
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

    const body = await request.json();
    const { name, logo, description, website, contactInfo } = body;

    const builder = await prisma.builder.create({
      data: {
        name,
        logo,
        description,
        website,
        contactInfo: contactInfo || null,
      },
    });

    return NextResponse.json(builder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

