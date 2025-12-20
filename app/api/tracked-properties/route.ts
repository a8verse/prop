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

    const trackedProperties = await prisma.trackedProperty.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        property: {
          include: {
            builder: true,
            location: true,
            category: true,
            priceHistory: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(trackedProperties);
  } catch (error: any) {
    console.error("Error fetching tracked properties:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Check if already tracked
    const existing = await prisma.trackedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Property already tracked" }, { status: 400 });
    }

    const trackedProperty = await prisma.trackedProperty.create({
      data: {
        userId: session.user.id,
        propertyId,
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
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: "track_property",
        metadata: {
          propertyId,
          propertyName: trackedProperty.property.name,
        },
      },
    }).catch((err) => console.error("Error logging activity:", err)); // Don't fail if activity logging fails

    return NextResponse.json(trackedProperty, { status: 201 });
  } catch (error: any) {
    console.error("Error tracking property:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    await prisma.trackedProperty.delete({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error untracking property:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

