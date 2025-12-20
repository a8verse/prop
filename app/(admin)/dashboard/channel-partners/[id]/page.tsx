"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface ChannelPartnerDetail {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  phone: string;
  city: string;
  state: string;
  reraNumber: string | null;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    lastLogin: Date | null;
  };
}

interface Activity {
  id: string;
  action: string;
  metadata: any;
  createdAt: Date;
}

interface PageView {
  id: string;
  propertyId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  property: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface TrackedProperty {
  id: string;
  propertyId: string;
  createdAt: Date;
  property: {
    id: string;
    name: string;
    slug: string;
    price: number;
    priceHistory: Array<{
      price: number;
      change: number | null;
      isIncrease: boolean;
      createdAt: Date;
    }>;
  };
}

export default function ChannelPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cp, setCp] = useState<ChannelPartnerDetail | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [trackedProperties, setTrackedProperties] = useState<TrackedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      const [cpRes, activitiesRes, pageViewsRes, trackedRes] = await Promise.all([
        fetch(`/api/channel-partners/user/${params.id}`),
        fetch(`/api/user-activity/${params.id}`),
        fetch(`/api/visitors/${params.id}/page-views`),
        fetch(`/api/visitors/${params.id}/tracked-properties`),
      ]);

      if (cpRes.ok) {
        const cpData = await cpRes.json();
        setCp(cpData);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }

      if (pageViewsRes.ok) {
        const pageViewsData = await pageViewsRes.json();
        setPageViews(pageViewsData);
      }

      if (trackedRes.ok) {
        const trackedData = await trackedRes.json();
        setTrackedProperties(trackedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  if (!cp) {
    return <div className="text-red-600">Channel Partner not found</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/channel-partners"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Channel Partners
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {cp.firstName} {cp.lastName}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{cp.user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{cp.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Company Name</label>
              <p className="text-gray-900">{cp.companyName || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>
              <p className="text-gray-900">{cp.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>
              <p className="text-gray-900">{cp.state}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">RERA Number</label>
              <p className="text-gray-900">{cp.reraNumber || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <p className={`font-semibold ${
                cp.status === "APPROVED" ? "text-green-600" :
                cp.status === "PENDING" ? "text-yellow-600" :
                cp.status === "SUSPENDED" ? "text-red-600" :
                "text-gray-600"
              }`}>
                {cp.status}
              </p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Profile Created</label>
              <p className="text-gray-900">{format(new Date(cp.user.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Login</label>
              <p className="text-gray-900">
                {cp.user.lastLogin ? format(new Date(cp.user.lastLogin), "MMM d, yyyy 'at' h:mm a") : "Never"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Registration Date</label>
              <p className="text-gray-900">{format(new Date(cp.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Activity Logs ({activities.length})</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-gray-500">No activities recorded</p>
          ) : (
            activities.map((activity) => {
              const metadata = activity.metadata || {};
              const getActionLabel = (action: string) => {
                switch (action) {
                  case "view_property":
                    return `Viewed: ${metadata.propertyName || "Property"}`;
                  case "submit_rating":
                    return `Rated: ${metadata.propertyName || "Property"} (${metadata.rating || 0} stars)`;
                  case "login":
                    return "Logged in";
                  case "search":
                    return `Searched: "${metadata.searchQuery || ""}"`;
                  case "track_property":
                    return `Tracked: ${metadata.propertyName || "Property"}`;
                  default:
                    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                }
              };
              
              return (
                <div key={activity.id} className="border-b border-gray-200 pb-3 pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-900 font-medium">{getActionLabel(activity.action)}</span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {metadata.ipAddress && (
                      <span>IP: {metadata.ipAddress}</span>
                    )}
                    {metadata.userAgent && (
                      <span className="truncate max-w-xs" title={metadata.userAgent}>
                        Device: {metadata.userAgent.split(" ")[0]}
                      </span>
                    )}
                    {metadata.searchQuery && (
                      <span>Query: &quot;{metadata.searchQuery}&quot; ({metadata.resultCount || 0} results)</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Page Views */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Page Views ({pageViews.length})</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {pageViews.length === 0 ? (
            <p className="text-gray-500">No page views recorded</p>
          ) : (
            pageViews.map((view) => (
              <div key={view.id} className="border-b border-gray-200 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-900 font-medium">
                      {view.property ? view.property.name : "Homepage"}
                    </span>
                    {view.ipAddress && (
                      <span className="text-gray-500 text-sm ml-2">IP: {view.ipAddress}</span>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {format(new Date(view.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tracked Properties */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Tracked Properties ({trackedProperties.length})</h2>
        {trackedProperties.length === 0 ? (
          <p className="text-gray-500">No tracked properties</p>
        ) : (
          <div className="space-y-4">
            {trackedProperties.map((track) => {
              const latestPrice = track.property.priceHistory[0];
              return (
                <div key={track.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/projects/${track.property.slug}`}
                        className="text-primary hover:text-primary-dark font-semibold"
                      >
                        {track.property.name}
                      </Link>
                      <p className="text-gray-600 text-sm mt-1">
                        Current Price: ₹{track.property.price.toLocaleString('en-IN')}
                      </p>
                      {latestPrice && (
                        <p className={`text-sm mt-1 ${
                          latestPrice.isIncrease ? "text-green-600" : "text-red-600"
                        }`}>
                          {latestPrice.isIncrease ? "↑" : "↓"} {latestPrice.change?.toFixed(1)}%
                        </p>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      Tracked: {format(new Date(track.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

