"use client";

import { useState, useEffect } from "react";

interface ChannelPartner {
  id: string;
  companyName: string;
  phone: string;
  status: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
    lastLogin: Date | null;
  };
  createdAt: Date;
}

export default function ChannelPartnersPage() {
  const [partners, setPartners] = useState<ChannelPartner[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchPartners = async () => {
    try {
      const url = statusFilter
        ? `/api/channel-partners?status=${statusFilter}`
        : "/api/channel-partners";
      const res = await fetch(url);
      const data = await res.json();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: "approve" | "reject" | "suspend") => {
    if (selected.length === 0) return;

    try {
      await fetch("/api/channel-partners/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      });
      setSelected([]);
      fetchPartners();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/channel-partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchPartners();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Channel Partners</h1>
        <div className="flex gap-4">
          <a
            href="/api/export/channel-partners"
            download
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Export to Excel
          </a>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary"
            >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-4 flex-wrap">
          <span className="text-gray-700 font-medium">{selected.length} selected</span>
          <button
            onClick={() => handleBulkAction("approve")}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm"
          >
            Approve Selected
          </button>
          <button
            onClick={() => handleBulkAction("reject")}
            className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm"
          >
            Reject Selected
          </button>
          <button
            onClick={() => handleBulkAction("suspend")}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
          >
            Suspend Selected
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelected(partners.map((p) => p.id));
                    } else {
                      setSelected([]);
                    }
                  }}
                />
              </th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Company</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Contact</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Profile Created</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Last Login</th>
              <th className="px-6 py-3 text-left text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr
                key={partner.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(partner.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected([...selected, partner.id]);
                      } else {
                        setSelected(selected.filter((id) => id !== partner.id));
                      }
                    }}
                  />
                </td>
                <td className="px-6 py-4 text-gray-900">{partner.companyName}</td>
                <td className="px-6 py-4 text-gray-600">
                  <div>{partner.user.name || partner.user.email}</div>
                  <div className="text-sm text-gray-500">{partner.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={partner.status}
                    onChange={(e) => handleStatusChange(partner.id, e.target.value)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-700 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(partner.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {partner.user.lastLogin ? new Date(partner.user.lastLogin).toLocaleDateString() : "Never"}
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`/dashboard/channel-partners/${partner.user.id}`}
                    className="text-primary hover:text-primary-dark text-sm"
                  >
                    View Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

