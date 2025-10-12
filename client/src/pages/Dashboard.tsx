import { useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import BookingsTable from "@/components/BookingsTable";
import AlertsList from "@/components/AlertsList";
import EditBookingDialog from "@/components/EditBookingDialog";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Booking } from "@/components/BookingsTable";

export default function Dashboard() {
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditDialogOpen(true);
  };

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
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
            ) : (
              <BookingsTable 
                bookings={bookings}
                onEdit={handleEdit}
                onViewDetails={(id) => console.log('View booking:', id)}
                onCall={(id) => console.log('Call guest from booking:', id)}
                onEmail={(id) => console.log('Email guest from booking:', id)}
              />
            )}
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

      <EditBookingDialog
        booking={editingBooking}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
