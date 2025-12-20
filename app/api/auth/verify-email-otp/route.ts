import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, otp } = body;

    if (!userId || !otp) {
      return NextResponse.json(
        { error: "User ID and OTP are required" },
        { status: 400 }
      );
    }

    // Find the user and their channel partner
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { channelPartner: true },
    });

    if (!user || !user.channelPartner) {
      return NextResponse.json(
        { error: "User or channel partner not found" },
        { status: 404 }
      );
    }

    const cp = user.channelPartner;

    // Check if OTP matches
    if (cp.emailOTP !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (!cp.emailOTPExpiry || new Date() > cp.emailOTPExpiry) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify email and clear OTP
    await prisma.channelPartner.update({
      where: { id: cp.id },
      data: {
        emailVerified: true,
        emailOTP: null,
        emailOTPExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: error.message || "OTP verification failed" },
      { status: 500 }
    );
  }
}

