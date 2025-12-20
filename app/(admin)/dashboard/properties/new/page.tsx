"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  subCategories: Array<{ id: string; name: string }>;
}

interface Builder {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    size: "",
    price: "",
    seller: "",
    categoryId: "",
    subCategoryId: "",
    builderId: "",
    locationId: "",
    isFeatured: false,
    // SEO Fields
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary",
    canonicalUrl: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchBuilders();
    fetchLocations();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  const handleCreateBuilder = async (name: string, logo: string) => {
    try {
      const res = await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo }),
      });
      if (res.ok) {
        const newBuilder = await res.json();
        setBuilders([...builders, newBuilder]);
        setFormData({ ...formData, builderId: newBuilder.id });
        alert("Builder created successfully!");
      } else {
        alert("Error creating builder");
      }
    } catch (error) {
      console.error("Error creating builder:", error);
      alert("Error creating builder");
    }
  };

  const handleAddNewLocation = async () => {
    const name = prompt("Enter location name:");
    if (!name) return;

    const city = prompt("Enter city (optional):");
    const state = prompt("Enter state (optional):");

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city: city || null, state: state || null }),
      });
      if (res.ok) {
        const newLocation = await res.json();
        setLocations([...locations, newLocation]);
        setFormData({ ...formData, locationId: newLocation.id });
        alert("Location created successfully!");
      } else {
        alert("Error creating location");
      }
    } catch (error) {
      console.error("Error creating location:", error);
      alert("Error creating location");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to create property");
        return;
      }

      router.push("/dashboard/properties");
    } catch (error) {
      console.error("Error creating property:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/properties"
          className="text-primary hover:text-primary-dark mb-4 inline-block"
        >
          ← Back to Properties
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Add New Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Property Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Type *</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              placeholder="e.g., Flat, House, Plot"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Size</label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="e.g., 3BHK, 1500 sqft"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Price (₹) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Seller (Admin Only)</label>
            <input
              type="text"
              value={formData.seller}
              onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Category *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, subCategoryId: "" })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Sub Category</label>
            <select
              value={formData.subCategoryId}
              onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
              disabled={!selectedCategory}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 text-gray-900 bg-white"
            >
              <option value="">Select Sub Category</option>
              {selectedCategory?.subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700">Builder *</label>
              <button
                type="button"
                onClick={() => {
                  const name = prompt("Enter builder name:");
                  if (name) {
                    const logo = prompt("Enter builder logo URL (optional):");
                    handleCreateBuilder(name, logo || "");
                  }
                }}
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                + Add New Builder
              </button>
            </div>
            <select
              value={formData.builderId}
              onChange={(e) => setFormData({ ...formData, builderId: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            >
              <option value="">Select Builder</option>
              {builders.map((builder) => (
                <option key={builder.id} value={builder.id}>
                  {builder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Location *</label>
            <div className="flex gap-2">
              <select
                value={formData.locationId}
                onChange={async (e) => {
                  if (e.target.value === "new") {
                    await handleAddNewLocation();
                    // Reset select to empty after adding
                    const select = e.target as HTMLSelectElement;
                    setTimeout(() => {
                      select.value = formData.locationId || "";
                    }, 100);
                  } else {
                    setFormData({ ...formData, locationId: e.target.value });
                  }
                }}
                required={!formData.locationId}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
                <option value="new">+ Add New Location</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700">Feature this property on homepage</span>
            </label>
          </div>
        </div>

        {/* SEO Section */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Meta Title
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.metaTitle.length}/60 recommended)
                </span>
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                maxLength={60}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="SEO optimized title (max 60 characters)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Meta Description
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.metaDescription.length}/160 recommended)
                </span>
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                rows={3}
                maxLength={160}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="SEO description (max 160 characters)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Meta Keywords (comma-separated)</label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">OG Title</label>
              <input
                type="text"
                value={formData.ogTitle}
                onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="Open Graph title for social sharing"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">OG Image URL</label>
              <input
                type="url"
                value={formData.ogImage}
                onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">OG Description</label>
              <textarea
                value={formData.ogDescription}
                onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="Open Graph description for social sharing"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Twitter Card Type</label>
              <select
                value={formData.twitterCard}
                onChange={(e) => setFormData({ ...formData, twitterCard: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Canonical URL</label>
              <input
                type="url"
                value={formData.canonicalUrl}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="https://example.com/property-page"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Property"}
          </button>
          <Link
            href="/dashboard/properties"
            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

