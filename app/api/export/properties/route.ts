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

    const properties = await prisma.property.findMany({
      include: {
        builder: true,
        location: true,
        category: true,
        _count: {
          select: {
            pageViews: true,
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV format
    const headers = [
      "ID",
      "Name",
      "Type",
      "Size",
      "Price",
      "Builder",
      "Location",
      "Category",
      "Seller",
      "Featured",
      "Hidden",
      "Views",
      "Ratings",
      "Date Listed",
      "Last Updated",
    ];

    const rows = properties.map((p) => [
      p.id,
      p.name,
      p.type,
      p.size || "",
      p.price.toString(),
      p.builder.name,
      p.location.name,
      p.category.name,
      p.seller || "",
      p.isFeatured ? "Yes" : "No",
      p.isHidden ? "Yes" : "No",
      p._count.pageViews.toString(),
      p._count.ratings.toString(),
      p.createdAt.toISOString(),
      p.updatedAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="properties-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

