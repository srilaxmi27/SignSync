import { InputHTMLAttributes, ReactNode, forwardRef, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:           string;
  error?:          string;
  hint?:           string;
  icon?:           ReactNode;
  trailingAction?: ReactNode;
  floatingLabel?:  boolean;
}

const shakeVariants = {
  idle:  { x: 0 },
  shake: {
    x: [0, 8, -8, 6, -6, 3, -3, 0],
    transition: { duration: 0.5, ease: "easeInOut" as const },
  },
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, icon, trailingAction, floatingLabel = false, className, id, value, onChange, onFocus, onBlur, ...rest },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = Boolean(value ?? rest.defaultValue);
    const isFloating = floatingLabel && (isFocused || hasValue);

    const describedBy = error
      ? `${inputId}-error`
      : hint
      ? `${inputId}-hint`
      : undefined;

    return (
      <div className="w-full">
        {!floatingLabel && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-ink-700"
          >
            {label}
          </label>
        )}

        <motion.div
          className="relative"
          variants={shakeVariants}
          animate={error ? "shake" : "idle"}
          key={error ? "error" : "idle"}
        >
          {floatingLabel && (
            <label
              htmlFor={inputId}
              className={cn(
                "pointer-events-none absolute left-4 transition-all duration-200 font-medium",
                icon && "left-11",
                isFloating
                  ? "top-2 text-xs text-signal-600"
                  : "top-1/2 -translate-y-1/2 text-sm text-ink-400"
              )}
            >
              {label}
            </label>
          )}

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
            value={value}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "w-full rounded-xl2 border bg-white px-4 text-base text-ink-900 placeholder:text-ink-400",
              "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-signal-400 focus:border-signal-400",
              floatingLabel ? "pb-2 pt-6" : "py-3.5",
              icon && "pl-11",
              trailingAction && "pr-11",
              error ? "border-coral-500 focus:ring-coral-400" : "border-ink-900/10",
              className
            )}
            {...rest}
          />

          {trailingAction && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {trailingAction}
            </span>
          )}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.p
              id={`${inputId}-error`}
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 text-sm font-medium text-coral-600 overflow-hidden"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

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
