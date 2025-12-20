import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const builder = await prisma.builder.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            properties: true,
          },
        },
        properties: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!builder) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    return NextResponse.json(builder);
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
    const { name, logo, description, website, contactInfo, isSuspended } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (website !== undefined) updateData.website = website;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo || null;
    if (isSuspended !== undefined) updateData.isSuspended = Boolean(isSuspended);

    const builder = await prisma.builder.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(builder);
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

    // Check if builder has properties
    const builder = await prisma.builder.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            properties: true,
          },
        },
      },
    });

    if (!builder) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    if (builder._count.properties > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete builder with ${builder._count.properties} properties. Please delete or reassign properties first.`,
        },
        { status: 400 }
      );
    }

    await prisma.builder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

