"use client";

import Link from "next/link";

interface Property {
  id: string;
  name: string;
  builder: { name: string };
  _count: { pageViews: number };
}

interface MostViewedPropertiesProps {
  properties: Property[];
}

export default function MostViewedProperties({ properties }: MostViewedPropertiesProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Most Viewed Properties</h2>
      {properties.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No views yet</div>
      ) : (
        <div className="space-y-3">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center text-primary font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">{property.name}</div>
                  <div className="text-gray-600 text-sm">{property.builder.name}</div>
                </div>
              </div>
              <div className="text-primary font-semibold">
                {property._count.pageViews} views
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

