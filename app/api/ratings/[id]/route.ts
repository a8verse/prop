import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid rating data" },
        { status: 400 }
      );
    }

    // Check if rating belongs to user
    const existingRating = await prisma.rating.findUnique({
      where: { id: params.id },
    });

    if (!existingRating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    if (existingRating.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedRating = await prisma.rating.update({
      where: { id: params.id },
      data: {
        rating,
        comment: comment || null,
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

    return NextResponse.json(updatedRating);
  } catch (error: any) {
    console.error("Error updating rating:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if rating belongs to user
    const existingRating = await prisma.rating.findUnique({
      where: { id: params.id },
    });

    if (!existingRating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    if (existingRating.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.rating.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting rating:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

