import DeviceControl from "@/components/DeviceControl";
import { Card } from "@/components/ui/card";

export default function Devices() {
  const devices = [
    {
      id: 1,
      name: "玄関ドア",
      type: "lock" as const,
      roomName: "漁師の家",
      status: "online" as const,
      state: "on" as const
    },
    {
      id: 2,
      name: "ブレーカー",
      type: "breaker" as const,
      roomName: "漁師の家",
      status: "online" as const,
      state: "on" as const
    },
    {
      id: 3,
      name: "玄関ドア",
      type: "lock" as const,
      roomName: "長屋 A",
      status: "online" as const,
      state: "off" as const
    },
    {
      id: 4,
      name: "ブレーカー",
      type: "breaker" as const,
      roomName: "長屋 A",
      status: "online" as const,
      state: "on" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">デバイス制御</h1>
        <p className="text-muted-foreground">鍵とブレーカーを遠隔操作</p>
      </div>

      <DeviceControl 
        devices={devices}
        onControl={(id, cmd) => {
          console.log('Device control:', id, cmd);
        }}
      />

      <Card className="p-6">
        <h3 className="font-semibold mb-4">実行ログ</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">2025-10-20 18:45:23</span>
            <span>漁師の家 - 玄関ドア</span>
            <span className="text-green-600 dark:text-green-400">施錠成功</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">2025-10-20 15:30:15</span>
            <span>長屋 A - 玄関ドア</span>
            <span className="text-green-600 dark:text-green-400">解錠成功</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">2025-10-20 15:30:10</span>
            <span>長屋 A - ブレーカー</span>
            <span className="text-green-600 dark:text-green-400">ON成功</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
