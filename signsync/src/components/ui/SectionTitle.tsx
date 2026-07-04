import { cn } from "@/lib/utils";
import Badge from "./Badge";

type BadgeTone = "green" | "mint" | "coral" | "neutral";

interface SectionTitleProps {
  badge?:      string;
  badgeTone?:  BadgeTone;
  heading:     string;
  subtext?:    string;
  align?:      "left" | "center";
  className?:  string;
}

export default function SectionTitle({
  badge,
  badgeTone = "green",
  heading,
  subtext,
  align = "center",
  className,
}: SectionTitleProps) {
  const toneMap: Record<BadgeTone, "blue" | "mint" | "coral" | "neutral"> = {
    green:   "blue",
    mint:    "mint",
    coral:   "coral",
    neutral: "neutral",
  };

  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {badge && (
        <Badge tone={toneMap[badgeTone]} className="mb-4">
          {badge}
        </Badge>
      )}
      <h2 className="text-balance font-display text-3xl font-bold sm:text-4xl">{heading}</h2>
      {subtext && (
        <p className={cn("mt-4 text-lg leading-relaxed text-ink-500", align === "center" && "mx-auto max-w-2xl")}>
          {subtext}
        </p>
      )}
    </div>
  );
}
