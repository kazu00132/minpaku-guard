import { Card } from "@/components/ui/card";
import { Users, AlertTriangle, Lock, Calendar } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<Calendar className="w-8 h-8" />}
        label="Today's Arrivals"
        value={3}
      />
      <StatCard 
        icon={<Users className="w-8 h-8" />}
        label="Active Guests"
        value={5}
        variant="success"
      />
      <StatCard 
        icon={<AlertTriangle className="w-8 h-8" />}
        label="Active Alerts"
        value={2}
        variant="warning"
      />
      <StatCard 
        icon={<Lock className="w-8 h-8" />}
        label="Devices Online"
        value="4/4"
        variant="success"
      />
    </div>
  );
}
