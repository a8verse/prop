"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";

interface Builder {
  id: string;
  name: string;
  logo: string | null;
  rating: number | null;
}

interface FeaturedPropertiesProps {
  builders: Builder[];
}

export default function FeaturedProperties({ builders }: FeaturedPropertiesProps) {
  const renderStars = (rating: number | null) => {
    if (!rating) {
      return (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarOutlineIcon key={star} className="w-3 h-3 text-gray-400" />
          ))}
          <span className="text-[10px] text-gray-500 ml-1">No rating</span>
        </div>
      );
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return <StarIcon key={star} className="w-3 h-3 text-yellow-500 fill-yellow-500" />;
          } else if (star === fullStars + 1 && hasHalfStar) {
            return <StarIcon key={star} className="w-3 h-3 text-yellow-500 fill-yellow-500 opacity-50" />;
          } else {
            return <StarOutlineIcon key={star} className="w-3 h-3 text-gray-400" />;
          }
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#f5f5f0] p-2 md:p-3 lg:p-4 h-full max-h-[300px] sm:max-h-[400px] md:max-h-[500px] flex flex-col w-full mt-4 sm:mt-8 md:mt-20 lg:mt-24 xl:mt-28 mb-6 sm:mb-8 md:mb-10 shadow-lg rounded-none">
      {/* Mobile: Horizontal Scroll, Desktop: Vertical Scroll */}
      <div className="flex-1 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden space-y-1 md:space-y-1.5 pr-1 md:pr-1">
        {builders.length === 0 ? (
          <div className="text-gray-600 text-center py-8 text-sm">
            No builders available
          </div>
        ) : (
          <div className="flex md:flex-col gap-2 md:gap-0 min-w-max md:min-w-0">
            {builders.map((builder) => (
              <Link
                key={builder.id}
                href={`/projects?builder=${encodeURIComponent(builder.name)}`}
                className="bg-transparent border-b md:border-b border-gray-300 border-r md:border-r-0 py-1.5 md:py-2 px-2 hover:bg-gray-200/50 transition-colors w-full cursor-pointer"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-2 text-[10px] sm:text-xs md:text-xs text-black w-full">
                  {/* Builder Logo */}
                  {builder.logo && (
                    <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <Image
                        src={builder.logo}
                        alt={builder.name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  )}
                  
                  {/* Builder Name - Single row, full name visible */}
                  <div className="flex-1 min-w-0">
                    <span 
                      className="font-medium block whitespace-nowrap"
                      style={{
                        fontSize: builder.name.length > 25 
                          ? '0.65rem' 
                          : builder.name.length > 20 
                            ? '0.7rem' 
                            : builder.name.length > 15
                              ? '0.75rem'
                              : '0.8rem'
                      }}
                    >
                      {builder.name}
                    </span>
                  </div>
                  
                  {/* Star Rating - with gap from text */}
                  <div className="flex-shrink-0 ml-2 md:ml-3">
                    {renderStars(builder.rating)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
