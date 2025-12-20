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

    const visitors = await prisma.user.findMany({
      where: {
        role: "VISITOR",
      },
      include: {
        _count: {
          select: {
            ratings: true,
            pageViews: true,
            // trackedProperties will be available after migration
            // trackedProperties: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Manually count tracked properties for each user
    const visitorsWithTrackedCount = await Promise.all(
      visitors.map(async (visitor) => {
        const trackedCount = await prisma.trackedProperty.count({
          where: { userId: visitor.id },
        });
        return {
          ...visitor,
          _count: {
            ...visitor._count,
            trackedProperties: trackedCount,
          },
        };
      })
    );

    return NextResponse.json(visitorsWithTrackedCount);
  } catch (error: any) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

