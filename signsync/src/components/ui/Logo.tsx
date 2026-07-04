import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  labelClassName?: string;
  linkTo?: string;
}

export default function Logo({ className, labelClassName, linkTo = "/" }: LogoProps) {
  return (
    <Link to={linkTo} className={cn("inline-flex items-center gap-2.5 group", className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="34" height="34" rx="9" fill="#2563EB" />
        <path
          d="M10 13 L17 9 L24 13 M10 13 L13 22 M24 13 L21 22 M13 22 L21 22"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="13" r="2" fill="white" />
        <circle cx="17" cy="9" r="2" fill="white" />
        <circle cx="24" cy="13" r="2" fill="white" />
        <circle cx="13" cy="22" r="2" fill="white" />
        <circle cx="21" cy="22" r="2" fill="white" />
      </svg>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight text-ink-900",
          labelClassName
        )}
      >
        SignSync
      </span>
    </Link>
  );
}
