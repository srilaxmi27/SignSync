import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
  className?:   string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl2 bg-ink-900/[0.03] px-6 py-10 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-50 text-signal-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-700">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm leading-relaxed text-ink-400">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
