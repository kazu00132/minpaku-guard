import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "./BookingsTable";

const editBookingSchema = z.object({
  guestName: z.string().min(1, "氏名を入力してください"),
  reservedAt: z.string().min(1, "予約日時を入力してください"),
  reservedCount: z.number().min(1, "予約人数は1人以上にしてください").max(20, "予約人数は20人以下にしてください"),
  actualCount: z.number().min(0, "実人数は0人以上にしてください").max(20, "実人数は20人以下にしてください").nullable(),
  roomName: z.string().min(1, "部屋名を入力してください"),
  status: z.enum(["booked", "checked_in", "checked_out"]),
});

type EditBookingFormData = z.infer<typeof editBookingSchema>;

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditBookingDialog({ booking, open, onOpenChange }: EditBookingDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<EditBookingFormData>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      guestName: "",
      reservedAt: "",
      reservedCount: 1,
      actualCount: null,
      roomName: "",
      status: "booked",
    },
  });

  useEffect(() => {
    if (booking && open) {
      form.reset({
        guestName: booking.guestName,
        reservedAt: new Date(booking.reservedAt).toISOString().slice(0, 16),
        reservedCount: booking.reservedCount,
        actualCount: booking.actualCount,
        roomName: booking.roomName,
        status: booking.status,
      });
    }
  }, [booking, open, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditBookingFormData) => {
      if (!booking) throw new Error("予約が選択されていません");
      
      const response = await apiRequest(
        "PATCH",
        `/api/bookings/${booking.id}`,
        {
          ...data,
          reservedAt: new Date(data.reservedAt).toISOString(),
        }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "更新完了",
        description: "予約情報を更新しました",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: error instanceof Error ? error.message : "予約の更新に失敗しました",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditBookingFormData) => {
    updateMutation.mutate(data);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-edit-booking">
        <DialogHeader>
          <DialogTitle>予約情報の編集</DialogTitle>
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
                      {...field} 
                      placeholder="山田 太郎" 
                      data-testid="input-guest-name"
                    />
                  </FormControl>
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
                      {...field} 
                      type="datetime-local" 
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
                      {...field} 
                      type="number"
                      min={1}
                      max={20}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      data-testid="input-reserved-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actualCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>実人数</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min={0}
                      max={20}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                      placeholder="未入室の場合は空欄"
                      data-testid="input-actual-count"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>部屋名</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="漁師の家" 
                      data-testid="input-room-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>状態</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="状態を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="booked">未入室</SelectItem>
                      <SelectItem value="checked_in">入室中</SelectItem>
                      <SelectItem value="checked_out">チェックアウト</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                {updateMutation.isPending ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
