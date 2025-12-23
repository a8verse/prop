"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LiveSearchDropdown from "@/components/search/LiveSearchDropdown";
import MobileSearchModal from "@/components/search/MobileSearchModal";

interface HeaderProps {
  email?: string;
  phone?: string;
  logo?: string;
  logoBgColor?: string;
  logoBgTransparent?: boolean;
}

export default function Header({ email, phone, logo: logoProp, logoBgColor: logoBgColorProp, logoBgTransparent: logoBgTransparentProp }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [logo, setLogo] = useState<string | undefined>(logoProp);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [logoBgColor, setLogoBgColor] = useState<string>(logoBgColorProp || "#eae5d7");
  const [logoBgTransparent, setLogoBgTransparent] = useState<boolean>(logoBgTransparentProp || false);

  // Fetch logo from database if not provided via props
  useEffect(() => {
    if (!logoProp) {
      fetch("/api/site-settings?key=logo")
        .then((res) => res.json())
        .then((data) => {
          if (data?.value) {
            const logoValue = data.value;
            if (typeof logoValue === 'string') {
              setLogo(logoValue);
            } else if (typeof logoValue === 'object' && logoValue !== null) {
              const logoObj = logoValue as any;
              setLogo(logoObj.logo);
              setLogoBgColor(logoObj.logoBgColor || "#eae5d7");
              setLogoBgTransparent(logoObj.logoBgTransparent || false);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching logo:", error);
        });
    } else {
      // If logo is provided via props, also set background color and transparent
      setLogoBgColor(logoBgColorProp || "#eae5d7");
      setLogoBgTransparent(logoBgTransparentProp || false);
    }
  }, [logoProp, logoBgColorProp, logoBgTransparentProp]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Use logo from state or fallback to default
  const logoPath = logo || "/logo.png";
  const hasLogo = !!logo || true; // Show logo if provided or use default

  return (
    <>
      <header className="w-full fixed top-0 left-0 z-50 px-3 sm:px-4 md:px-8 py-2 sm:py-3 bg-transparent">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout - Stacked */}
          <div className="flex md:hidden flex-col gap-2">
            {/* Top Row: Logo and Search Icon */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                {hasLogo ? (
                  <div 
                    className="relative h-8 w-24 rounded px-2 flex items-center justify-center"
                    style={{
                      backgroundColor: logoBgTransparent ? 'transparent' : logoBgColor,
                    }}
                  >
                    {logoPath.startsWith('data:') ? (
                      <img
                        src={logoPath}
                        alt="oliolly"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Image
                        src={logoPath}
                        alt="oliolly"
                        fill
                        className="object-contain"
                        priority
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-primary text-xl font-bold">oliolly</div>
                )}
              </Link>
              <button
                onClick={() => setShowMobileSearch(true)}
                className="p-2 text-white/80 hover:text-white transition-colors"
                aria-label="Search"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2} 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop/Tablet Layout - Horizontal */}
          <div className="hidden md:flex items-center justify-between flex-wrap gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {hasLogo ? (
                <div 
                  className="relative h-10 w-32 rounded px-2 flex items-center justify-center"
                  style={{
                    backgroundColor: logoBgTransparent ? 'transparent' : logoBgColor,
                  }}
                >
                  {logoPath.startsWith('data:') ? (
                    <img
                      src={logoPath}
                      alt="oliolly"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Image
                      src={logoPath}
                      alt="oliolly"
                      fill
                      className="object-contain"
                      priority
                    />
                  )}
                </div>
              ) : (
                <div className="text-primary text-2xl font-bold">oliolly</div>
              )}
            </Link>

            {/* Search Bar - Center */}
            <div
              ref={searchContainerRef}
              className="flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8 relative"
              style={{ position: 'relative', zIndex: 100 }}
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <svg 
                  className="w-5 h-5 text-white/70" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2} 
                  viewBox="0 0 24 24"
                  shapeRendering="geometricPrecision"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  if (searchQuery.trim().length >= 2) {
                    // The useEffect will handle showing the dropdown
                  }
                }}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:border-primary focus:bg-white/15 relative z-10"
              />
              <LiveSearchDropdown
                searchQuery={searchQuery}
                onSelect={() => setSearchQuery("")}
              />
            </div>

            {/* Contact Info - Right */}
            <div className="flex items-center space-x-3 lg:space-x-4 text-sm text-white font-medium">
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors whitespace-nowrap">
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors whitespace-nowrap">
                  {email}
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />
    </>
  );
}

