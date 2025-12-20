import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/admin/DashboardStats";
import MostViewedProperties from "@/components/admin/MostViewedProperties";
import TopUsers from "@/components/admin/TopUsers";
import ActivityFeed from "@/components/admin/ActivityFeed";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Fetch dashboard data
  const [
    totalProperties,
    totalCategories,
    totalBuilders,
    activeCPs,
    pendingCPs,
    totalUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    mostViewed,
    topUsers,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.category.count(),
    prisma.builder.count(),
    prisma.channelPartner.count({ where: { status: "APPROVED" } }),
    prisma.channelPartner.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.pageView.groupBy({
      by: ["propertyId"],
      _count: { propertyId: true },
      orderBy: { _count: { propertyId: "desc" } },
      take: 5,
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        channelPartner: true,
        _count: {
          select: {
            activities: true,
            pageViews: true,
          },
        },
      },
    }),
  ]);

  // Get property details for most viewed
  const mostViewedPropertyIds = mostViewed.map((mv) => mv.propertyId).filter(Boolean) as string[];
  const mostViewedProperties = await prisma.property.findMany({
    where: { id: { in: mostViewedPropertyIds } },
    include: {
      builder: true,
      _count: {
        select: {
          pageViews: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      <DashboardStats
        totalProperties={totalProperties}
        totalCategories={totalCategories}
        totalBuilders={totalBuilders}
        activeCPs={activeCPs}
        pendingCPs={pendingCPs}
        totalUsers={totalUsers}
        newUsersToday={newUsersToday}
        newUsersThisWeek={newUsersThisWeek}
        newUsersThisMonth={newUsersThisMonth}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MostViewedProperties properties={mostViewedProperties} />
        <TopUsers users={topUsers} />
      </div>

      <ActivityFeed />
    </div>
  );
}

