"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import HeroSection from "./HeroSection";
import FeaturedProperties from "./FeaturedProperties";
import PropertyList from "@/components/property/PropertyList";

interface HomeContentProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  featuredProperties: any[];
  initialShowListings?: boolean;
}

export default function HomeContent({
  categories,
  featuredProperties,
  initialShowListings = false,
}: HomeContentProps) {
  const searchParams = useSearchParams();
  const [showListings, setShowListings] = useState(initialShowListings);
  const [properties, setProperties] = useState<any[]>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [builders, setBuilders] = useState<Array<{ id: string; name: string }>>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if we should show listings based on URL params
  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const area = searchParams.get("area");
    const builder = searchParams.get("builder");
    const type = searchParams.get("type");
    
    if (category || search || area || builder || type) {
      setShowListings(true);
      fetchProperties(category, search, area, builder, type);
    } else {
      setShowListings(false);
      setProperties([]);
    }
  }, [searchParams]);

  const fetchProperties = async (
    category?: string | null,
    search?: string | null,
    area?: string | null,
    builder?: string | null,
    type?: string | null
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (search) params.append("search", search);
      if (area) params.append("area", area);
      if (builder) params.append("builder", builder);
      if (type) params.append("type", type);

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch properties: ${res.statusText}`);
      }
      const data = await res.json();
      // Ensure data is always an array
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch locations, builders, and property types for filters
    const fetchData = async () => {
      try {
        const [locationsRes, buildersRes, typesRes] = await Promise.all([
          fetch("/api/locations"),
          fetch("/api/builders"),
          fetch("/api/properties/types"),
        ]);
        const [locationsData, buildersData, typesData] = await Promise.all([
          locationsRes.json(),
          buildersRes.json(),
          typesRes.json(),
        ]);
        setLocations(locationsData);
        setBuilders(buildersData);
        setPropertyTypes(typesData.types || []);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchData();
  }, []);

  if (showListings) {
    // Get category name from URL or search params
    const categorySlug = searchParams.get("category");
    const area = searchParams.get("area");
    const builder = searchParams.get("builder");
    
    let pageTitle = null;
    let pageSubtitle = null;
    
    if (categorySlug) {
      const categoryName = categories.find(cat => cat.slug === categorySlug)?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
      pageTitle = categoryName;
      pageSubtitle = `Browse all ${categoryName.toLowerCase()} properties`;
    } else if (area) {
      pageTitle = `Properties in ${area}`;
      pageSubtitle = `Find your dream property in ${area}`;
    } else if (builder) {
      pageTitle = `Properties by ${builder}`;
      pageSubtitle = `Explore projects by ${builder}`;
    }

    return (
      <div className="flex-1 flex flex-col items-start justify-start overflow-y-auto px-2 md:px-4 lg:px-8 py-2 md:py-4" style={{ paddingTop: '100px', overflowX: 'visible' }}>
        <div className="max-w-7xl mx-auto w-full relative" style={{ zIndex: 1 }}>
          {/* Page Title Header */}
          {pageTitle && (
            <div className="mb-6 mt-4 pb-4 border-b border-white/20">
              <h1 className="text-3xl md:text-4xl font-bold text-white capitalize">
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="text-white/60 text-sm mt-2">
                  {pageSubtitle}
                </p>
              )}
            </div>
          )}
          
          {loading ? (
            <div className="text-center text-white/60 py-12">Loading properties...</div>
          ) : (
            <PropertyList
              properties={properties}
              categories={categories}
              locations={locations}
              builders={builders}
              propertyTypes={propertyTypes}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden px-2 md:px-4 lg:px-8 py-2 md:py-4" style={{ paddingTop: '100px' }}>
      <div className="max-w-7xl mx-auto w-full h-full grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
        {/* Hero Section - Left (2/3 on desktop) */}
        <div className="lg:col-span-2 flex items-center h-full min-h-0">
          <HeroSection />
        </div>

        {/* Featured Properties - Right (1/3 on desktop) */}
        <div className="lg:col-span-1 flex items-center h-full min-h-0 bg-white/10 rounded">
          <FeaturedProperties properties={featuredProperties} />
        </div>
      </div>
    </div>
  );
}

