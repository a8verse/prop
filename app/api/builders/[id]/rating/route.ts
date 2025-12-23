import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { rating } = await request.json();

    // Validate rating
    if (rating === null || rating === undefined) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // Update builder rating
    const builder = await prisma.builder.update({
      where: { id: params.id },
      data: { rating },
    });

    return NextResponse.json(builder);
  } catch (error: any) {
    console.error("Error updating builder rating:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update builder rating" },
      { status: 500 }
    );
  }
}

