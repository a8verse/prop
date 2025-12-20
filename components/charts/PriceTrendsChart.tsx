"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Property {
  id: string;
  name: string;
  builder: { name: string };
  priceHistory: Array<{
    price: number;
    createdAt: Date;
  }>;
}

interface Category {
  id: string;
  name: string;
}

interface PriceTrendsChartProps {
  properties: Property[];
  categories: Category[];
}

export default function PriceTrendsChart({ properties, categories }: PriceTrendsChartProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    if (selectedProperty) return p.id === selectedProperty;
    return true;
  });

  // Prepare chart data
  const chartData: Record<string, any> = {};
  
  filteredProperties.forEach((property) => {
    property.priceHistory.forEach((ph) => {
      const date = new Date(ph.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!chartData[date]) {
        chartData[date] = { date };
      }
      chartData[date][property.name] = ph.price / 100000; // Convert to Lakhs
    });
  });

  const data = Object.values(chartData).sort((a: any, b: any) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Get unique property names for lines
  const propertyNames = Array.from(
    new Set(filteredProperties.map((p) => p.name))
  );

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {p.builder.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
              <Legend />
              {propertyNames.map((name, index) => {
                const colors = ["#D4AF37", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];
                return (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center text-white/60 py-12">
          No price history data available
        </div>
      )}
    </div>
  );
}

