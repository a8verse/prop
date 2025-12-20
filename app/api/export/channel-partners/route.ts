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

    const partners = await prisma.channelPartner.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
            lastLogin: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV format
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company Name",
      "City",
      "State",
      "RERA Number",
      "Status",
      "Profile Created",
      "Last Login",
      "Registration Date",
    ];

    const rows = partners.map((p) => [
      p.id,
      p.firstName,
      p.lastName,
      p.user.email,
      p.phone,
      p.companyName || "",
      p.city,
      p.state,
      p.reraNumber || "",
      p.status,
      p.user.createdAt.toISOString(),
      p.user.lastLogin ? p.user.lastLogin.toISOString() : "",
      p.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="channel-partners-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

