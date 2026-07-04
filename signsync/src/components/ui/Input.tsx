import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailingAction?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, trailingAction, className, id, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = error
      ? `${inputId}-error`
      : hint
      ? `${inputId}-hint`
      : undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-ink-700"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "w-full rounded-xl2 border bg-white px-4 py-3.5 text-base text-ink-900 placeholder:text-ink-400",
              "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-signal-400 focus:border-signal-400",
              icon && "pl-11",
              trailingAction && "pr-11",
              error ? "border-coral-500" : "border-ink-900/10",
              className
            )}
            {...rest}
          />
          {trailingAction && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {trailingAction}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm font-medium text-coral-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
