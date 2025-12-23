"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function SettingsPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("smtp");

  const settingsTabs = [
    { id: "general", name: "General Settings", icon: "⚙️" },
    { id: "smtp", name: "SMTP Settings", icon: "📧" },
    { id: "social", name: "Social Media", icon: "🔗" },
    { id: "email-templates", name: "Email Templates", icon: "📝" },
    { id: "backup", name: "Backup & Restore", icon: "💾" },
  ];

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <div className="w-64 bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-fit sticky top-24">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
        <nav className="space-y-2">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "smtp" && <SMTPSettings />}
        {activeTab === "social" && <SocialMediaSettings />}
        {activeTab === "email-templates" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Templates</h1>
            <p className="text-gray-600 mb-4">Email templates are managed on a separate page</p>
            <Link
              href="/dashboard/settings/email-templates"
              className="text-primary hover:text-primary-dark"
            >
              Go to Email Templates →
            </Link>
          </div>
        )}
        {activeTab === "backup" && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Backup & Restore</h1>
            <p className="text-gray-600 mb-4">Backup functionality is available on a separate page</p>
            <Link
              href="/dashboard/settings/backup"
              className="text-primary hover:text-primary-dark"
            >
              Go to Backup Page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SMTPSettings() {
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    secure: true,
    user: "",
    password: "",
    fromEmail: "",
    fromName: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement SMTP settings save
    setTimeout(() => {
      alert("SMTP settings saved!");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">SMTP Settings</h1>
      <p className="text-gray-600 mb-6">Configure email server settings for sending emails</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
            <input
              type="text"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              placeholder="587"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
            <input
              type="text"
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.secure}
            onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
            className="mr-2"
          />
          <label className="text-sm text-gray-700">Use SSL/TLS</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save SMTP Settings"}
        </button>
      </form>
    </div>
  );
}

function GeneralSettings() {
  const [formData, setFormData] = useState({
    logo: "",
    logoBgColor: "#eae5d7",
    logoBgTransparent: false,
    contactEmail: "hello@oliofly.com",
    contactPhone: "+919999999999",
    heroText: "Live The Luxury You Deserve",
    ctaText: "Explore Properties",
    ctaLink: "/projects",
    homeBackgroundImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [emailRes, phoneRes, logoRes, heroRes, backgroundRes] = await Promise.all([
        fetch("/api/site-settings?key=contact_email"),
        fetch("/api/site-settings?key=contact_phone"),
        fetch("/api/site-settings?key=logo"),
        fetch("/api/site-settings?key=hero_section"),
        fetch("/api/site-settings?key=home_background_image"),
      ]);

      const emailData = emailRes.ok ? await emailRes.json() : null;
      const phoneData = phoneRes.ok ? await phoneRes.json() : null;
      const logoData = logoRes.ok ? await logoRes.json() : null;
      const heroData = heroRes.ok ? await heroRes.json() : null;
      const backgroundData = backgroundRes.ok ? await backgroundRes.json() : null;

      // Handle logo - can be base64 string or object
      const logoValue = logoData?.value;
      const logoUrl = typeof logoValue === 'string' && logoValue.startsWith('data:')
        ? logoValue
        : (typeof logoValue === 'object' && logoValue !== null ? logoValue.logo : logoValue) || "";

      setFormData({
        logo: logoUrl,
        logoBgColor: (typeof logoValue === 'object' && logoValue !== null) ? (logoValue.logoBgColor || "#eae5d7") : "#eae5d7",
        logoBgTransparent: (typeof logoValue === 'object' && logoValue !== null) ? (logoValue.logoBgTransparent || false) : false,
        contactEmail: emailData?.value || "hello@oliofly.com",
        contactPhone: phoneData?.value || "+919999999999",
        heroText: heroData?.value?.heroText || heroData?.heroText || "Live The Luxury You Deserve",
        ctaText: heroData?.value?.ctaText || heroData?.ctaText || "Explore Properties",
        ctaLink: heroData?.value?.ctaLink || heroData?.ctaLink || "/projects",
        homeBackgroundImage: backgroundData?.value || "",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, logo: data.url }));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploadingBackground(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "background");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, homeBackgroundImage: data.url }));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload background image");
      }
    } catch (error) {
      console.error("Error uploading background:", error);
      alert("Failed to upload background image");
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        fetch("/api/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "contact_email", value: formData.contactEmail }),
        }),
        fetch("/api/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "contact_phone", value: formData.contactPhone }),
        }),
        fetch("/api/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "logo",
            value: formData.logo.startsWith('data:') 
              ? formData.logo 
              : {
                  logo: formData.logo,
                  logoBgColor: formData.logoBgColor,
                  logoBgTransparent: formData.logoBgTransparent,
                },
          }),
        }),
        fetch("/api/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "hero_section",
            value: {
              heroText: formData.heroText,
              ctaText: formData.ctaText,
              ctaLink: formData.ctaLink,
            },
          }),
        }),
        fetch("/api/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "home_background_image",
            value: formData.homeBackgroundImage,
          }),
        }),
      ]);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">General Settings</h1>
      <p className="text-gray-600 mb-6">Manage site-wide settings</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Settings */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
              />
              {uploadingLogo && (
                <p className="text-sm text-gray-500 mt-1">Uploading...</p>
              )}
              {formData.logo && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Current logo:</p>
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="max-w-xs max-h-20 object-contain border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Background Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={formData.logoBgColor}
                  onChange={(e) => setFormData({ ...formData, logoBgColor: e.target.value })}
                  className="w-20 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={formData.logoBgColor}
                  onChange={(e) => setFormData({ ...formData, logoBgColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.logoBgTransparent}
                onChange={(e) => setFormData({ ...formData, logoBgTransparent: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">No Background Color</label>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Header)
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Header)
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Hero Section Settings */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Text
              </label>
              <input
                type="text"
                value={formData.heroText}
                onChange={(e) => setFormData({ ...formData, heroText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="Live The Luxury You Deserve"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="Explore Properties"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CTA Button Link
              </label>
              <input
                type="text"
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
                placeholder="/projects"
              />
            </div>
          </div>
        </div>

        {/* Home Background Image */}
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Home Page Background</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                disabled={uploadingBackground}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
              />
              {uploadingBackground && (
                <p className="text-sm text-gray-500 mt-1">Uploading...</p>
              )}
              {formData.homeBackgroundImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Current background:</p>
                  <img
                    src={formData.homeBackgroundImage}
                    alt="Background preview"
                    className="max-w-md max-h-40 object-cover border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

function SocialMediaSettings() {
  const [socialLinks, setSocialLinks] = useState<Array<{ name: string; url: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "" });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const res = await fetch("/api/site-settings/social-links");
      const data = await res.json();
      setSocialLinks(data);
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  const handleAdd = async () => {
    if (!newLink.name || !newLink.url) {
      alert("Please fill in both name and URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/site-settings/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLink),
      });

      if (res.ok) {
        setNewLink({ name: "", url: "" });
        fetchSocialLinks();
      } else {
        const error = await res.json();
        alert(error.error || "Error adding social link");
      }
    } catch (error) {
      console.error("Error adding social link:", error);
      alert("Error adding social link");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm("Are you sure you want to delete this social link?")) return;

    try {
      const res = await fetch(`/api/site-settings/social-links?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSocialLinks();
      } else {
        const error = await res.json();
        alert(error.error || "Error deleting social link");
      }
    } catch (error) {
      console.error("Error deleting social link:", error);
      alert("Error deleting social link");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Social Media Settings</h1>
      <p className="text-gray-600 mb-6">Manage social media links displayed in the menu bar</p>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newLink.name}
            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
            placeholder="Name (e.g., Facebook)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
          />
          <input
            type="url"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="URL"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
          />
          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>

        <div className="space-y-2">
          {socialLinks.map((link, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{link.name}</div>
                <div className="text-sm text-gray-600">{link.url}</div>
              </div>
              <button
                onClick={() => handleDelete(link.name)}
                className="text-red-500 hover:text-red-600 px-3 py-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


