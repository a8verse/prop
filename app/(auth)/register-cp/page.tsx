"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";

export default function RegisterCPPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    state: "",
    companyName: "",
    reraNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Fetch header/navigation data
  const [email, setEmail] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [socialLinks, setSocialLinks] = useState<Array<{ name: string; url: string }>>([]);

  useEffect(() => {
    // Fetch categories, contact info, and social links
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await fetch("/api/categories");
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.filter((cat: any) => cat.showInMenu !== false));
        }

        // Fetch site settings
        const [emailRes, phoneRes, socialRes] = await Promise.all([
          fetch("/api/settings/contact_email"),
          fetch("/api/settings/contact_phone"),
          fetch("/api/settings/social_links"),
        ]);

        if (emailRes.ok) {
          const emailData = await emailRes.json();
          setEmail(emailData.value);
        }
        if (phoneRes.ok) {
          const phoneData = await phoneRes.json();
          setPhone(phoneData.value);
        }
        if (socialRes.ok) {
          const socialData = await socialRes.json();
          setSocialLinks(socialData.value || []);
        }
      } catch (error) {
        console.error("Error fetching header data:", error);
        // Use defaults
        setEmail("hello@oliofly.com");
        setPhone("+919999999999");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-cp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // OTP sent, move to verification step
      setUserId(data.userId);
      setOtpSent(true);
      setStep("otp");
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "OTP verification failed");
        setLoading(false);
        return;
      }

      // Show success dialog
      alert("Your profile is created successfully! Once review is completed, we will notify you about activation within 6-12 hours.");
      router.push("/login?type=cp&registered=true");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-30" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - Logo (Left), Search (Center), Email/Phone (Right) - Fully Transparent */}
        <Header email={email} phone={phone} />
        
        {/* Menu Bar - Categories (Left), Social Icons + Burger Menu (Right) - Blurred Background */}
        <Navigation categories={categories} socialLinks={socialLinks} />
        
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12" style={{ paddingTop: '100px' }}>
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 sm:p-6 md:p-8 max-w-2xl w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
              Register as Channel Partner
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-danger/20 border border-danger rounded text-danger text-sm">
                {error}
              </div>
            )}
            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-white mb-2 text-sm sm:text-base">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 text-sm sm:text-base">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">Confirm Password *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>
              </div>

                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-white mb-2 text-sm sm:text-base">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 text-sm sm:text-base">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">Company Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">RERA Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.reraNumber}
                    onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPVerify} className="space-y-3 sm:space-y-4">
                <div className="text-center mb-4">
                  <p className="text-white mb-2 text-sm sm:text-base">We&apos;ve sent a 6-digit OTP to your email:</p>
                  <p className="text-primary font-semibold text-sm sm:text-base break-all">{formData.email}</p>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">Enter OTP *</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-primary text-center text-xl sm:text-2xl tracking-widest min-h-[44px]"
                    placeholder="000000"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                >
                  Back
                </button>
              </form>
            )}

            <div className="mt-4 sm:mt-6 text-center text-white/60 text-xs sm:text-sm">
              Already have an account?{" "}
              <a href="/login?type=cp" className="text-primary hover:text-primary-light">
                Login here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

