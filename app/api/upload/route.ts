import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import sharp from "sharp";

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

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "images", folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;
    const filepath = join(uploadDir, filename);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize image if it's an image file
    let finalBuffer = buffer;
    if (file.type.startsWith("image/")) {
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
          finalBuffer = await processedImage.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
        } else if (file.type === "image/png") {
          finalBuffer = await processedImage.png({ quality: 85, compressionLevel: 9 }).toBuffer();
        } else if (file.type === "image/webp") {
          finalBuffer = await processedImage.webp({ quality: 85 }).toBuffer();
        } else {
          finalBuffer = await processedImage.toBuffer();
        }
      } catch (optimizeError) {
        console.error("Image optimization error (using original):", optimizeError);
        // Use original buffer if optimization fails
        finalBuffer = buffer;
      }
    }

    // Save optimized file
    await writeFile(filepath, finalBuffer);

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

