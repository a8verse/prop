import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, rating, comment } = body;

    if (!propertyId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating data" },
        { status: 400 }
      );
    }

    // Get property name for activity log
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { name: true },
    });

    // Upsert rating (update if exists, create if not)
    const ratingRecord = await prisma.rating.upsert({
      where: {
        propertyId_userId: {
          propertyId,
          userId: session.user.id,
        },
      },
      update: {
        rating,
        comment: comment || null,
      },
      create: {
        propertyId,
        userId: session.user.id,
        rating,
        comment: comment || null,
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: "submit_rating",
        metadata: {
          propertyId,
          propertyName: property?.name || "Unknown",
          rating,
          hasComment: !!comment,
        },
      },
    }).catch((err) => console.error("Error logging activity:", err)); // Don't fail if activity logging fails

    return NextResponse.json(ratingRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId required" }, { status: 400 });
    }

    const ratings = await prisma.rating.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    return NextResponse.json({
      ratings,
      average: avgRating,
      count: ratings.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

