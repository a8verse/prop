"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SliderImage {
  id: string;
  imageUrl: string;
  link?: string | null;
  title?: string | null;
  order: number;
  isActive: boolean;
}

export default function SliderManagementPage() {
  const router = useRouter();
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    link: "",
    title: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/slider-images");
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "slider");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        alert(error.error || "Upload failed");
        setUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();
      setFormData({ ...formData, imageUrl: uploadData.url || uploadData.path });
      setUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading image");
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert("Please upload an image");
      return;
    }

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/slider-images/${editing}` : "/api/slider-images";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchImages();
        setEditing(null);
        setFormData({ imageUrl: "", link: "", title: "", order: 0, isActive: true });
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const error = await res.json();
        alert(error.error || "Error saving image");
      }
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Error saving image");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const res = await fetch(`/api/slider-images/${id}`, { method: "DELETE" });
      if (res.ok) fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleEdit = (image: SliderImage) => {
    setEditing(image.id);
    setFormData({
      imageUrl: image.imageUrl,
      link: image.link || "",
      title: image.title || "",
      order: image.order,
      isActive: image.isActive,
    });
    setPreview(image.imageUrl);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Slider Management</h1>
        <p className="text-gray-600">Manage homepage bottom slider images</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editing ? "Edit Image" : "Add New Image"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-500 mt-1">Uploading...</p>
              )}
              {preview && (
                <div className="mt-2 relative w-full h-32">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover rounded border border-gray-300"
                  />
                </div>
              )}
              {formData.imageUrl && !preview && (
                <div className="mt-2 relative w-full h-32">
                  <Image
                    src={formData.imageUrl}
                    alt="Current"
                    fill
                    className="object-cover rounded border border-gray-300"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL (optional)
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                {editing ? "Update" : "Add"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setFormData({ imageUrl: "", link: "", title: "", order: 0, isActive: true });
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Slider Images ({images.length})</h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {images.map((image) => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-16 flex-shrink-0">
                    <Image
                      src={image.imageUrl}
                      alt={image.title || "Slider image"}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{image.title || "No title"}</div>
                    <div className="text-sm text-gray-600 truncate">{image.link || "No link"}</div>
                    <div className="text-xs text-gray-500">Order: {image.order} | {image.isActive ? "Active" : "Inactive"}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(image)}
                      className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-light"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

