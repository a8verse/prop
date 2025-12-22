"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminProfileDropdown from "@/components/admin/AdminProfileDropdown";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login/admin");
      return;
    }
    if ((session.user as any)?.role !== "ADMIN") {
      router.push("/login/admin");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Now we can do conditional returns after all hooks
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Redirecting to login...</div>
      </div>
    );
  }

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/properties", label: "Properties" },
    { href: "/dashboard/categories", label: "Categories" },
    { href: "/dashboard/channel-partners", label: "Channel Partners" },
    { href: "/dashboard/builders", label: "Builders" },
    { href: "/dashboard/visitors", label: "Visitors" },
    { href: "/dashboard/slider", label: "Slider" },
    { href: "/dashboard/social-media", label: "Social Media" },
    { href: "/dashboard/newsletter", label: "Newsletter" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="text-primary text-lg sm:text-xl font-bold">
              Admin Dashboard
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-4 md:gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-primary transition-colors text-sm md:text-base"
                >
                  {item.label}
                </Link>
              ))}
              <AdminProfileDropdown />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <AdminProfileDropdown />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-primary transition-colors"
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
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors rounded-lg text-base font-medium min-h-[44px] flex items-center"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto">{children}</main>
    </div>
  );
}

