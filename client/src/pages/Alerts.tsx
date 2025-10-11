import AlertsList from "@/components/AlertsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Alerts() {
  const allAlerts = [
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
    },
    {
      id: 3,
      bookingId: 5,
      guestName: "高橋 美咲",
      roomName: "長屋 B",
      detectedAt: "2025-10-18T19:00:00",
      reservedCount: 3,
      actualCount: 4,
      status: "resolved" as const
    }
  ];

  const openAlerts = allAlerts.filter(a => a.status === "open");
  const acknowledgedAlerts = allAlerts.filter(a => a.status === "acknowledged");
  const resolvedAlerts = allAlerts.filter(a => a.status === "resolved");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">アラート管理</h1>
        <p className="text-muted-foreground">予約人数と実人数の差分を管理</p>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open" data-testid="tab-open">
            未対応 ({openAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="acknowledged" data-testid="tab-acknowledged">
            対応中 ({acknowledgedAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">
            解決済 ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-6">
          <AlertsList 
            alerts={openAlerts}
            onAcknowledge={(id) => console.log('Acknowledge:', id)}
            onContact={(id, method) => console.log('Contact:', id, method)}
          />
        </TabsContent>
        <TabsContent value="acknowledged" className="mt-6">
          <AlertsList 
            alerts={acknowledgedAlerts}
            onAcknowledge={(id) => console.log('Acknowledge:', id)}
            onContact={(id, method) => console.log('Contact:', id, method)}
          />
        </TabsContent>
        <TabsContent value="resolved" className="mt-6">
          <AlertsList 
            alerts={resolvedAlerts}
            onAcknowledge={(id) => console.log('Acknowledge:', id)}
            onContact={(id, method) => console.log('Contact:', id, method)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
