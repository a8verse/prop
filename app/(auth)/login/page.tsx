"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") || "visitor";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: type === "admin" ? "/dashboard" : type === "cp" ? "/cp" : "/",
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        // Wait a bit for session to be set, then redirect
        setTimeout(() => {
          if (type === "admin") {
            window.location.href = "/dashboard";
          } else if (type === "cp") {
            window.location.href = "/cp";
          } else {
            window.location.href = "/";
          }
        }, 100);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    signIn(provider, { callbackUrl: "/" });
  };

  if (type === "visitor") {
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
        <div className="relative z-10">
          <Header />
          <Navigation />
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-3 sm:px-4 pt-20 sm:pt-24">
            <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
                Welcome Back
              </h2>
              <p className="text-white/60 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                Login with your social account to continue
              </p>
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => handleSocialLogin("google")}
                  className="w-full px-4 sm:px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-3 shadow-lg text-sm sm:text-base min-h-[44px]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button
                  onClick={() => handleSocialLogin("facebook")}
                  className="w-full px-4 sm:px-6 py-3 bg-[#1877F2] text-white font-semibold rounded-lg hover:bg-[#166FE5] transition-colors flex items-center justify-center gap-3 shadow-lg text-sm sm:text-base min-h-[44px]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>
              </div>
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-white/60 text-xs sm:text-sm mb-2">
                  No account needed! Quick login with social media
                </p>
                <Link href="/register-cp?type=visitor" className="text-primary hover:text-primary-light text-xs sm:text-sm font-medium">
                  Or register as visitor →
                </Link>
              </div>
            </div>
          </div>
        </div>
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
      <div className="relative z-10">
        <Header />
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-3 sm:px-4">
          <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
              {type === "cp" ? "Channel Partner Login" : "Admin Portal"}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-danger/20 border border-danger rounded text-danger text-xs sm:text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm sm:text-base">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-white mb-2 text-sm sm:text-base">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="flex items-center text-white/80 text-xs sm:text-sm">
                  <input type="checkbox" className="mr-2 w-4 h-4" />
                  Remember me
                </label>
                <a href="#" className="text-primary hover:text-primary-light text-xs sm:text-sm">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 text-sm sm:text-base min-h-[44px] flex items-center justify-center"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            {type === "cp" && (
              <div className="mt-4 sm:mt-6 text-center text-white/60 text-xs sm:text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register-cp" className="text-primary hover:text-primary-light">
                  Register as Channel Partner
                </a>
              </div>
            )}
            {type === "admin" && (
              <div className="mt-4 sm:mt-6 text-center text-white/60 text-xs sm:text-sm">
                ⚠️ Admin access only
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

