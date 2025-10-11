import BookingsTable from '../BookingsTable';

export default function BookingsTableExample() {
  const mockBookings = [
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
    }
  ];

  return <BookingsTable bookings={mockBookings} onViewDetails={(id) => console.log('View booking:', id)} />;
}
