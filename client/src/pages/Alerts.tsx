import AlertsList, { Alert } from "@/components/AlertsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const { toast } = useToast();

  // Fetch alerts
  const { data: alerts = [], isLoading, error } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  // Update alert status mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "open" | "resolved" }) => {
      const response = await apiRequest("PATCH", `/api/alerts/${id}`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "更新しました",
        description: "アラートのステータスを更新しました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "アラートの更新に失敗しました",
        variant: "destructive",
      });
      console.error("Alert update error:", error);
    },
  });

  const handleAcknowledge = (id: number) => {
    updateAlertMutation.mutate({ id, status: "resolved" });
  };

  const handleContact = (id: number, method: "email" | "phone") => {
    console.log("Contact:", id, method);
    toast({
      title: "連絡機能",
      description: `${method === "email" ? "メール" : "電話"}機能は準備中です`,
    });
  };

  const openAlerts = alerts.filter(a => a.status === "open");
  const resolvedAlerts = alerts.filter(a => a.status === "resolved");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">アラート管理</h1>
          <p className="text-muted-foreground">予約人数と実人数の差分を管理</p>
        </div>
        <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">アラート管理</h1>
          <p className="text-muted-foreground">予約人数と実人数の差分を管理</p>
        </div>
        <div className="text-center py-8 text-destructive">
          エラーが発生しました: {error instanceof Error ? error.message : "不明なエラー"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">アラート管理</h1>
        <p className="text-muted-foreground">予約人数と実人数の差分を管理</p>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open" data-testid="tab-open">
            未対応 ({openAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">
            解決済 ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="mt-6">
          <AlertsList 
            alerts={openAlerts}
            onAcknowledge={handleAcknowledge}
            onContact={handleContact}
          />
        </TabsContent>
        <TabsContent value="resolved" className="mt-6">
          <AlertsList 
            alerts={resolvedAlerts}
            onAcknowledge={handleAcknowledge}
            onContact={handleContact}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
