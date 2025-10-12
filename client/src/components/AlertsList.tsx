import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

export interface Alert {
  id: number;
  bookingId: number;
  guestName: string;
  roomName: string;
  detectedAt: string;
  reservedCount: number;
  actualCount: number;
  status: "open" | "resolved";
}

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (id: number) => void;
  onContact?: (id: number, method: "email" | "phone") => void;
  simplified?: boolean;
}

export default function AlertsList({ alerts, onAcknowledge, onContact, simplified = false }: AlertsListProps) {
  if (simplified) {
    return (
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-4" data-testid={`card-alert-${alert.id}`}>
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1" data-testid={`text-alert-guest-${alert.id}`}>
                  {alert.guestName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  予約人数: <span className="font-medium">{alert.reservedCount}</span> → 
                  実人数: <span className="font-semibold text-amber-500">{alert.actualCount}</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className="p-4" data-testid={`card-alert-${alert.id}`}>
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold" data-testid={`text-alert-guest-${alert.id}`}>
                      {alert.guestName}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {alert.roomName}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    予約人数: <span className="font-medium">{alert.reservedCount}</span> → 
                    実人数: <span className="font-semibold text-amber-500">{alert.actualCount}</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {format(new Date(alert.detectedAt), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
                {alert.status === "open" && (
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                    未対応
                  </Badge>
                )}
                {alert.status === "resolved" && (
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    解決済
                  </Badge>
                )}
              </div>
              {alert.status === "open" && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onAcknowledge?.(alert.id)}
                    data-testid={`button-acknowledge-${alert.id}`}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    解決
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onContact?.(alert.id, "email")}
                    data-testid={`button-email-${alert.id}`}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    メール
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onContact?.(alert.id, "phone")}
                    data-testid={`button-phone-${alert.id}`}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    電話
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
