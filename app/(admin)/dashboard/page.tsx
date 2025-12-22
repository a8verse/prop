import { prisma } from "@/lib/prisma";
import DashboardStats from "@/components/admin/DashboardStats";
import MostViewedProperties from "@/components/admin/MostViewedProperties";
import TopUsers from "@/components/admin/TopUsers";
import ActivityFeed from "@/components/admin/ActivityFeed";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Fetch dashboard data with error handling
  let totalProperties = 0;
  let totalCategories = 0;
  let totalBuilders = 0;
  let activeCPs = 0;
  let pendingCPs = 0;
  let totalUsers = 0;
  let newUsersToday = 0;
  let newUsersThisWeek = 0;
  let newUsersThisMonth = 0;
  let mostViewed: any[] = [];
  let topUsers: any[] = [];

  try {
    const results = await Promise.allSettled([
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
      }).catch(() => []),
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
      }).catch(() => []),
    ]);

    totalProperties = results[0].status === 'fulfilled' ? results[0].value : 0;
    totalCategories = results[1].status === 'fulfilled' ? results[1].value : 0;
    totalBuilders = results[2].status === 'fulfilled' ? results[2].value : 0;
    activeCPs = results[3].status === 'fulfilled' ? results[3].value : 0;
    pendingCPs = results[4].status === 'fulfilled' ? results[4].value : 0;
    totalUsers = results[5].status === 'fulfilled' ? results[5].value : 0;
    newUsersToday = results[6].status === 'fulfilled' ? results[6].value : 0;
    newUsersThisWeek = results[7].status === 'fulfilled' ? results[7].value : 0;
    newUsersThisMonth = results[8].status === 'fulfilled' ? results[8].value : 0;
    mostViewed = results[9].status === 'fulfilled' ? results[9].value : [];
    topUsers = results[10].status === 'fulfilled' ? results[10].value : [];
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    // Continue with default values
  }

  // Get property details for most viewed
  let mostViewedProperties: any[] = [];
  try {
    const mostViewedPropertyIds = mostViewed.map((mv: any) => mv.propertyId).filter(Boolean) as string[];
    if (mostViewedPropertyIds.length > 0) {
      mostViewedProperties = await prisma.property.findMany({
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
    }
  } catch (error) {
    console.error('Error fetching most viewed properties:', error);
  }

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

