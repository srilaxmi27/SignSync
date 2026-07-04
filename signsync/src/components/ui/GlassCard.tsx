import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BlurLevel  = "sm" | "md" | "lg";
type PadLevel   = "sm" | "md" | "lg";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  blur?:    BlurLevel;
  border?:  boolean;
  padding?: PadLevel;
}

const blurClasses: Record<BlurLevel, string>  = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
};

const padClasses: Record<PadLevel, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function GlassCard({
  blur = "md",
  border = true,
  padding = "md",
  className,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl2 bg-white/[0.08]",
        blurClasses[blur],
        border && "border border-white/[0.15]",
        padClasses[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
