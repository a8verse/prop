"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

interface Property {
  id: string;
  name: string;
  price: number;
  type: string;
  seller: string | null;
  createdAt: string;
  updatedAt: string;
  builder: { name: string };
  location: { name: string };
  category: { name: string };
  isFeatured: boolean;
  isHidden: boolean;
  _count: { pageViews: number };
}

interface Filter {
  type: string;
  builder: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  sortOrder: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState("");
  const [builders, setBuilders] = useState<Array<{ id: string; name: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter>({
    type: "",
    builder: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchProperties();
    fetchBuilders();
    fetchLocations();
    fetchTypes();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.builder) params.append("builder", filters.builder);
      if (filters.location) params.append("location", filters.location);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuilders = async () => {
    try {
      const res = await fetch("/api/builders");
      const data = await res.json();
      setBuilders(data);
    } catch (error) {
      console.error("Error fetching builders:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      const uniqueTypes = [...new Set(data.map((p: Property) => p.type))];
      setTypes(uniqueTypes.filter((type): type is string => typeof type === 'string' && Boolean(type)));
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  const handlePriceEdit = (property: Property) => {
    setEditingPriceId(property.id);
    setEditingPrice(property.price.toString());
  };

  const handlePriceSave = async (propertyId: string) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parseFloat(editingPrice) }),
      });

      if (res.ok) {
        fetchProperties();
        setEditingPriceId(null);
        setEditingPrice("");
      } else {
        const error = await res.json();
        alert(error.error || "Error updating price");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Error updating price");
    }
  };

  const handlePriceCancel = () => {
    setEditingPriceId(null);
    setEditingPrice("");
  };

  const handleToggleHide = async (propertyId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !currentStatus }),
      });

      if (res.ok) {
        alert(`Property ${!currentStatus ? "hidden" : "shown"} successfully!`);
        fetchProperties();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update property");
      }
    } catch (error) {
      console.error("Error toggling hide:", error);
      alert("An error occurred while updating property");
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Property deleted successfully!");
        fetchProperties();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("An error occurred while deleting property");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <div className="flex gap-4">
          <a
            href="/api/export/properties"
            download
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Export to Excel
          </a>
          <Link
            href="/dashboard/properties/new"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
          >
            Add Property
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white text-sm"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Builder</label>
            <select
              value={filters.builder}
              onChange={(e) => setFilters({ ...filters, builder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white text-sm"
            >
              <option value="">All Builders</option>
              {builders.map((builder) => (
                <option key={builder.id} value={builder.name}>
                  {builder.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white text-sm"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="999999999"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters({ ...filters, sortBy, sortOrder });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white text-sm"
            >
              <option value="updatedAt-desc">Last Update (Newest)</option>
              <option value="updatedAt-asc">Last Update (Oldest)</option>
              <option value="createdAt-desc">Date Listed (Newest)</option>
              <option value="createdAt-asc">Date Listed (Oldest)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="price-asc">Price (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Name</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Type</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Builder</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Location</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Price</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Seller</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Date Listed</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Last Update</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Views</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Featured</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Status</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                    No properties found
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr
                    key={property.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${property.isHidden ? "bg-yellow-50" : ""}`}
                  >
                    <td className="px-6 py-4 text-gray-900 text-sm">{property.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{property.type}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{property.builder.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{property.location.name}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingPriceId === property.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-900 bg-white text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => handlePriceSave(property.id)}
                            className="text-green-600 hover:text-green-700 text-sm"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handlePriceCancel}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-semibold">
                            ₹{property.price.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handlePriceEdit(property)}
                            className="text-gray-400 hover:text-primary text-xs"
                            title="Edit Price"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{property.seller || "-"}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(property.createdAt)}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(property.updatedAt)}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{property._count?.pageViews || 0}</td>
                    <td className="px-6 py-4">
                      {property.isFeatured ? (
                        <span className="text-success text-sm">Yes</span>
                      ) : (
                        <span className="text-gray-400 text-sm">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {property.isHidden ? (
                        <span className="text-orange-600 text-sm font-semibold">Hidden</span>
                      ) : (
                        <span className="text-green-600 text-sm">Visible</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/properties/${property.id}`}
                          className="text-primary hover:text-primary-dark"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleToggleHide(property.id, property.isHidden)}
                          className={property.isHidden ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}
                          title={property.isHidden ? "Show Property" : "Hide Property"}
                        >
                          {property.isHidden ? (
                            <EyeIcon className="w-5 h-5" />
                          ) : (
                            <EyeSlashIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="text-red-500 hover:text-red-600"
                          title="Delete Property"
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
    </div>
  );
}
