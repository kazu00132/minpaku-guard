import DashboardStats from "@/components/DashboardStats";
import BookingsTable from "@/components/BookingsTable";
import AlertsList from "@/components/AlertsList";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const todayBookings = [
    {
      id: 1,
      guestName: "山田 太郎",
      reservedAt: "2025-10-20T15:00:00",
      reservedCount: 4,
      actualCount: 6,
      status: "checked_in" as const,
      roomName: "漁師の家"
    },
    {
      id: 2,
      guestName: "佐藤 花子",
      reservedAt: "2025-10-20T16:00:00",
      reservedCount: 2,
      actualCount: 2,
      status: "checked_in" as const,
      roomName: "長屋 A"
    },
    {
      id: 3,
      guestName: "田中 次郎",
      reservedAt: "2025-10-20T17:00:00",
      reservedCount: 3,
      actualCount: null,
      status: "booked" as const,
      roomName: "長屋 B"
    }
  ];

  const activeAlerts = [
    {
      id: 1,
      bookingId: 1,
      guestName: "山田 太郎",
      roomName: "漁師の家",
      detectedAt: "2025-10-20T18:30:00",
      reservedCount: 4,
      actualCount: 6,
      status: "open" as const
    },
    {
      id: 2,
      bookingId: 3,
      guestName: "鈴木 一郎",
      roomName: "長屋 C",
      detectedAt: "2025-10-19T20:15:00",
      reservedCount: 2,
      actualCount: 3,
      status: "acknowledged" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-muted-foreground">民泊運営の状況を一目で確認</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">本日の到着予定</h2>
            <BookingsTable 
              bookings={todayBookings}
              onViewDetails={(id) => console.log('View booking:', id)}
              onCall={(id) => console.log('Call guest from booking:', id)}
              onEmail={(id) => console.log('Email guest from booking:', id)}
            />
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">アクティブなアラート</h2>
            <AlertsList 
              alerts={activeAlerts}
              onAcknowledge={(id) => console.log('Acknowledge:', id)}
              onContact={(id, method) => console.log('Contact:', id, method)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
