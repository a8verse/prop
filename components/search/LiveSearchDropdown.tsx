"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  slug: string;
  price: number;
  builder: {
    name: string;
  };
  location: {
    name: string;
  };
  category: {
    name: string;
  };
}

interface LiveSearchDropdownProps {
  searchQuery: string;
  onSelect?: () => void;
}

export default function LiveSearchDropdown({
  searchQuery,
  onSelect,
}: LiveSearchDropdownProps) {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setIsOpen(true); // Show dropdown while loading
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`);
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }
        const data = await response.json();
        // Handle both array and error object responses
        if (Array.isArray(data)) {
          setResults(data);
          setIsOpen(true); // Always show dropdown if we have a query
        } else if (data.error) {
          console.error("Search API error:", data.error);
          setResults([]);
          setIsOpen(true); // Still show dropdown to indicate no results
        } else {
          setResults([]);
          setIsOpen(true); // Still show dropdown to indicate no results
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const handlePropertyClick = (property: Property) => {
    setIsOpen(false);
    if (onSelect) {
      onSelect();
    }
    router.push(`/?search=${encodeURIComponent(property.name)}`);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 max-h-96 overflow-y-auto"
      style={{ 
        position: 'absolute', 
        zIndex: 9999, 
        top: '100%', 
        left: 0, 
        right: 0,
        marginTop: '8px'
      }}
    >
      {loading ? (
        <div className="px-4 py-3 text-white/60 text-sm">Searching...</div>
      ) : results.length === 0 ? (
        <div className="px-4 py-3 text-white/60 text-sm">No properties found</div>
      ) : (
        <div className="py-2">
          {results.map((property) => (
            <button
              key={property.id}
              onClick={() => handlePropertyClick(property)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm truncate">
                    {property.name}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {property.builder.name} • {property.location.name} • {property.category.name}
                  </div>
                </div>
                <div className="text-primary font-bold text-sm flex-shrink-0">
                  {formatPrice(property.price)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

