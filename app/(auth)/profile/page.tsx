"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Suspense } from "react";

async function getLayoutData() {
  const { prisma } = await import("@/lib/prisma");
  
  let categories: Array<{ id: string; name: string; slug: string }> = [];
  let email: string | undefined;
  let phone: string | undefined;
  let socialLinks: Array<{ name: string; url: string }> = [];
  let sliderImages: any[] = [];

  try {
    const allCategories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    categories = allCategories.filter((cat: any) => cat.showInMenu !== false);

    const emailSetting = await prisma.siteSettings.findUnique({
      where: { key: "contact_email" },
    });
    const phoneSetting = await prisma.siteSettings.findUnique({
      where: { key: "contact_phone" },
    });
    const socialLinksSetting = await prisma.siteSettings.findUnique({
      where: { key: "social_links" },
    });

    email = emailSetting?.value as string | undefined;
    phone = phoneSetting?.value as string | undefined;
    socialLinks = (socialLinksSetting?.value as Array<{ name: string; url: string }>) || [];

    sliderImages = await prisma.sliderImage.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Error fetching layout data:", error);
  }

  return { categories, email, phone, socialLinks, sliderImages };
}

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [layoutData, setLayoutData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    getLayoutData().then(setLayoutData);
    setFormData({
      name: session.user.name || "",
      email: session.user.email || "",
      image: session.user.image || "",
    });
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Profile updated successfully!");
        // Refresh session to get updated data
        window.location.reload();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || !layoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header email={layoutData.email || "hello@oliofly.com"} phone={layoutData.phone || "+919999999999"} />
        <Navigation categories={layoutData.categories} socialLinks={layoutData.socialLinks} />

        <main className="flex-1 max-w-4xl mx-auto px-4 md:px-8 py-8 pt-[100px] w-full">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-white/10">
            <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200 mb-4">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  {formData.image ? (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden">
                      <Image
                        src={formData.image}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                      No Image
                    </div>
                  )}
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>

        <Footer images={layoutData.sliderImages} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>}>
      <ProfileContent />
    </Suspense>
  );
}

