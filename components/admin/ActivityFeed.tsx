"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Image from "next/image";

interface Activity {
  id: string;
  action: string;
  metadata: any;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
  };
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append("action", filter);
      params.append("limit", "50");

      const res = await fetch(`/api/activities?${params.toString()}`);
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "view_property":
        return "👁️";
      case "submit_rating":
        return "⭐";
      case "login":
        return "🔐";
      case "register":
        return "👤";
      case "track_property":
        return "📌";
      case "update_price":
        return "💰";
      case "create_property":
        return "➕";
      case "update_property":
        return "✏️";
      default:
        return "📝";
    }
  };

  const getActionLabel = (action: string, metadata: any) => {
    switch (action) {
      case "view_property":
        return `Viewed property: ${metadata?.propertyName || "Unknown"}`;
      case "submit_rating":
        return `Rated property: ${metadata?.propertyName || "Unknown"} (${metadata?.rating || 0} stars)`;
      case "login":
        return "Logged in";
      case "register":
        return "Registered new account";
      case "track_property":
        return `Started tracking: ${metadata?.propertyName || "Unknown"}`;
      case "update_price":
        return `Updated price for: ${metadata?.propertyName || "Unknown"}`;
      case "create_property":
        return `Created property: ${metadata?.propertyName || "Unknown"}`;
      case "update_property":
        return `Updated property: ${metadata?.propertyName || "Unknown"}`;
      default:
        return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-center py-8">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:border-primary"
        >
          <option value="">All Actions</option>
          <option value="view_property">View Property</option>
          <option value="submit_rating">Submit Rating</option>
          <option value="login">Login</option>
          <option value="register">Register</option>
          <option value="track_property">Track Property</option>
          <option value="update_price">Update Price</option>
          <option value="create_property">Create Property</option>
          <option value="update_property">Update Property</option>
        </select>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No activities found</div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl flex-shrink-0">{getActionIcon(activity.action)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {activity.user.image ? (
                    <Image
                      src={activity.user.image}
                      alt={activity.user.name || activity.user.email}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                      {(activity.user.name || activity.user.email)[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-gray-900 text-sm">
                    {activity.user.name || activity.user.email}
                  </span>
                  <span className="text-xs text-gray-500">({activity.user.role})</span>
                </div>
                <p className="text-sm text-gray-700">{getActionLabel(activity.action, activity.metadata)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


