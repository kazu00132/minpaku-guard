import BookingsTable from "@/components/BookingsTable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useState } from "react";

export default function Bookings() {
  const [searchTerm, setSearchTerm] = useState("");

  const allBookings = [
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
      reservedAt: "2025-10-21T16:00:00",
      reservedCount: 2,
      actualCount: 2,
      status: "checked_in" as const,
      roomName: "長屋 A"
    },
    {
      id: 3,
      guestName: "田中 次郎",
      reservedAt: "2025-10-22T14:00:00",
      reservedCount: 3,
      actualCount: null,
      status: "booked" as const,
      roomName: "長屋 B"
    },
    {
      id: 4,
      guestName: "鈴木 一郎",
      reservedAt: "2025-10-19T13:00:00",
      reservedCount: 2,
      actualCount: 2,
      status: "checked_out" as const,
      roomName: "長屋 C"
    }
  ];

  const filteredBookings = searchTerm
    ? allBookings.filter(b => 
        b.guestName.includes(searchTerm) || 
        b.roomName.includes(searchTerm)
      )
    : allBookings;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">予約一覧</h1>
          <p className="text-muted-foreground">全ての予約を管理</p>
        </div>
        <Button data-testid="button-add-booking">
          <Plus className="w-4 h-4 mr-2" />
          新規予約
        </Button>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="氏名または部屋名で検索..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>
        <BookingsTable 
          bookings={filteredBookings}
          onViewDetails={(id) => console.log('View booking:', id)}
        />
      </Card>
    </div>
  );
}
