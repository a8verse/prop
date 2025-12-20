"use client";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

interface Property {
  id: string;
  name: string;
  price: number;
  builder: {
    name: string;
  };
  priceHistory: Array<{
    change: number | null;
    isIncrease: boolean;
  }>;
  updatedAt: Date;
}

interface FeaturedPropertiesProps {
  properties: Property[];
}

export default function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const formatPrice = (price: number) => {
    // Return exact amount with Indian number formatting
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="bg-white/10 p-2 md:p-3 lg:p-4 h-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] flex flex-col w-full mt-4 sm:mt-8 md:mt-16 lg:mt-20 shadow-lg">
      {/* Mobile: Horizontal Scroll, Desktop: Vertical Scroll */}
      <div className="flex-1 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden space-y-1 md:space-y-1.5 pr-1 md:pr-1">
        {properties.length === 0 ? (
          <div className="text-white/60 text-center py-8 text-sm">
            No featured properties available
          </div>
        ) : (
          <div className="flex md:flex-col gap-2 md:gap-0 min-w-max md:min-w-0">
            {properties.map((property) => {
            const latestPriceChange = property.priceHistory[0];
            const change = latestPriceChange?.change || 0;
            const isIncrease = latestPriceChange?.isIncrease ?? true;
            const percentage = change !== 0 ? `${Math.abs(change).toFixed(1)}%` : "";

              return (
                <div
                  key={property.id}
                  className="bg-transparent border-b md:border-b border-white/20 border-r md:border-r-0 py-1.5 md:py-2 px-2 hover:bg-white/10 transition-colors min-w-[200px] sm:min-w-[250px] md:min-w-0 md:w-full"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-1.5 lg:gap-2 text-[10px] sm:text-xs md:text-xs text-white w-full">
                    {/* Builder Name's Property Name */}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block md:whitespace-nowrap overflow-hidden text-ellipsis">
                        {property.builder.name}&apos;s {property.name}
                      </span>
                    </div>
                    
                    {/* Price and Percentage Row */}
                    <div className="flex items-center gap-2 md:gap-1.5">
                      {/* Price */}
                      <div className="text-primary font-semibold whitespace-nowrap flex-shrink-0 text-[10px] sm:text-xs md:text-xs">
                        {formatPrice(property.price)}
                      </div>
                      
                      {/* Percentage */}
                      {percentage && (
                        <div
                          className={`flex items-center gap-0.5 text-[10px] sm:text-xs md:text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                            isIncrease ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isIncrease ? (
                            <ArrowUpIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          ) : (
                            <ArrowDownIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                          )}
                          <span>{percentage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
