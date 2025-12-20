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

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    const where: any = {};
    if (roleFilter) {
      where.role = roleFilter;
    } else {
      where.role = { not: "ADMIN" };
    }

    const visitors = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            ratings: true,
            pageViews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Manually count tracked properties
    const visitorsWithCounts = await Promise.all(
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

    // Convert to CSV format
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Ratings",
      "Tracked Properties",
      "Page Views",
      "Profile Created",
      "Last Login",
    ];

    const rows = visitorsWithCounts.map((v) => [
      v.id,
      v.name || "",
      v.email,
      v.role,
      v._count.ratings.toString(),
      v._count.trackedProperties.toString(),
      v._count.pageViews.toString(),
      v.createdAt.toISOString(),
      v.lastLogin ? v.lastLogin.toISOString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="visitors-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

