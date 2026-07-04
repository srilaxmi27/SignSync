import { cn } from "@/lib/utils";

type StatusType = "live" | "idle" | "error" | "warning";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  pulse?: boolean;
  className?: string;
}

const statusStyles: Record<StatusType, { wrapper: string; dot: string }> = {
  live:    { wrapper: "bg-mint-400/15 text-mint-500",    dot: "bg-mint-500" },
  idle:    { wrapper: "bg-ink-900/8 text-ink-500",       dot: "bg-ink-400" },
  error:   { wrapper: "bg-coral-500/10 text-coral-600",  dot: "bg-coral-500" },
  warning: { wrapper: "bg-amber-500/10 text-amber-600",  dot: "bg-amber-500" },
};

export default function StatusBadge({ status, label, pulse = false, className }: StatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span
      aria-label={`Status: ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        styles.wrapper,
        className
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && status === "live" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              styles.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", styles.dot)} />
      </span>
      {label}
    </span>
  );
}
