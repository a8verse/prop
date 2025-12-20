"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PencilIcon, TrashIcon, PlusIcon, NoSymbolIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface Builder {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  contactInfo: any;
  isSuspended: boolean;
  createdAt: Date;
  _count: {
    properties: number;
  };
}

export default function BuildersPage() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    try {
      const res = await fetch("/api/builders");
      const data = await res.json();
      setBuilders(data);
    } catch (error) {
      console.error("Error fetching builders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this builder? This will also delete all associated properties.")) {
      return;
    }

    try {
      const res = await fetch(`/api/builders/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Builder deleted successfully!");
        fetchBuilders();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete builder: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting builder:", error);
      alert("An error occurred while deleting builder.");
    }
  };

  const handleToggleSuspend = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/builders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !currentStatus }),
      });

      if (res.ok) {
        alert(`Builder ${!currentStatus ? "suspended" : "activated"} successfully!`);
        fetchBuilders();
      } else {
        const errorData = await res.json();
        alert(`Failed to update builder: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error toggling suspend:", error);
      alert("An error occurred while updating builder.");
    }
  };

  const filteredBuilders = builders.filter((builder) =>
    builder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Builders</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search builders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
          />
          <Link
            href="/dashboard/builders/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Add Builder
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Website</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Properties</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBuilders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery ? "No builders found matching your search" : "No builders found"}
                </td>
              </tr>
            ) : (
              filteredBuilders.map((builder) => (
                <tr key={builder.id} className={`hover:bg-gray-50 transition-colors ${builder.isSuspended ? "bg-red-50" : ""}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {builder.logo ? (
                      <div className="relative w-12 h-12">
                        <Image
                          src={builder.logo}
                          alt={builder.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Logo
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{builder.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {builder.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {builder.website ? (
                      <a
                        href={builder.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark text-sm"
                      >
                        Visit Website
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No website</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {builder._count.properties}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(builder.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/dashboard/builders/${builder.id}`}
                        className="text-primary hover:text-primary-dark"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleToggleSuspend(builder.id, builder.isSuspended)}
                        className={builder.isSuspended ? "text-green-500 hover:text-green-600" : "text-orange-500 hover:text-orange-600"}
                        title={builder.isSuspended ? "Activate" : "Suspend"}
                      >
                        {builder.isSuspended ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <NoSymbolIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(builder.id)}
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
    </div>
  );
}

