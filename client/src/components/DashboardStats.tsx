import { Card } from "@/components/ui/card";
import { Users, AlertTriangle, Lock } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant?: "default" | "warning" | "success";
}

function StatCard({ icon, label, value, variant = "default" }: StatCardProps) {
  const colorClass = 
    variant === "warning" ? "text-amber-500" : 
    variant === "success" ? "text-green-500" : 
    "text-primary";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-semibold">{value}</p>
        </div>
        <div className={`${colorClass}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        icon={<Users className="w-8 h-8" />}
        label="入室中"
        value={5}
        variant="success"
      />
      <StatCard 
        icon={<AlertTriangle className="w-8 h-8" />}
        label="アラート"
        value={2}
        variant="warning"
      />
      <StatCard 
        icon={<Lock className="w-8 h-8" />}
        label="デバイス稼働状況"
        value="4/4"
        variant="success"
      />
    </div>
  );
}
