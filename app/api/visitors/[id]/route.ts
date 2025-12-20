import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const visitor = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            ratings: true,
            trackedProperties: true,
            pageViews: true,
          },
        },
        ratings: {
          include: {
            property: {
              include: {
                builder: true,
                location: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        trackedProperties: {
          include: {
            property: {
              include: {
                builder: true,
                location: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!visitor || visitor.role !== "VISITOR") {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    return NextResponse.json(visitor);
  } catch (error: any) {
    console.error("Error fetching visitor:", error);
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

    const visitor = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!visitor || visitor.role !== "VISITOR") {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting visitor:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

