"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic imports for Recharts components (with type assertions to fix Next.js dynamic import type issues)
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart as any), { ssr: false }) as any;
const Line = dynamic(() => import("recharts").then((mod) => mod.Line as any), { ssr: false }) as any;
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false }) as any;
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false }) as any;
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid as any), { ssr: false }) as any;
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false }) as any;
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false }) as any;

interface PropertyDetailContentProps {
  property: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    size: string | null;
    price: number;
    images: string[] | any; // Json type from Prisma (MySQL stores arrays as JSON)
    logo: string | null;
    builder: {
      id: string;
      name: string;
      logo: string | null;
    };
    location: {
      id: string;
      name: string;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    };
    subCategory: {
      id: string;
      name: string;
    } | null;
    priceHistory: Array<{
      id: string;
      price: number;
      change: number | null;
      isIncrease: boolean;
      createdAt: Date;
    }>;
    ratings: Array<{
      id: string;
      rating: number;
      comment: string | null;
      createdAt: Date;
      user: {
        name: string | null;
        image: string | null;
      };
    }>;
  };
}

export default function PropertyDetailContent({ property }: PropertyDetailContentProps) {
  // Helper to convert images from Json to array (MySQL stores arrays as JSON)
  const getImagesArray = (): string[] => {
    if (Array.isArray(property.images)) {
      return property.images;
    }
    if (property.images && typeof property.images === 'object') {
      // Prisma returns Json as parsed object, so we can check if it's array-like
      try {
        // If it's already an array, return it
        if (Array.isArray(property.images)) {
          return property.images;
        }
        // Otherwise, try to extract array from object
        return [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const imagesArray = getImagesArray();

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const chartData = property.priceHistory
    .slice()
    .reverse()
    .map((history, index) => ({
      date: new Date(history.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      price: history.price,
      index,
    }));

  const averageRating = property.ratings.length > 0
    ? property.ratings.reduce((sum, r) => sum + r.rating, 0) / property.ratings.length
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            {property.logo && (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <Image
                  src={property.logo}
                  alt={property.builder.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                {property.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-white/80">
                <Link
                  href={`/?builder=${encodeURIComponent(property.builder.name)}`}
                  className="text-primary hover:text-primary-light font-semibold"
                >
                  {property.builder.name}
                </Link>
                <span>•</span>
                <Link
                  href={`/?area=${encodeURIComponent(property.location.name)}`}
                  className="hover:text-primary"
                >
                  {property.location.name}
                </Link>
                <span>•</span>
                <Link
                  href={`/?category=${property.category.slug}`}
                  className="hover:text-primary"
                >
                  {property.category.name}
                </Link>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                {formatPrice(property.price)}
              </div>
              {property.priceHistory[0] && property.priceHistory[0].change !== null && (
                <div
                  className={`text-sm font-semibold ${
                    property.priceHistory[0].isIncrease ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {property.priceHistory[0].isIncrease ? "↑" : "↓"} {Math.abs(property.priceHistory[0].change).toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-white/60 text-xs sm:text-sm">Type</div>
              <div className="text-white font-semibold text-sm sm:text-base">{property.type}</div>
            </div>
            {property.size && (
              <div>
                <div className="text-white/60 text-xs sm:text-sm">Size</div>
                <div className="text-white font-semibold text-sm sm:text-base">{property.size}</div>
              </div>
            )}
            {property.subCategory && (
              <div>
                <div className="text-white/60 text-xs sm:text-sm">Sub Category</div>
                <div className="text-white font-semibold text-sm sm:text-base">{property.subCategory.name}</div>
              </div>
            )}
            {property.ratings.length > 0 && (
              <div>
                <div className="text-white/60 text-xs sm:text-sm">Rating</div>
                <div className="text-white font-semibold text-sm sm:text-base">
                  ⭐ {averageRating.toFixed(1)} ({property.ratings.length})
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Description</h2>
              <p className="text-white/80 text-sm sm:text-base">{property.description}</p>
            </div>
          )}

          {/* Images */}
          {imagesArray.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Images</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                {imagesArray.map((image, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${property.name} - Image ${idx + 1}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Trend Chart */}
          {property.priceHistory.length > 1 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Price Trend</h2>
              <div className="bg-black/30 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="date" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#000", border: "1px solid #ffffff20", color: "#fff" }}
                      formatter={(value: number) => formatPrice(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      dot={{ fill: "#D4AF37", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Ratings */}
          {property.ratings.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Reviews ({property.ratings.length})
              </h2>
              <div className="space-y-4">
                {property.ratings.map((rating) => (
                  <div key={rating.id} className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-primary text-lg">
                        {"⭐".repeat(rating.rating)}
                      </div>
                      <div className="text-white font-semibold">{rating.user.name || "Anonymous"}</div>
                      <div className="text-white/60 text-sm">
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="text-white/80 text-sm sm:text-base">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

