"use client";

import { useState, useEffect } from "react";

interface DashboardStatsProps {
  totalProperties: number;
  totalCategories: number;
  totalBuilders: number;
  activeCPs: number;
  pendingCPs: number;
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export default function DashboardStats({
  totalProperties,
  totalCategories,
  totalBuilders,
  activeCPs,
  pendingCPs,
  totalUsers,
  newUsersToday,
  newUsersThisWeek,
  newUsersThisMonth,
}: DashboardStatsProps) {
  const [currentUserStat, setCurrentUserStat] = useState(0);

  useEffect(() => {
    const stats = [
      { label: "Today", value: newUsersToday },
      { label: "This Week", value: newUsersThisWeek },
      { label: "This Month", value: newUsersThisMonth },
    ];
    let index = 0;

    const interval = setInterval(() => {
      setCurrentUserStat(index);
      index = (index + 1) % stats.length;
    }, 3000);

    return () => clearInterval(interval);
  }, [newUsersToday, newUsersThisWeek, newUsersThisMonth]);

  const userStats = [
    { label: "Today", value: newUsersToday },
    { label: "This Week", value: newUsersThisWeek },
    { label: "This Month", value: newUsersThisMonth },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-gray-600 text-sm mb-2">Total Properties</div>
        <div className="text-3xl font-bold text-gray-900">{totalProperties}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-gray-600 text-sm mb-2">Total Categories</div>
        <div className="text-3xl font-bold text-gray-900">{totalCategories}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-gray-600 text-sm mb-2">Total Builders</div>
        <div className="text-3xl font-bold text-gray-900">{totalBuilders}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-gray-600 text-sm mb-2">
          New Users ({userStats[currentUserStat].label})
        </div>
        <div className="text-3xl font-bold text-primary">
          {userStats[currentUserStat].value}
        </div>
        <div className="text-gray-500 text-xs mt-1">
          Total: {totalUsers} users
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-gray-600 text-sm mb-2">Active Channel Partners</div>
        <div className="text-3xl font-bold text-success">{activeCPs}</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-gray-600 text-sm mb-2">Pending Approvals</div>
        <div className="text-3xl font-bold text-danger">{pendingCPs}</div>
      </div>
    </div>
  );
}

