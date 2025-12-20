"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

interface TrackPropertyButtonProps {
  propertyId: string;
  onToggle?: (isTracked: boolean) => void;
}

export default function TrackPropertyButton({
  propertyId,
  onToggle,
}: TrackPropertyButtonProps) {
  const { data: session } = useSession();
  const [isTracked, setIsTracked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      checkTrackingStatus();
    }
  }, [session, propertyId]);

  const checkTrackingStatus = async () => {
    try {
      const response = await fetch("/api/tracked-properties");
      const trackedProperties = await response.json();
      const tracked = trackedProperties.some(
        (tp: any) => tp.propertyId === propertyId
      );
      setIsTracked(tracked);
    } catch (error) {
      console.error("Error checking tracking status:", error);
    }
  };

  const handleToggle = async () => {
    if (!session) {
      alert("Please login to track properties");
      return;
    }

    setLoading(true);
    try {
      if (isTracked) {
        await fetch(`/api/tracked-properties/${propertyId}`, {
          method: "DELETE",
        });
        setIsTracked(false);
        if (onToggle) onToggle(false);
      } else {
        await fetch("/api/tracked-properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });
        setIsTracked(true);
        if (onToggle) onToggle(true);
      }
    } catch (error) {
      console.error("Error toggling tracking:", error);
      alert("Failed to update tracking status");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isTracked
          ? "bg-primary text-white hover:bg-primary-dark"
          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isTracked ? "Untrack property" : "Track property"}
    >
      {isTracked ? (
        <BookmarkSolidIcon className="w-5 h-5" />
      ) : (
        <BookmarkIcon className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">
        {isTracked ? "Tracked" : "Track"}
      </span>
    </button>
  );
}

