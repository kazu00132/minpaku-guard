import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const editBookingSchema = z.object({
  guestName: z.string().min(1, "氏名を入力してください"),
  roomId: z.string().min(1, "部屋を選択してください"),
  reservedAt: z.string().min(1, "予約日時を入力してください"),
  reservedCount: z.coerce.number().int().positive("予約人数は1以上を入力してください"),
});

type EditBookingForm = z.infer<typeof editBookingSchema>;

interface Room {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
}

interface Booking {
  id: string;
  guestName: string;
  roomId: string;
  roomName: string;
  reservedAt: string;
  reservedCount: number;
}

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditBookingDialog({ booking, open, onOpenChange }: EditBookingDialogProps) {
  const { toast } = useToast();

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const form = useForm<EditBookingForm>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      guestName: "",
      roomId: "",
      reservedAt: "",
      reservedCount: 1,
    },
  });

  // Update form when booking changes
  useEffect(() => {
    if (booking) {
      // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
      const date = new Date(booking.reservedAt);
      const dateLocal = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      form.reset({
        guestName: booking.guestName,
        roomId: booking.roomId,
        reservedAt: dateLocal,
        reservedCount: booking.reservedCount,
      });
    }
  }, [booking, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditBookingForm) => {
      if (!booking) throw new Error("予約が選択されていません");

      // Convert datetime-local to ISO 8601 format
      const dateWithSeconds = data.reservedAt.includes(":") && data.reservedAt.split(":").length === 2
        ? `${data.reservedAt}:00`
        : data.reservedAt;
      
      const date = new Date(dateWithSeconds);
      if (isNaN(date.getTime())) {
        throw new Error("無効な日時形式です");
      }
      
      const reservedAtISO = date.toISOString();

      return await apiRequest("PATCH", `/api/bookings/${booking.id}`, {
        ...data,
        reservedAt: reservedAtISO,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "予約を更新しました",
        description: "予約情報が正常に更新されました",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message || "予約の更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditBookingForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-edit-booking">
        <DialogHeader>
          <DialogTitle>予約編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>氏名</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="山田 太郎" 
                      {...field} 
                      data-testid="input-edit-guest-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>部屋</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-room">
                        <SelectValue placeholder="部屋を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem 
                          key={room.id} 
                          value={room.id}
                          data-testid={`select-edit-room-option-${room.id}`}
                        >
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reservedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>予約日時</FormLabel>
                  <FormControl>
                    <Input 
                      type="datetime-local" 
                      {...field} 
                      data-testid="input-edit-reserved-at"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reservedCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>予約人数</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field} 
                      data-testid="input-edit-reserved-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-edit-cancel"
              >
                キャンセル
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-edit-submit"
              >
                {updateMutation.isPending ? "更新中..." : "更新"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
