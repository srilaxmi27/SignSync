import { cn } from "@/lib/utils";

type SpinnerSize  = "sm" | "md" | "lg";
type SpinnerColor = "primary" | "white" | "muted";

interface LoadingSpinnerProps {
  size?:  SpinnerSize;
  color?: SpinnerColor;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string>  = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const colorClasses: Record<SpinnerColor, string> = {
  primary: "text-signal-500",
  white:   "text-white",
  muted:   "text-ink-400",
};

export default function LoadingSpinner({ size = "md", color = "primary", label = "Loading" }: LoadingSpinnerProps) {
  return (
    <svg
      className={cn("animate-spin", sizeClasses[size], colorClasses[color])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label={label}
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
