"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface Builder {
  id: string;
  name: string;
  logo: string | null;
  rating: number | null;
}

export default function BuilderRatingsPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    try {
      const res = await fetch("/api/builders");
      if (res.ok) {
        const data = await res.json();
        setBuilders(data);
      }
    } catch (error) {
      console.error("Error fetching builders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (builderId: string, rating: number) => {
    setSaving({ ...saving, [builderId]: true });
    try {
      const res = await fetch(`/api/builders/${builderId}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      if (res.ok) {
        // Update local state
        setBuilders((prev) =>
          prev.map((b) => (b.id === builderId ? { ...b, rating } : b))
        );
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update rating");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      alert("Failed to update rating");
    } finally {
      setSaving({ ...saving, [builderId]: false });
    }
  };

  const renderStars = (builder: Builder, interactive: boolean = true) => {
    const currentRating = builder.rating || 0;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentRating;
          const StarComponent = isFilled ? StarIcon : StarOutlineIcon;
          const color = isFilled ? "text-yellow-400" : "text-gray-300";

          return (
            <button
              key={star}
              onClick={() => interactive && handleRatingChange(builder.id, star)}
              disabled={!interactive || saving[builder.id]}
              className={`${color} ${interactive ? "hover:scale-110 cursor-pointer transition-transform" : ""} ${saving[builder.id] ? "opacity-50" : ""}`}
              title={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <StarComponent className="w-6 h-6" />
            </button>
          );
        })}
        {currentRating > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            ({currentRating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading builders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Builder Ratings</h1>
        <p className="text-gray-600">
          Rate builders by clicking on the stars. Ratings will be displayed in the featured builders section on the home page.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Builder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {builders.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                    No builders found
                  </td>
                </tr>
              ) : (
                builders.map((builder) => (
                  <tr key={builder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {builder.logo && (
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={builder.logo}
                              alt={builder.name}
                              fill
                              className="object-contain rounded"
                            />
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {builder.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(builder, true)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

