import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hoverLift?: boolean;
}

export default function Card({
  padded = true,
  hoverLift = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl2 border border-ink-900/5 shadow-card",
        padded && "p-6",
        hoverLift &&
          "transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
