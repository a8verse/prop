"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    // Check if 2FA is enabled
    fetch("/api/user/2fa/status")
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.enabled || false);
      })
      .catch(console.error);
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/2fa/setup", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
      }
    } catch (error) {
      console.error("Error setting up 2FA:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, secret }),
      });

      if (res.ok) {
        alert("2FA enabled successfully!");
        setEnabled(true);
        setQrCode("");
        setSecret("");
        setVerificationCode("");
      } else {
        const error = await res.json();
        alert(error.error || "Verification failed");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      alert("Error verifying code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("Are you sure you want to disable 2FA?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
      });

      if (res.ok) {
        alert("2FA disabled successfully!");
        setEnabled(false);
      } else {
        const error = await res.json();
        alert(error.error || "Error disabling 2FA");
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      alert("Error disabling 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/profile" className="text-primary hover:text-primary-dark mb-4 inline-block">
          ← Back to Profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Two-Factor Authentication</h1>
        <p className="text-gray-600">Secure your account with 2FA</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {enabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <span className="text-xl">✓</span>
                <span className="font-semibold">Two-Factor Authentication is enabled</span>
              </div>
            </div>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Secret: {secret}
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQrCode("");
                    setSecret("");
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Two-Factor Authentication adds an extra layer of security to your account. 
              You&apos;ll need to enter a code from your authenticator app when logging in.
            </p>
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Enable 2FA"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

