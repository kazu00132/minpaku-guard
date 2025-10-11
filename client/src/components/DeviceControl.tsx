import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LockOpen, Power, PowerOff } from "lucide-react";
import { useState } from "react";

export interface Device {
  id: number;
  name: string;
  type: "lock" | "breaker";
  roomName: string;
  status: "online" | "offline";
  state: "on" | "off";
}

interface DeviceControlProps {
  devices: Device[];
  onControl?: (deviceId: number, command: string) => void;
}

export default function DeviceControl({ devices, onControl }: DeviceControlProps) {
  const [deviceStates, setDeviceStates] = useState<Record<number, string>>(
    devices.reduce((acc, device) => ({ ...acc, [device.id]: device.state }), {})
  );

  const handleControl = (deviceId: number, command: string) => {
    setDeviceStates(prev => ({ ...prev, [deviceId]: command === 'lock' || command === 'power_on' ? 'on' : 'off' }));
    onControl?.(deviceId, command);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {devices.map((device) => (
        <Card key={device.id} className="p-6" data-testid={`card-device-${device.id}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold" data-testid={`text-device-name-${device.id}`}>
                  {device.name}
                </h3>
                <p className="text-sm text-muted-foreground">{device.roomName}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                device.status === "online" 
                  ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}>
                {device.status === "online" ? "オンライン" : "オフライン"}
              </div>
            </div>
            
            {device.type === "lock" ? (
              <div className="flex gap-2">
                <Button 
                  variant={deviceStates[device.id] === "on" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleControl(device.id, "lock")}
                  data-testid={`button-lock-${device.id}`}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  施錠
                </Button>
                <Button 
                  variant={deviceStates[device.id] === "off" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleControl(device.id, "unlock")}
                  data-testid={`button-unlock-${device.id}`}
                >
                  <LockOpen className="w-4 h-4 mr-2" />
                  解錠
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant={deviceStates[device.id] === "on" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleControl(device.id, "power_on")}
                  data-testid={`button-power-on-${device.id}`}
                >
                  <Power className="w-4 h-4 mr-2" />
                  ON
                </Button>
                <Button 
                  variant={deviceStates[device.id] === "off" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleControl(device.id, "power_off")}
                  data-testid={`button-power-off-${device.id}`}
                >
                  <PowerOff className="w-4 h-4 mr-2" />
                  OFF
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
