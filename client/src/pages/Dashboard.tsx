import { useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import BookingsTable from "@/components/BookingsTable";
import AlertsList, { type Alert } from "@/components/AlertsList";
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

  const { data: allAlerts = [], isLoading: isLoadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Filter for active (open) alerts only
  const activeAlerts = allAlerts.filter(alert => alert.status === "open");

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
        <p className="text-muted-foreground">民泊運営の状況を一目で確認</p>
      </div>

      <DashboardStats />

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
            showActions={false}
          />
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">アクティブなアラート</h2>
        {isLoadingAlerts ? (
          <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
        ) : activeAlerts.length > 0 ? (
          <AlertsList 
            alerts={activeAlerts}
            simplified={true}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">アクティブなアラートはありません</div>
        )}
      </Card>

      <EditBookingDialog
        booking={editingBooking}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
