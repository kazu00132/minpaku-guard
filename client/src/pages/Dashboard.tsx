import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/DashboardStats";
import BookingsTable, { Booking } from "@/components/BookingsTable";
import AlertsList from "@/components/AlertsList";
import CreateBookingDialog from "@/components/CreateBookingDialog";
import EditBookingDialog from "@/components/EditBookingDialog";
import DeleteBookingDialog from "@/components/DeleteBookingDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BookingWithGuest {
  id: string;
  reservedAt: string;
  reservedCount: number;
  status: "booked" | "checked_in" | "checked_out";
  guest: {
    id: string;
    fullName: string;
    faceImageUrl: string | null;
  };
  room: {
    id: string;
    name: string;
  };
  entryEvents: Array<{
    id: string;
    eventType: "enter" | "leave";
    peopleCount: number;
  }>;
}

export default function Dashboard() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { data: bookingsData = [], isLoading } = useQuery<BookingWithGuest[]>({
    queryKey: ["/api/bookings"],
  });

  // Transform API data to BookingsTable format
  const bookings: Booking[] = bookingsData.map((booking) => {
    // Calculate actual count from latest entry event
    const latestEvent = booking.entryEvents.length > 0 
      ? booking.entryEvents[booking.entryEvents.length - 1]
      : null;
    
    // Use the latest event's peopleCount regardless of event type
    const actualCount = latestEvent ? latestEvent.peopleCount : null;

    return {
      id: booking.id,
      guestName: booking.guest.fullName,
      reservedAt: booking.reservedAt,
      reservedCount: booking.reservedCount,
      actualCount,
      status: booking.status,
      roomName: booking.room.name,
      roomId: booking.room.id,
      faceImageUrl: booking.guest.faceImageUrl,
    };
  });

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

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditDialogOpen(true);
  };

  const handleDelete = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">ダッシュボード</h1>
          <p className="text-muted-foreground">民泊運営の状況を一目で確認</p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          data-testid="button-create-booking"
        >
          <Plus className="w-4 h-4 mr-2" />
          予約追加
        </Button>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">本日の到着予定</h2>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                読み込み中...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                予約がありません
              </div>
            ) : (
              <BookingsTable 
                bookings={bookings}
                onEdit={handleEdit}
                onDelete={handleDelete}
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

      <CreateBookingDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <EditBookingDialog 
        booking={selectedBooking}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteBookingDialog 
        booking={selectedBooking}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
