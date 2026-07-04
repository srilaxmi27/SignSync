import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import LoadingSpinner from "./LoadingSpinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "icon";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  glow?:      boolean;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-signal-500 text-white hover:bg-signal-600 active:bg-signal-700 shadow-soft",
  secondary:
    "bg-white text-signal-600 border border-signal-200 hover:bg-signal-50",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-900/5",
  outline:
    "bg-transparent text-white border-2 border-white/70 hover:bg-white/10",
  icon:
    "bg-ink-900/5 text-ink-700 hover:bg-signal-50 hover:text-signal-600 rounded-full",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm px-4 py-2 rounded-xl gap-1.5",
  md: "text-base px-6 py-3 rounded-2xl gap-2",
  lg: "text-lg px-8 py-4 rounded-2xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      glow = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const resolvedVariant = (["primary","secondary","ghost","outline","icon"] as ButtonVariant[]).includes(variant)
      ? variant
      : "primary";

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center font-display font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-400 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[resolvedVariant],
          sizeStyles[size],
          glow && resolvedVariant === "primary" && "shadow-glow-signal",
          fullWidth && "w-full",
          className
        )}
        {...(rest as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <LoadingSpinner
            size={size === "lg" ? "md" : "sm"}
            color={resolvedVariant === "primary" ? "white" : "primary"}
          />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
