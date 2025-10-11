import AlertsList from '../AlertsList';

export default function AlertsListExample() {
  const mockAlerts = [
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
    <AlertsList 
      alerts={mockAlerts}
      onAcknowledge={(id) => console.log('Acknowledge alert:', id)}
      onContact={(id, method) => console.log('Contact guest:', id, method)}
    />
  );
}
