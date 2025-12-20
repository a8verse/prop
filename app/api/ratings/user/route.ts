import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json(ratings);
  } catch (error: any) {
    console.error("Error fetching user ratings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

