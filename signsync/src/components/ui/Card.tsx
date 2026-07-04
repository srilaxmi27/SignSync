import { ElementType, HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "glass" | "elevated" | "outlined";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?:     CardVariant;
  padded?:      boolean;
  hoverLift?:   boolean;
  interactive?: boolean;
  as?:          "div" | "article" | "section";
}

const variantStyles: Record<CardVariant, string> = {
  default:  "bg-white border border-ink-900/6 shadow-card",
  glass:    "bg-white/[0.08] backdrop-blur border border-white/[0.15]",
  elevated: "bg-white border border-ink-900/6 shadow-elevated",
  outlined: "bg-white border-2 border-signal-200",
};

export default function Card({
  variant = "default",
  padded = true,
  hoverLift = false,
  interactive = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: CardProps) {
  const resolvedVariant = (["default","glass","elevated","outlined"] as CardVariant[]).includes(variant)
    ? variant
    : "default";

  const base = cn(
    "rounded-xl2",
    variantStyles[resolvedVariant],
    padded && "p-6",
    hoverLift && "transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft",
    className
  );

  if (interactive) {
    return (
      <motion.div
        className={base}
        initial="rest"
        whileHover="hover"
        variants={{
          rest:  { y: 0 },
          hover: { y: -4, transition: { duration: 0.25, ease: "easeOut" } },
        }}
        {...(rest as React.ComponentProps<typeof motion.div>)}
      >
        {children}
      </motion.div>
    );
  }

  const El = Tag as ElementType;
  return (
    <El className={base} {...rest}>
      {children}
    </El>
  );
}
