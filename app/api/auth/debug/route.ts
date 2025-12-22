import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    hasSession: !!session,
    session: session ? {
      email: session.user?.email,
      name: session.user?.name,
      role: (session.user as any)?.role,
      id: (session.user as any)?.id,
    } : null,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}

