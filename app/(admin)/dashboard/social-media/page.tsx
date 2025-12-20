"use client";

import { useState, useEffect } from "react";

interface SocialLink {
  name: string;
  url: string;
}

export default function SocialMediaManagementPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { name: "Facebook", url: "" },
    { name: "Instagram", url: "" },
    { name: "YouTube", url: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const res = await fetch("/api/site-settings/social-links");
      const data = await res.json();
      if (data && Array.isArray(data) && data.length > 0) {
        setSocialLinks(data);
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: "name" | "url", value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/site-settings/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialLinks),
      });

      if (res.ok) {
        alert("Social media links saved successfully!");
      } else {
        alert("Error saving social media links");
      }
    } catch (error) {
      console.error("Error saving social links:", error);
      alert("Error saving social media links");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Management</h1>
        <p className="text-gray-600">Manage social media links displayed in the menu bar</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
                    placeholder="e.g., Facebook, Instagram, YouTube"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleChange(index, "url", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

