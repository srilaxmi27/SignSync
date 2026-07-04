import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-signal-500 text-white hover:bg-signal-600 active:bg-signal-700 shadow-soft",
  secondary:
    "bg-white text-signal-600 border border-signal-200 hover:bg-signal-50",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-900/5",
  outline:
    "bg-transparent text-white border-2 border-white/70 hover:bg-white/10",
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
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-display font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-400 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
