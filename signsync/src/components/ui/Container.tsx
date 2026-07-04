import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Container({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("section-container", className)} {...rest}>
      {children}
    </div>
  );
}
