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
    const userType = searchParams.get("userType");
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    const where: any = {
      role: { not: "ADMIN" },
    };

    if (userType) {
      where.role = userType;
    }

    if (city) {
      where.city = city;
    }

    if (state) {
      where.state = state;
    }

    // For Channel Partners, get city/state from ChannelPartner model
    if (userType === "CHANNEL_PARTNER") {
      const cps = await prisma.channelPartner.findMany({
        where: {
          status: "APPROVED",
          ...(city && { city }),
          ...(state && { state }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });

      return NextResponse.json(
        cps.map((cp) => ({
          id: cp.user.id,
          email: cp.user.email,
          name: cp.user.name,
          role: cp.user.role,
          city: cp.city,
          state: cp.state,
          subscribedAt: cp.user.createdAt,
        }))
      );
    }

    // For Visitors or All Users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        city: true,
        state: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        city: user.city,
        state: user.state,
        subscribedAt: user.createdAt,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

