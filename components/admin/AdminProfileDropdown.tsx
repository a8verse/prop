"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  if (!session) return null;

  const adminName = session.user?.name || "Admin";
  const adminEmail = session.user?.email || "";
  const adminImage = session.user?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23D4AF37'/%3E%3Ctext x='20' y='28' font-size='20' fill='white' text-anchor='middle' font-weight='bold'%3E" + (adminName.charAt(0).toUpperCase() || "A") + "%3C/text%3E%3C/svg%3E";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="text-right hidden md:block">
          <div className="text-sm font-medium text-gray-900">Hello, {adminName.split(" ")[0]}</div>
          <div className="text-xs text-gray-500">{adminEmail}</div>
        </div>
        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary bg-primary/20 flex items-center justify-center">
          {session.user?.image ? (
            <Image
              src={adminImage}
              alt={adminName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-primary">
              {adminName.charAt(0).toUpperCase() || "A"}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">{adminName}</div>
            <div className="text-xs text-gray-500 truncate">{adminEmail}</div>
          </div>
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✏️ Edit Profile
          </Link>
          <Link
            href="/dashboard/profile/change-password"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🔒 Change Password
          </Link>
          <Link
            href="/dashboard/profile/2fa"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🔐 Manage 2FA
          </Link>
          <div className="border-t border-gray-200 my-1" />
          <Link
            href="/"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🌐 Back to Site
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/login/admin" });
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}

