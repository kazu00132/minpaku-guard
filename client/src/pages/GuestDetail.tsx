import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GuestTimeline from "@/components/GuestTimeline";
import AlertsList from "@/components/AlertsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, ArrowLeft, Lock, Power } from "lucide-react";
import { Link } from "wouter";

export default function GuestDetail() {
  const guest = {
    id: 1,
    name: "山田 太郎",
    age: 35,
    phone: "090-1234-5678",
    email: "yamada@example.com",
    reservedAt: "2025-10-20T15:00:00",
    reservedCount: 4,
    actualCount: 6,
    status: "checked_in",
    roomName: "漁師の家",
    licenseImageUrl: null,
    faceImageUrl: null
  };

  const entryEvents = [
    {
      id: 1,
      timestamp: "2025-10-20T15:30:00",
      eventType: "enter" as const,
      peopleCount: 4
    },
    {
      id: 2,
      timestamp: "2025-10-20T18:15:00",
      eventType: "enter" as const,
      peopleCount: 6
    }
  ];

  const alerts = [
    {
      id: 1,
      bookingId: 1,
      guestName: "山田 太郎",
      roomName: "漁師の家",
      detectedAt: "2025-10-20T18:30:00",
      reservedCount: 4,
      actualCount: 6,
      status: "open" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/bookings">
          <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            予約一覧に戻る
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={guest.faceImageUrl || undefined} />
              <AvatarFallback className="text-lg">{guest.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{guest.name}</h1>
              <p className="text-muted-foreground">{guest.roomName}</p>
            </div>
          </div>
          <Badge variant="default">入室中</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">年齢</p>
          <p className="text-xl font-semibold">{guest.age}歳</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">予約人数</p>
          <p className="text-xl font-semibold">{guest.reservedCount}名</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">実人数</p>
          <p className="text-xl font-semibold text-amber-500">{guest.actualCount}名</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">連絡先</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">電話番号</p>
            <p className="font-medium">{guest.phone}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">メールアドレス</p>
            <p className="font-medium">{guest.email}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" data-testid="button-call">
            <Phone className="w-4 h-4 mr-2" />
            電話をかける
          </Button>
          <Button variant="outline" data-testid="button-email">
            <Mail className="w-4 h-4 mr-2" />
            メール送信
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline" data-testid="tab-timeline">入退室履歴</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">アラート</TabsTrigger>
          <TabsTrigger value="devices" data-testid="tab-devices">デバイス操作</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-6">
          <GuestTimeline events={entryEvents} />
        </TabsContent>
        <TabsContent value="alerts" className="mt-6">
          <AlertsList 
            alerts={alerts}
            onAcknowledge={(id) => console.log('Acknowledge:', id)}
            onContact={(id, method) => console.log('Contact:', id, method)}
          />
        </TabsContent>
        <TabsContent value="devices" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h4 className="font-semibold mb-4">玄関ドア</h4>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" data-testid="button-lock-door">
                  <Lock className="w-4 h-4 mr-2" />
                  施錠
                </Button>
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold mb-4">ブレーカー</h4>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" data-testid="button-power-off">
                  <Power className="w-4 h-4 mr-2" />
                  電源OFF
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
