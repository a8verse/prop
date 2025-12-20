"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrashIcon } from "@heroicons/react/24/outline";

interface TrackedProperty {
  id: string;
  propertyId: string;
  createdAt: Date;
  property: {
    id: string;
    name: string;
    slug: string;
    price: number;
    builder: { name: string };
    location: { name: string };
    category: { name: string };
    priceHistory: Array<{
      price: number;
      change: number | null;
      isIncrease: boolean;
      createdAt: Date;
    }>;
  };
}

interface TrackedPropertiesListProps {
  trackedProperties: TrackedProperty[];
}

export default function TrackedPropertiesList({
  trackedProperties,
}: TrackedPropertiesListProps) {
  const [properties, setProperties] = useState(trackedProperties);

  const handleUntrack = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/tracked-properties?propertyId=${propertyId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProperties(properties.filter((tp) => tp.propertyId !== propertyId));
      } else {
        alert("Failed to untrack property");
      }
    } catch (error) {
      console.error("Error untracking property:", error);
      alert("An error occurred");
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (properties.length === 0) {
    return (
      <div className="text-center text-white/60 py-12">
        <p className="text-lg mb-2">No tracked properties yet</p>
        <p className="text-sm">Start tracking properties to see price trends here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {properties.map((trackedProperty) => {
        const { property } = trackedProperty;
        const chartData = property.priceHistory
          .slice()
          .reverse()
          .map((ph) => ({
            date: new Date(ph.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            }),
            price: ph.price,
          }));

        return (
          <div
            key={trackedProperty.id}
            className="bg-black/50 backdrop-blur-sm rounded-lg p-6 border border-white/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-xl mb-2">{property.name}</h3>
                <div className="text-white/60 text-sm">
                  <span className="text-primary">{property.builder.name}</span>
                  {" • "}
                  {property.location.name}
                  {" • "}
                  {property.category.name}
                </div>
                <div className="text-primary font-bold text-2xl mt-2">
                  {formatPrice(property.price)}
                </div>
              </div>
              <button
                onClick={() => handleUntrack(property.id)}
                className="text-red-400 hover:text-red-300 transition-colors p-2"
                title="Untrack property"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>

            {chartData.length > 1 && (
              <div className="mt-4 h-48">
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
                      tickFormatter={(value) => formatPrice(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => formatPrice(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

