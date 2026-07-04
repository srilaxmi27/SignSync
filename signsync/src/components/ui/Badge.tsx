import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "blue" | "mint" | "coral" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  blue:    "bg-signal-50 text-signal-600",
  mint:    "bg-mint-400/10 text-mint-500",
  coral:   "bg-coral-500/10 text-coral-600",
  neutral: "bg-ink-900/5 text-ink-600",
};

export default function Badge({
  tone = "blue",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        toneStyles[tone],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
