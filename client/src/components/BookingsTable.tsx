import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Phone, Mail } from "lucide-react";
import { format } from "date-fns";

export interface Booking {
  id: number;
  guestName: string;
  reservedAt: string;
  reservedCount: number;
  actualCount: number | null;
  status: "booked" | "checked_in" | "checked_out";
  roomName: string;
  faceImageUrl?: string | null;
}

interface BookingsTableProps {
  bookings: Booking[];
  onViewDetails?: (id: number) => void;
  onCall?: (id: number) => void;
  onEmail?: (id: number) => void;
}

export default function BookingsTable({ bookings, onViewDetails, onCall, onEmail }: BookingsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in":
        return <Badge variant="default" data-testid={`badge-status-checked_in`}>入室中</Badge>;
      case "checked_out":
        return <Badge variant="secondary" data-testid={`badge-status-checked_out`}>チェックアウト</Badge>;
      default:
        return <Badge variant="outline" data-testid={`badge-status-booked`}>未入室</Badge>;
    }
  };

  const hasDiscrepancy = (booking: Booking) => {
    return booking.actualCount !== null && booking.actualCount > booking.reservedCount;
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>予約日時</TableHead>
            <TableHead>氏名</TableHead>
            <TableHead>部屋</TableHead>
            <TableHead className="text-center">予約人数</TableHead>
            <TableHead className="text-center">実人数</TableHead>
            <TableHead>状態</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
              <TableCell className="font-mono text-sm" data-testid={`text-reserved-at-${booking.id}`}>
                {format(new Date(booking.reservedAt), "yyyy-MM-dd HH:mm")}
              </TableCell>
              <TableCell data-testid={`text-guest-name-${booking.id}`}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={booking.faceImageUrl || undefined} />
                    <AvatarFallback className="text-xs">{booking.guestName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{booking.guestName}</span>
                </div>
              </TableCell>
              <TableCell data-testid={`text-room-${booking.id}`}>{booking.roomName}</TableCell>
              <TableCell className="text-center" data-testid={`text-reserved-count-${booking.id}`}>
                {booking.reservedCount}
              </TableCell>
              <TableCell className="text-center" data-testid={`text-actual-count-${booking.id}`}>
                {booking.actualCount !== null ? (
                  <span className={hasDiscrepancy(booking) ? "text-amber-500 font-semibold" : ""}>
                    {booking.actualCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onCall?.(booking.id)}
                    data-testid={`button-call-${booking.id}`}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onEmail?.(booking.id)}
                    data-testid={`button-email-${booking.id}`}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onViewDetails?.(booking.id)}
                    data-testid={`button-view-${booking.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
