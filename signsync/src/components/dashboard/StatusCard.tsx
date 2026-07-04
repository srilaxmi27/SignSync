import { motion } from "framer-motion";
import { Activity, Clock, Target, Zap, TrendingDown, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import { StatusMetric } from "@/types";
import { cn } from "@/lib/utils";

interface StatusCardProps {
  metric: StatusMetric;
  index?: number;
}

const iconMap: Record<StatusMetric["icon"], typeof Activity> = {
  activity: Activity,
  clock:    Clock,
  target:   Target,
  zap:      Zap,
};

const iconGradients: Record<StatusMetric["icon"], string> = {
  activity: "from-signal-400 to-signal-600",
  clock:    "from-signal-300 to-signal-500",
  target:   "from-mint-400 to-signal-500",
  zap:      "from-signal-500 to-signal-700",
};

export default function StatusCard({ metric, index = 0 }: StatusCardProps) {
  const Icon = iconMap[metric.icon];
  const gradient = iconGradients[metric.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card variant="elevated" interactive className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
              gradient
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {metric.trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                metric.trendDirection === "up"
                  ? "bg-mint-400/15 text-mint-500"
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
          <p className="font-display text-3xl font-bold text-ink-900">{metric.value}</p>
          <p className="mt-1 text-sm font-semibold text-ink-700">{metric.label}</p>
          <p className="mt-0.5 text-xs text-ink-400">{metric.helper}</p>
        </div>
      </Card>
    </motion.div>
  );
}
