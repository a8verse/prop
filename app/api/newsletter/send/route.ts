import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, content, filters } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }

    // Get subscribers based on filters
    const where: any = {
      role: { not: "ADMIN" },
    };

    if (filters.userType) {
      where.role = filters.userType;
    }

    if (filters.city) {
      where.city = filters.city;
    }

    if (filters.state) {
      where.state = filters.state;
    }

    let recipients: Array<{ email: string; name: string | null }> = [];

    // For Channel Partners, get from ChannelPartner model
    if (filters.userType === "CHANNEL_PARTNER") {
      const cps = await prisma.channelPartner.findMany({
        where: {
          status: "APPROVED",
          ...(filters.city && { city: filters.city }),
          ...(filters.state && { state: filters.state }),
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      recipients = cps.map((cp) => ({
        email: cp.user.email,
        name: cp.user.name,
      }));
    } else {
      // For Visitors or All Users
      const users = await prisma.user.findMany({
        where,
        select: {
          email: true,
          name: true,
        },
      });

      recipients = users;
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    // Get SMTP settings
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPassword = process.env.SMTP_PASSWORD || "";

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Send emails in batches
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: smtpUser,
          to: recipient.email,
          subject,
          html: content.replace(/\{\{name\}\}/g, recipient.name || "User"),
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        failedCount++;
      }
    }

    return NextResponse.json({
      message: `Emails sent: ${sentCount} successful, ${failedCount} failed`,
      sentCount,
      failedCount,
      total: recipients.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

