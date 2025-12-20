"use client";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  channelPartner: { 
    companyName: string | null;
    [key: string]: any; // Allow other channelPartner fields
  } | null;
  _count: {
    activities: number;
    pageViews: number;
  };
}

interface TopUsersProps {
  users: User[];
}

export default function TopUsers({ users }: TopUsersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Top Users & Channel Partners</h2>
      {users.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No users yet</div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="text-gray-900 font-semibold">
                  {user.name || user.email}
                </div>
                <div className="text-gray-600 text-sm">
                  {user.channelPartner?.companyName || user.role}
                </div>
              </div>
              <div className="text-right">
                <div className="text-primary text-sm">
                  {user._count.activities} activities
                </div>
                <div className="text-gray-500 text-xs">
                  {user._count.pageViews} views
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

