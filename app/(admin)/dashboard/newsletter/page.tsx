"use client";

import { useState, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  role: string;
  city: string | null;
  state: string | null;
  subscribedAt: Date;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({
    userType: "",
    city: "",
    state: "",
  });
  const [emailData, setEmailData] = useState({
    subject: "",
    content: "",
  });

  useEffect(() => {
    fetchSubscribers();
  }, [filters]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.userType) params.append("userType", filters.userType);
      if (filters.city) params.append("city", filters.city);
      if (filters.state) params.append("state", filters.state);

      const res = await fetch(`/api/newsletter/subscribers?${params.toString()}`);
      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!emailData.subject || !emailData.content) {
      alert("Please fill in subject and content");
      return;
    }

    if (subscribers.length === 0) {
      alert("No subscribers match the selected filters");
      return;
    }

    if (!confirm(`Send email to ${subscribers.length} subscribers?`)) {
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emailData,
          filters,
        }),
      });

      if (res.ok) {
        alert("Emails sent successfully!");
        setEmailData({ subject: "", content: "" });
      } else {
        const error = await res.json();
        alert(error.error || "Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      alert("An error occurred while sending emails");
    } finally {
      setSending(false);
    }
  };

  const uniqueCities = Array.from(new Set(subscribers.map((s) => s.city).filter(Boolean)));
  const uniqueStates = Array.from(new Set(subscribers.map((s) => s.state).filter(Boolean)));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Newsletter Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Composition */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={emailData.content}
                onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
                placeholder="Email content (HTML supported)"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || !emailData.subject || !emailData.content}
              className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              {sending ? "Sending..." : `Send to ${subscribers.length} Subscribers`}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Type
              </label>
              <select
                value={filters.userType}
                onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              >
                <option value="">All Users</option>
                <option value="CHANNEL_PARTNER">Channel Partners</option>
                <option value="VISITOR">Visitors</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              >
                <option value="">All Cities</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city || ""}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 bg-white"
              >
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state || ""}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>{subscribers.length}</strong> subscribers match the selected filters
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Subscribers ({subscribers.length})</h2>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No subscribers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">State</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{subscriber.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.city || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscriber.state || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

