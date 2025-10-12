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

const createBookingSchema = z.object({
  guestName: z.string().min(1, "氏名を入力してください"),
  roomId: z.string().min(1, "部屋を選択してください"),
  reservedAt: z.string().min(1, "予約日時を入力してください"),
  reservedCount: z.coerce.number().int().positive("予約人数は1以上を入力してください"),
});

type CreateBookingForm = z.infer<typeof createBookingSchema>;

interface Room {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
}

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateBookingDialog({ open, onOpenChange }: CreateBookingDialogProps) {
  const { toast } = useToast();

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const form = useForm<CreateBookingForm>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      guestName: "",
      roomId: "",
      reservedAt: "",
      reservedCount: 1,
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateBookingForm) => {
      // Convert datetime-local to ISO 8601 format
      // datetime-local format: "YYYY-MM-DDTHH:mm"
      // Add seconds to ensure proper parsing
      const dateWithSeconds = data.reservedAt.includes(":") && data.reservedAt.split(":").length === 2
        ? `${data.reservedAt}:00`
        : data.reservedAt;
      
      const date = new Date(dateWithSeconds);
      if (isNaN(date.getTime())) {
        throw new Error("無効な日時形式です");
      }
      
      const reservedAtISO = date.toISOString();
      
      return await apiRequest("POST", "/api/bookings", {
        ...data,
        reservedAt: reservedAtISO,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "予約を作成しました",
        description: "新しい予約が正常に追加されました",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message || "予約の作成に失敗しました",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateBookingForm) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-create-booking">
        <DialogHeader>
          <DialogTitle>新規予約作成</DialogTitle>
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
                      data-testid="input-guest-name"
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
                      <SelectTrigger data-testid="select-room">
                        <SelectValue placeholder="部屋を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem 
                          key={room.id} 
                          value={room.id}
                          data-testid={`select-room-option-${room.id}`}
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
                      data-testid="input-reserved-at"
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
                      data-testid="input-reserved-count"
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
                data-testid="button-cancel"
              >
                キャンセル
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                {createMutation.isPending ? "作成中..." : "作成"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
