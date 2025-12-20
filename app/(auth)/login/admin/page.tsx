"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("=== LOGIN START ===");
    console.log("Form submitted!", { email, password: "***" });
    setError("");
    setLoading(true);

    try {
      console.log("Calling signIn...");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("SignIn error:", result.error);
        setError(`Invalid email or password. Error: ${result.error}`);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("SignIn successful, waiting for session...");
        // Wait for session to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update session
        console.log("Updating session...");
        await update();
        
        // Wait a bit more
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check session role
        console.log("Fetching session...");
        const sessionRes = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const sessionData = await sessionRes.json();
        
        console.log("Session data:", sessionData);
        
        if (sessionData?.user?.role === "ADMIN") {
          console.log("Admin role confirmed, redirecting...");
          // Use window.location for reliable redirect
          window.location.href = "/dashboard";
        } else {
          console.log("Not admin, role:", sessionData?.user?.role);
          setError(`Access denied. Admin credentials required. (Role: ${sessionData?.user?.role || 'none'})`);
          await fetch("/api/auth/signout", { method: "POST" });
          setLoading(false);
        }
      } else {
        console.log("SignIn not OK:", result);
        setError("Login failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-3 sm:px-4 py-8 sm:py-20">
        <div className="bg-black/70 backdrop-blur-md rounded-lg p-4 sm:p-6 md:p-8 max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
            🔐 Admin Portal
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-danger/20 border border-danger rounded text-danger text-sm">
              {error}
            </div>
          )}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }} 
            className="space-y-4"
          >
                <div>
                  <label className="block text-white mb-2 text-sm sm:text-base">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-white/60 focus:outline-none focus:border-primary min-h-[44px]"
                    placeholder="admin@example.com"
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
                  className="w-full px-6 py-3 sm:py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 cursor-pointer text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
          </form>
          <div className="mt-6 text-center text-white/60 text-sm">
            ⚠️ Admin access only
          </div>
        </div>
      </div>
    </div>
  );
}
