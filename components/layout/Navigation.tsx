"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import UserProfileDropdown from "./UserProfileDropdown";
import ChannelPartnerLoginModal from "@/components/auth/ChannelPartnerLoginModal";
import VisitorLoginModal from "@/components/auth/VisitorLoginModal";

interface NavigationProps {
  categories?: Array<{ id: string; name: string; slug: string }>;
  socialLinks?: Array<{ name: string; url: string; icon?: string }>;
}

export default function Navigation({ categories = [], socialLinks = [] }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCPModal, setShowCPModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const { data: session } = useSession();
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMenuOpen || isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (isMobileMenuOpen) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, isMobileMenuOpen]);

  const getIcon = (name: string, url: string) => {
    const lowerName = name.toLowerCase();
    const lowerUrl = url.toLowerCase();
    
    if (lowerName.includes('facebook') || lowerUrl.includes('facebook')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      );
    }
    if (lowerName.includes('instagram') || lowerUrl.includes('instagram')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.398.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (lowerName.includes('youtube') || lowerUrl.includes('youtube')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    );
  };

  return (
    <>
      <nav className="w-full backdrop-blur-custom bg-black/30 border-b border-white/10 z-40 fixed left-0" style={{ top: '60px' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-1.5">
          {/* Mobile Layout */}
          <div className="flex md:hidden items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-primary transition-colors p-2"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            {session ? (
              <UserProfileDropdown />
            ) : (
              <div className="text-white/60 text-xs">Menu</div>
            )}
          </div>

          {/* Desktop/Tablet Layout */}
          <div className="hidden md:flex items-center justify-between flex-wrap gap-2">
            {/* Categories - Left */}
            <div className="flex items-center space-x-2 md:space-x-3 flex-wrap">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <div key={category.id} className="flex items-center">
                    <Link
                      href={`/?category=${category.slug}`}
                      className="relative text-white hover:text-primary transition-colors text-sm font-medium px-2 py-1 group overflow-hidden"
                    >
                      {/* Left-to-right line animation on hover */}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300 ease-out"></span>
                      {category.name}
                    </Link>
                    {/* Golden separator - don't show after last category */}
                    {index < categories.length - 1 && (
                      <span className="text-yellow-400 text-lg font-bold mx-1">|</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-white/40 text-sm">No categories yet</div>
              )}
            </div>

            {/* Social Icons & Burger Menu - Right */}
            <div className="flex items-center space-x-4">
              {/* Social Media Icons */}
              <div className="flex items-center space-x-3">
                {socialLinks.length > 0 ? (
                  socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-primary transition-all hover:scale-110 p-1"
                      aria-label={link.name}
                      title={link.name}
                    >
                      {getIcon(link.name, link.url)}
                    </a>
                  ))
                ) : null}
              </div>

              {/* User Profile Dropdown or Burger Menu */}
              {session ? (
                <UserProfileDropdown />
              ) : (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-white hover:text-primary transition-colors p-2"
                    aria-label="Menu"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                  </button>

                  {/* Dropdown Menu - Only show when not logged in */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-black/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 py-2 z-[100]">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowCPModal(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
                      >
                        👥 Login as Channel Partner
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowVisitorModal(true);
                        }}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
                      >
                        👤 Login as Visitor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-[9998] bg-black/95 backdrop-blur-md md:hidden"
          style={{ top: '100px' }}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white/60 text-xs uppercase mb-3">Categories</h3>
                <div className="flex flex-col gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/?category=${category.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white hover:text-primary transition-colors text-base font-medium py-2 px-3 rounded hover:bg-white/10"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links Section */}
            {socialLinks.length > 0 && (
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white/60 text-xs uppercase mb-3">Follow Us</h3>
                <div className="flex items-center gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-primary transition-all hover:scale-110 p-2"
                      aria-label={link.name}
                      title={link.name}
                    >
                      {getIcon(link.name, link.url)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Login Section */}
            {!session && (
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white/60 text-xs uppercase mb-3">Account</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowCPModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors text-base font-medium rounded"
                  >
                    👥 Login as Channel Partner
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowVisitorModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors text-base font-medium rounded"
                  >
                    👤 Login as Visitor
                  </button>
                </div>
              </div>
            )}

            {/* User Profile (if logged in) */}
            {session && (
              <div className="p-4">
                <UserProfileDropdown />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Modals */}
      <ChannelPartnerLoginModal
        isOpen={showCPModal}
        onClose={() => setShowCPModal(false)}
      />
      <VisitorLoginModal
        isOpen={showVisitorModal}
        onClose={() => setShowVisitorModal(false)}
      />
    </>
  );
}

