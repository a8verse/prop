import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = query.trim();

    // Get user session and IP address
    const session = await getServerSession(authOptions);
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";

    // Log search activity if user is logged in
    if (session?.user?.id) {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: "search",
          metadata: {
            searchQuery: searchTerm,
            ipAddress,
            resultCount: 0, // Will be updated after search
          },
        },
      }).catch((err) => console.error("Error logging search activity:", err));
    }

    // Search across properties, builders, and locations
    const properties = await prisma.property.findMany({
      where: {
        isHidden: false, // Only show non-hidden properties
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { builder: { name: { contains: searchTerm } } },
          { location: { name: { contains: searchTerm } } },
        ],
      },
      include: {
        builder: {
          select: {
            name: true,
            id: true,
          },
        },
        location: {
          select: {
            name: true,
            id: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 8, // Limit results for dropdown
      orderBy: { updatedAt: "desc" },
    });

    // Update search activity with result count if user is logged in
    if (session?.user?.id) {
      // Find the most recent search activity for this user and update it
      const recentActivity = await prisma.userActivity.findFirst({
        where: {
          userId: session.user.id,
          action: "search",
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentActivity && (recentActivity.metadata as any)?.searchQuery === searchTerm) {
        await prisma.userActivity.update({
          where: { id: recentActivity.id },
          data: {
            metadata: {
              ...(recentActivity.metadata as any),
              resultCount: properties.length,
            },
          },
        }).catch((err) => console.error("Error updating search activity:", err));
      }
    }

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

