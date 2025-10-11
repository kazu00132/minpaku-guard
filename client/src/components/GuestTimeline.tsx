import { Card } from "@/components/ui/card";
import { LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";

export interface EntryEvent {
  id: number;
  timestamp: string;
  eventType: "enter" | "leave";
  peopleCount: number;
}

interface GuestTimelineProps {
  events: EntryEvent[];
}

export default function GuestTimeline({ events }: GuestTimelineProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">入退室履歴</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4" data-testid={`event-${event.id}`}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                event.eventType === "enter" 
                  ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400" 
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}>
                {event.eventType === "enter" ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-12 bg-border mt-2" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {event.eventType === "enter" ? "入室" : "退室"}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  {format(new Date(event.timestamp), "HH:mm")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                人数: <span className="font-medium">{event.peopleCount}</span>名
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {format(new Date(event.timestamp), "yyyy-MM-dd")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
