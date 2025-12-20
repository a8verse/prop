"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
  StarIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

export default function UserProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!session) {
    return null;
  }

  const userName = session.user.name || session.user.email?.split("@")[0] || "User";
  const userImage = session.user.image;

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "U";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/10"
      >
        {userImage ? (
          <Image
            src={userImage}
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {getInitials(userName)}
          </div>
        )}
        <span className="hidden md:inline font-medium">Hello {userName}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-black/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 py-2 z-[100]">
          <div className="px-4 py-2 text-sm text-white border-b border-white/10">
            <div className="font-semibold">{userName}</div>
            <div className="text-white/60 text-xs">{session.user.email}</div>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
            onClick={() => setIsOpen(false)}
          >
            <UserCircleIcon className="w-5 h-5 text-gray-400" />
            My Profile
          </Link>
          <Link
            href="/my-ratings"
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
            onClick={() => setIsOpen(false)}
          >
            <StarIcon className="w-5 h-5 text-gray-400" />
            View My Ratings
          </Link>
          <Link
            href="/tracked-properties"
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
            onClick={() => setIsOpen(false)}
          >
            <BookmarkIcon className="w-5 h-5 text-gray-400" />
            Tracked Properties
          </Link>
          <Link
            href="/change-password"
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
            onClick={() => setIsOpen(false)}
          >
            <KeyIcon className="w-5 h-5 text-gray-400" />
            Change Password
          </Link>
          <div className="border-t border-white/10 my-1" />
          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

