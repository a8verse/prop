"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";

// Dynamic imports for Recharts components (with type assertions to fix Next.js dynamic import type issues)
const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart as any), { ssr: false }) as any;
const Line = dynamic(() => import("recharts").then((mod) => mod.Line as any), { ssr: false }) as any;
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis as any), { ssr: false }) as any;
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis as any), { ssr: false }) as any;
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid as any), { ssr: false }) as any;
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip as any), { ssr: false }) as any;
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer as any), { ssr: false }) as any;
import TrackPropertyButton from "./TrackPropertyButton";

interface Property {
  id: string;
  name: string;
  type: string;
  size: string | null;
  price: number;
  logo: string | null;
  builder: { name: string };
  location: { name: string };
  category: { name: string };
  priceHistory: Array<{
    price: number;
    change: number | null;
    isIncrease: boolean;
    createdAt: Date;
  }>;
}

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const { data: session } = useSession();
  const [ratings, setRatings] = useState<any>(null);
  const [userRating, setUserRating] = useState<{ rating: number; comment: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  useEffect(() => {
    if (property.id) {
      fetchRatings();
    }
  }, [property.id]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ratings?propertyId=${property.id}`);
      const data = await res.json();
      setRatings(data);
      
      // Find user's rating if logged in
      if (session && data.ratings) {
        const userRatingData = data.ratings.find((r: any) => r.user.id === session.user.id);
        if (userRatingData) {
          setUserRating({
            rating: userRatingData.rating,
            comment: userRatingData.comment || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!session || !userRating || userRating.rating < 1) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          rating: userRating.rating,
          comment: userRating.comment || null,
        }),
      });

      if (res.ok) {
        await fetchRatings();
        alert("Rating submitted successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("An error occurred while submitting rating");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Prepare chart data
  const chartData = property.priceHistory
    .slice()
    .reverse()
    .map((ph) => ({
      date: new Date(ph.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: ph.price / 100000, // Convert to Lakhs for readability
    }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className="relative bg-black/90 backdrop-blur-lg rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            {property.logo && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={property.logo}
                  alt={property.builder.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {property.name}
              </h2>
              <div className="text-primary font-semibold">{property.builder.name}</div>
              <div className="text-white/60 text-sm mt-1">
                {property.location.name} • {property.category.name}
              </div>
            </div>
          </div>

          {/* Price Trend Chart */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Price Trend</h3>
            {chartData.length > 1 ? (
              <div className="h-64 bg-black/50 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis
                      dataKey="date"
                      stroke="#ffffff60"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#ffffff60"
                      style={{ fontSize: "12px" }}
                      label={{ value: "Price (L)", angle: -90, position: "insideLeft", fill: "#ffffff60" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.9)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value: number) => `₹${value.toFixed(0)}L`}
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
            ) : (
              <div className="text-white/60 text-center py-8 bg-black/50 rounded-lg">
                Insufficient data for price trend chart
              </div>
            )}
          </div>

          {/* Ratings Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Ratings {ratings && `(${ratings.count})`}
              {ratings && ratings.average > 0 && (
                <span className="ml-2 text-primary">
                  {ratings.average.toFixed(1)} ⭐
                </span>
              )}
            </h3>
            {session ? (
              <div className="bg-black/50 rounded-lg p-4 space-y-4">
                {/* Rating Form */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating({ ...(userRating || { rating: 0, comment: "" }), rating: star })}
                        className="focus:outline-none"
                      >
                        {star <= (userRating?.rating || 0) ? (
                          <StarIconSolid className="w-8 h-8 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-8 h-8 text-white/40" />
                        )}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={userRating?.comment || ""}
                    onChange={(e) => setUserRating({ ...(userRating || { rating: 0, comment: "" }), comment: e.target.value })}
                    placeholder="Add a comment (optional)"
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleRatingSubmit}
                    disabled={submitting || !userRating || userRating.rating < 1}
                    className="mt-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : userRating && userRating.rating > 0 ? "Update Rating" : "Submit Rating"}
                  </button>
                </div>

                {/* Existing Ratings */}
                {ratings && ratings.ratings && ratings.ratings.length > 0 && (
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="text-white font-semibold mb-3">All Ratings</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {ratings.ratings.map((rating: any) => (
                        <div key={rating.id} className="bg-black/30 rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star}>
                                  {star <= rating.rating ? (
                                    <StarIconSolid className="w-4 h-4 text-yellow-400" />
                                  ) : (
                                    <StarIcon className="w-4 h-4 text-white/40" />
                                  )}
                                </span>
                              ))}
                            </div>
                            <span className="text-white/60 text-sm">{rating.user.name || "Anonymous"}</span>
                          </div>
                          {rating.comment && (
                            <p className="text-white/80 text-sm">{rating.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-black/50 rounded-lg p-4 border border-primary/30">
                <div className="text-white mb-4">
                  Please login to view and submit ratings
                </div>
                <div className="flex gap-4">
                  <Link
                    href="/login?type=cp"
                    className="px-4 py-2 bg-primary text-black font-semibold rounded hover:bg-primary-light transition-colors"
                  >
                    Login as Channel Partner
                  </Link>
                  <Link
                    href="/login?type=visitor"
                    className="px-4 py-2 border border-white text-white font-semibold rounded hover:bg-white/10 transition-colors"
                  >
                    Login as Visitor
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/60">Type</div>
              <div className="text-white font-semibold">{property.type}</div>
            </div>
            {property.size && (
              <div>
                <div className="text-white/60">Size</div>
                <div className="text-white font-semibold">{property.size}</div>
              </div>
            )}
            <div>
              <div className="text-white/60">Current Price</div>
              <div className="flex items-center gap-3">
                <div className="text-primary font-bold text-lg">{formatPrice(property.price)}</div>
                {session && <TrackPropertyButton propertyId={property.id} />}
              </div>
            </div>
            <div>
              <div className="text-white/60">Location</div>
              <div className="text-white font-semibold">{property.location.name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

