import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        builder: true,
        location: true,
        category: true,
        subCategory: true,
        priceHistory: {
          orderBy: { createdAt: "asc" },
        },
        ratings: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Get user session and IP address
    const session = await getServerSession(authOptions);
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Log page view
    await prisma.pageView.create({
      data: {
        propertyId: params.id,
        userId: session?.user?.id || null,
        ipAddress,
        userAgent,
      },
    }).catch((err) => console.error("Error logging page view:", err));

    // Log activity if user is logged in
    if (session?.user?.id) {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: "view_property",
          metadata: {
            propertyId: params.id,
            propertyName: property.name,
            ipAddress,
          },
        },
      }).catch((err) => console.error("Error logging activity:", err));
    }

    return NextResponse.json(property);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { price, ...updateData } = body;

    // Get property name for activity log
    const currentProperty = await prisma.property.findUnique({
      where: { id: params.id },
      select: { name: true, price: true },
    });

    // If price is updated, create price history entry
    if (price && currentProperty) {
      const change = ((price - currentProperty.price) / currentProperty.price) * 100;
      const isIncrease = price > currentProperty.price;

      await prisma.priceHistory.create({
        data: {
          propertyId: params.id,
          price: parseFloat(price),
          change: Math.abs(change),
          isIncrease,
        },
      });

      // Log activity for price update
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: "update_price",
          metadata: {
            propertyId: params.id,
            propertyName: currentProperty.name,
            oldPrice: currentProperty.price,
            newPrice: parseFloat(price),
            change: Math.abs(change),
            isIncrease,
          },
        },
      }).catch((err) => console.error("Error logging activity:", err));
    }

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(price && { price: parseFloat(price) }),
      },
    });

    // Log activity for property update (if not a price update)
    if (!price && currentProperty) {
      await prisma.userActivity.create({
        data: {
          userId: session.user.id,
          action: "update_property",
          metadata: {
            propertyId: params.id,
            propertyName: currentProperty.name,
          },
        },
      }).catch((err) => console.error("Error logging activity:", err));
    }

    return NextResponse.json(property);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.property.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Property deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

