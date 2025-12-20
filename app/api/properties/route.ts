import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const builder = searchParams.get("builder"); // Can be comma-separated
    const location = searchParams.get("location");
    const area = searchParams.get("area"); // Alias for location, can be comma-separated
    const search = searchParams.get("search"); // Text search
    const featured = searchParams.get("featured");
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Check if user is admin - admins can see hidden properties
    const session = await getServerSession(authOptions);
    const isAdmin = session && session.user.role === "ADMIN";

    const where: any = {};
    // Filter out hidden properties for non-admin users
    if (!isAdmin) {
      where.isHidden = false;
    }
    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    // Handle multiple builders (comma-separated)
    if (builder) {
      const builderNames = builder.split(',').map((b: string) => b.trim()).filter(Boolean);
      if (builderNames.length > 0) {
        const builders = await prisma.builder.findMany({
          where: { name: { in: builderNames } },
        });
        if (builders.length > 0) {
          where.builderId = { in: builders.map((b: { id: string }) => b.id) };
        }
      }
    }
    // Handle multiple locations/areas (comma-separated)
    if (location || area) {
      const locationNames = (location || area || "").split(',').map((l: string) => l.trim()).filter(Boolean);
      if (locationNames.length > 0) {
        const locations = await prisma.location.findMany({
          where: { name: { in: locationNames } },
        });
        if (locations.length > 0) {
          where.locationId = { in: locations.map((l: { id: string }) => l.id) };
        }
      }
    }
    if (search) {
      // Text search across name, description, builder name, location name
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { builder: { name: { contains: search } } },
        { location: { name: { contains: search } } },
      ];
    }
    if (featured === "true") where.isFeatured = true;
    if (type) where.type = type;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any = {};
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      orderBy[sortBy] = sortOrder;
    } else if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else {
      orderBy.updatedAt = "desc";
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        builder: true,
        location: true,
        category: true,
        _count: {
          select: {
            pageViews: true,
            ratings: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
        priceHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy,
    });

    // Calculate average rating for each property
    const propertiesWithRatings = properties.map((property: any) => {
      const ratings = property.ratings || [];
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;
      const ratingCount = ratings.length;
      
      return {
        ...property,
        ratings: undefined, // Remove ratings array from response
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        ratingCount,
      };
    });

    // Always return an array, even if empty
    return NextResponse.json(Array.isArray(propertiesWithRatings) ? propertiesWithRatings : []);
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      size,
      price,
      seller,
      categoryId,
      subCategoryId,
      builderId,
      locationId,
      images,
      logo,
      isFeatured,
      // SEO Fields
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard,
      canonicalUrl,
    } = body;

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const property = await prisma.property.create({
      data: {
        name,
        slug,
        description,
        type,
        size,
        price: parseFloat(price),
        seller,
        categoryId,
        subCategoryId: subCategoryId || null,
        builderId,
        locationId,
        images: images || [],
        logo,
        isFeatured: isFeatured || false,
        // SEO Fields
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaKeywords: metaKeywords || null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        twitterCard: twitterCard || null,
        canonicalUrl: canonicalUrl || null,
        priceHistory: {
          create: {
            price: parseFloat(price),
            isIncrease: true,
          },
        },
      },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: "create_property",
        metadata: {
          propertyId: property.id,
          propertyName: name,
          price: parseFloat(price),
        },
      },
    }).catch((err) => console.error("Error logging activity:", err)); // Don't fail if activity logging fails

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

