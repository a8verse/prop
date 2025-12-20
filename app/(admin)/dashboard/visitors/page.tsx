"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Visitor {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  lastLogin: Date | null;
  _count: {
    ratings: number;
    trackedProperties: number;
    pageViews: number;
  };
}

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetch("/api/visitors");
      const data = await res.json();
      setVisitors(data);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visitor? This will also delete all their ratings and tracked properties.")) {
      return;
    }

    try {
      const res = await fetch(`/api/visitors/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Visitor deleted successfully!");
        fetchVisitors();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete visitor: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting visitor:", error);
      alert("An error occurred while deleting visitor.");
    }
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (visitor.name && visitor.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Visitors</h1>
        <div className="flex gap-4">
          <a
            href="/api/export/visitors"
            download
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Export to Excel
          </a>
          <input
            type="text"
            placeholder="Search visitors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ratings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tracked</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Profile Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVisitors.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery ? "No visitors found matching your search" : "No visitors found"}
                </td>
              </tr>
            ) : (
              filteredVisitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {visitor.image ? (
                        <img
                          src={visitor.image}
                          alt={visitor.name || visitor.email}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-3">
                          {(visitor.name || visitor.email)[0].toUpperCase()}
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {visitor.name || "No name"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{visitor.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {visitor._count.ratings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {visitor._count.trackedProperties}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {visitor._count.pageViews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(visitor.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {visitor.lastLogin ? format(new Date(visitor.lastLogin), "MMM d, yyyy") : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/dashboard/visitors/${visitor.id}`}
                        className="text-primary hover:text-primary-dark"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(visitor.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Visitor Details</h2>
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{selectedVisitor.name || "No name"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedVisitor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Ratings Given</label>
                  <p className="text-gray-900">{selectedVisitor._count.ratings}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tracked Properties</label>
                  <p className="text-gray-900">{selectedVisitor._count.trackedProperties}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Page Views</label>
                  <p className="text-gray-900">{selectedVisitor._count.pageViews}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Joined</label>
                  <p className="text-gray-900">
                    {format(new Date(selectedVisitor.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

