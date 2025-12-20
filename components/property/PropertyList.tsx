"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

const PropertyDetailModal = dynamic(() => import("./PropertyDetailModal"), {
  loading: () => <div className="text-white/60">Loading...</div>,
});
import TrackPropertyButton from "./TrackPropertyButton";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { useSession } from "next-auth/react";

interface Property {
  id: string;
  name: string;
  slug: string;
  type: string;
  size: string | null;
  price: number;
  logo: string | null;
  builder: { name: string; id: string };
  location: { name: string; id: string };
  category: { name: string; slug: string };
  averageRating?: number;
  ratingCount?: number;
  priceHistory: Array<{
    price: number;
    change: number | null;
    isIncrease: boolean;
    createdAt: Date;
  }>;
  updatedAt: Date;
}

interface PropertyListProps {
  properties: Property[];
  categories: Array<{ id: string; name: string; slug: string }>;
  locations: Array<{ id: string; name: string }>;
  builders: Array<{ id: string; name: string }>;
  propertyTypes?: string[];
}

function PropertyListContent({
  properties,
  categories,
  locations,
  builders,
  propertyTypes = [],
}: PropertyListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date");
  const [filterCategory, setFilterCategory] = useState(searchParams.get("category") || "");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "");
  
  // Parse multiple selections from URL
  const getArrayFromParam = (param: string | null): string[] => {
    if (!param) return [];
    return param.split(',').filter(Boolean);
  };
  
  const [filterAreas, setFilterAreas] = useState<string[]>(
    getArrayFromParam(searchParams.get("area"))
  );
  const [filterBuilders, setFilterBuilders] = useState<string[]>(
    getArrayFromParam(searchParams.get("builder"))
  );

  // Ensure properties is always an array
  const safeProperties = Array.isArray(properties) ? properties : [];

  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy && sortBy !== "date") params.set("sort", sortBy);
    if (filterCategory) params.set("category", filterCategory);
    if (filterType) params.set("type", filterType);
    if (filterAreas.length > 0) params.set("area", filterAreas.join(','));
    if (filterBuilders.length > 0) params.set("builder", filterBuilders.join(','));

    const queryString = params.toString();
    if (queryString) {
      router.push(`/?${queryString}`, { scroll: false });
    } else {
      router.push("/", { scroll: false });
    }
  }, [sortBy, filterCategory, filterType, filterAreas, filterBuilders, router]);
  
  const handleAreaChange = (values: string[]) => {
    setFilterAreas(values);
  };
  
  const handleBuilderChange = (values: string[]) => {
    setFilterBuilders(values);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (date: Date) => {
    const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "1 day ago";
    return `${daysAgo} days ago`;
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  return (
    <div className="w-full">
      {/* Filters - Hero Section Position */}
      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 relative" style={{ zIndex: 10 }}>
        {/* Mobile: Vertical Stack, Tablet: 2-column, Desktop: Single Row */}
        <div className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-3">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full md:w-auto px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-primary min-h-[44px]"
          >
            <option value="date">Sort by Date</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-auto px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-primary min-h-[44px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-auto px-3 sm:px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-primary min-h-[44px]"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Area - Multi-Select Dropdown */}
          <div className="w-full md:w-auto lg:flex-1 lg:min-w-[200px] lg:max-w-[250px]">
            <MultiSelectDropdown
              label="Area"
              options={locations}
              selectedValues={filterAreas}
              onChange={handleAreaChange}
              placeholder="Select Areas"
            />
          </div>

          {/* Builder - Multi-Select Dropdown */}
          <div className="w-full md:w-auto lg:flex-1 lg:min-w-[200px] lg:max-w-[250px]">
            <MultiSelectDropdown
              label="Builder"
              options={builders}
              selectedValues={filterBuilders}
              onChange={handleBuilderChange}
              placeholder="Select Builders"
            />
          </div>
        </div>
        
        {/* Show selected filters */}
        {(filterAreas.length > 0 || filterBuilders.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filterAreas.length > 0 && (
              <div className="text-xs text-white/60">
                Areas: <span className="text-primary font-semibold">{filterAreas.join(', ')}</span>
              </div>
            )}
            {filterBuilders.length > 0 && (
              <div className="text-xs text-white/60">
                Builders: <span className="text-primary font-semibold">{filterBuilders.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Property List - Scrollable */}
      <div className="space-y-2 relative" style={{ zIndex: 1 }}>
          {safeProperties.length === 0 ? (
            <div className="text-center text-white/60 py-12">
              No properties found
            </div>
          ) : (
            safeProperties.map((property) => {
              const latestPrice = property.priceHistory[0];
              const change = latestPrice?.change || 0;
              const isIncrease = latestPrice?.isIncrease ?? true;

              return (
                <div
                  key={property.id}
                  className="bg-black/50 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/10 hover:border-primary/50 transition-all"
                >
                  {/* Mobile: Vertical Stack */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    {/* Top Row: Logo, Builder, Price (Mobile) */}
                    <div className="flex items-center gap-2 md:gap-4 flex-1">
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        {property.logo ? (
                          <div className="relative w-10 h-10 md:w-12 md:h-12">
                            <Image
                              src={property.logo}
                              alt={property.builder.name}
                              fill
                              className="object-contain"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded flex items-center justify-center text-white/40 text-[10px] md:text-xs">
                            No Logo
                          </div>
                        )}
                      </div>

                      {/* Builder Name & Property Name (Mobile) */}
                      <div className="flex-1 min-w-0 md:hidden">
                        <Link
                          href={`/?builder=${encodeURIComponent(property.builder.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:text-primary-light font-semibold text-xs block"
                        >
                          {property.builder.name}
                        </Link>
                        <div className="text-white font-semibold text-sm truncate">
                          {property.name}
                        </div>
                      </div>

                      {/* Builder Name (Desktop) */}
                      <div className="hidden md:block flex-shrink-0 w-32">
                        <Link
                          href={`/?builder=${encodeURIComponent(property.builder.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:text-primary-light font-semibold text-sm"
                        >
                          {property.builder.name}
                        </Link>
                      </div>

                      {/* Project Details (Desktop) */}
                      <div className="hidden md:flex flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="text-white font-semibold text-sm">
                            {property.name}
                          </div>
                          <div className="text-white/60 text-xs">
                            {property.type} {property.size && `• ${property.size}`}
                          </div>
                          <div className="text-white/40 text-xs">
                            <Link
                              href={`/?area=${encodeURIComponent(property.location.name)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-primary"
                            >
                              {property.location.name}
                            </Link>
                            {" • "}
                            <Link
                              href={`/?category=${property.category.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-primary"
                            >
                              {property.category.name}
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions (Mobile - Right Side) */}
                      <div className="md:hidden flex-shrink-0 text-right">
                        <div className="text-primary font-bold text-sm">
                          {formatPrice(property.price)}
                        </div>
                        {change !== 0 && (
                          <div
                            className={`text-[10px] font-semibold ${
                              isIncrease ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {isIncrease ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details Row (Mobile) */}
                    <div className="md:hidden text-white/60 text-xs space-y-1">
                      <div>
                        {property.type} {property.size && `• ${property.size}`}
                      </div>
                      <div className="text-white/40">
                        <Link
                          href={`/?area=${encodeURIComponent(property.location.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary"
                        >
                          {property.location.name}
                        </Link>
                        {" • "}
                        <Link
                          href={`/?category=${property.category.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-primary"
                        >
                          {property.category.name}
                        </Link>
                      </div>
                    </div>

                    {/* Rating & Actions Row (Mobile) */}
                    <div className="md:hidden flex items-center justify-between">
                      {/* Rating */}
                      <div>
                        {property.averageRating && property.averageRating > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-white text-xs font-semibold">
                              {property.averageRating.toFixed(1)}
                            </span>
                            <span className="text-white/40 text-[10px]">
                              ({property.ratingCount || 0})
                            </span>
                          </div>
                        ) : (
                          <div className="text-white/40 text-[10px]">No ratings</div>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property);
                          }}
                          className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-semibold rounded border border-primary/30 transition-colors whitespace-nowrap min-h-[32px]"
                        >
                          Trend
                        </button>
                        {session && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <TrackPropertyButton propertyId={property.id} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Desktop: Rating, Price & Actions */}
                    <div className="hidden md:flex items-center gap-4">
                      {/* Rating */}
                      <div className="flex-shrink-0 w-20">
                        {property.averageRating && property.averageRating > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-white text-xs font-semibold">
                              {property.averageRating.toFixed(1)}
                            </span>
                            <span className="text-white/40 text-[10px]">
                              ({property.ratingCount || 0})
                            </span>
                          </div>
                        ) : (
                          <div className="text-white/40 text-[10px]">No ratings</div>
                        )}
                      </div>

                      {/* Price & Actions */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-right">
                            <div className="text-primary font-bold text-base">
                              {formatPrice(property.price)}
                            </div>
                            {change !== 0 && (
                              <div
                                className={`text-[10px] font-semibold ${
                                  isIncrease ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {isIncrease ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePropertyClick(property);
                            }}
                            className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-semibold rounded border border-primary/30 transition-colors whitespace-nowrap"
                          >
                            Trend
                          </button>
                          {session && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <TrackPropertyButton propertyId={property.id} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
      </div>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}

export default function PropertyList(props: PropertyListProps) {
  return (
    <Suspense fallback={<div className="text-white/60">Loading filters...</div>}>
      <PropertyListContent {...props} />
    </Suspense>
  );
}

