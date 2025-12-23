import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Import sharp with error handling
let sharp: any;
try {
  sharp = require("sharp");
} catch (e) {
  // Sharp not installed - will skip optimization
  sharp = null;
}

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === "1" || !existsSync(join(process.cwd(), "public"));

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;
    const folder = formData.get("folder") as string || (type === "logo" ? "logo" : type === "background" ? "background" : "slider");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Optimize image if it's an image file and sharp is available
    if (file.type.startsWith("image/") && sharp) {
      try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Resize if too large (max 1920px)
        let processedImage = image;
        if (metadata.width && metadata.width > 1920) {
          processedImage = image.resize(1920, null, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }

        // Optimize based on format
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          buffer = await processedImage.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
        } else if (file.type === "image/png") {
          buffer = await processedImage.png({ quality: 85, compressionLevel: 9 }).toBuffer();
        } else if (file.type === "image/webp") {
          buffer = await processedImage.webp({ quality: 85 }).toBuffer();
        } else {
          buffer = await processedImage.toBuffer();
        }
      } catch (optimizeError) {
        console.error("Image optimization error (using original):", optimizeError);
        // Use original buffer if optimization fails
      }
    }

    // For logo and background images, store as base64 in database (works in serverless)
    if (type === "logo" || type === "background") {
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      // Store in database
      const settingKey = type === "logo" ? "logo" : "home_background_image";
      await prisma.siteSettings.upsert({
        where: { key: settingKey },
        update: { value: base64Image },
        create: { key: settingKey, value: base64Image },
      });

      return NextResponse.json({ 
        success: true, 
        url: base64Image,
        path: base64Image,
        filename: file.name,
        storedInDatabase: true
      });
    }

    // For other images (slider, avatars), try to save to filesystem if not serverless
    if (isServerless) {
      // In serverless, convert to base64 and return data URL
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
      return NextResponse.json({ 
        success: true, 
        url: base64Image,
        path: base64Image,
        filename: file.name,
        storedAsBase64: true
      });
    }

    // Local development: save to filesystem
    const uploadDir = join(process.cwd(), "public", "images", folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);

    // Save optimized file
    await writeFile(filepath, buffer);

    // Return the public URL path
    const publicPath = `/images/${folder}/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: publicPath,
      path: publicPath,
      filename: filename 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}

