import { Activity, Clock, Target, Zap, TrendingDown, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import { StatusMetric } from "@/types";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  metric: StatusMetric;
}

const iconMap: Record<StatusMetric["icon"], typeof Activity> = {
  activity: Activity,
  clock: Clock,
  target: Target,
  zap: Zap,
};

export default function StatusCard({ metric }: StatusCardProps) {
  const Icon = iconMap[metric.icon];

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-signal-50 text-signal-600">
          <Icon className="h-5.5 w-5.5" />
        </div>
        {metric.trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              metric.trendDirection === "up"
                ? "bg-mint-400/10 text-mint-500"
                : "bg-signal-50 text-signal-600"
            )}
          >
            {metric.trendDirection === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {metric.trend}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-3xl font-bold text-ink-900">
          {metric.value}
        </p>
        <p className="mt-1 text-sm font-semibold text-ink-700">{metric.label}</p>
        <p className="mt-0.5 text-xs text-ink-400">{metric.helper}</p>
      </div>
    </Card>
  );
}
