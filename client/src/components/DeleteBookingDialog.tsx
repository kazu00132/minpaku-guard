import { useMutation } from "@tanstack/react-query";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Booking {
  id: string;
  guestName: string;
}

interface DeleteBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteBookingDialog({ booking, open, onOpenChange }: DeleteBookingDialogProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!booking) throw new Error("予約が選択されていません");
      return await apiRequest("DELETE", `/api/bookings/${booking.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "予約を削除しました",
        description: "予約が正常に削除されました",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message || "予約の削除に失敗しました",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="dialog-delete-booking">
        <AlertDialogHeader>
          <AlertDialogTitle>予約を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            {booking && (
              <>
                <span className="font-semibold">{booking.guestName}</span>の予約を削除します。
                この操作は取り消せません。
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-delete-cancel">
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-delete-confirm"
          >
            {deleteMutation.isPending ? "削除中..." : "削除"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
