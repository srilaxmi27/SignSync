import { motion } from "framer-motion";
import { MessagesSquare, Dumbbell, Languages, History } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { type ActivityEntry } from "@/types";
import { cn } from "@/lib/utils";

interface ActivityHistoryProps {
  entries?: ActivityEntry[];
}

const iconMap: Record<ActivityEntry["type"], typeof MessagesSquare> = {
  conversation: MessagesSquare,
  practice:     Dumbbell,
  translation:  Languages,
};

const typeGradients: Record<ActivityEntry["type"], string> = {
  conversation: "from-signal-400 to-signal-600",
  practice:     "from-mint-400 to-signal-500",
  translation:  "from-signal-300 to-signal-500",
};

function AccuracyRing({ value }: { value: number }) {
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, value));
  const strokeDash = (clamped / 100) * circumference;

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="48" height="48">
        <circle
          cx="24" cy="24" r={r}
          fill="none" stroke="currentColor" strokeWidth="3"
          className="text-ink-900/8"
        />
        <motion.circle
          cx="24" cy="24" r={r}
          fill="none" stroke="currentColor" strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={clamped >= 90 ? "text-mint-500" : "text-signal-500"}
        />
      </svg>
      <span className="absolute text-xs font-bold text-ink-700">{clamped}%</span>
    </div>
  );
}

export default function ActivityHistory({ entries = [] }: ActivityHistoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card id="activity" variant="elevated" className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Activity history</h2>
            <p className="text-sm text-ink-500">Your recent sessions</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon={<History className="h-5 w-5" />}
            title="No activity yet"
            description="Your completed sessions will appear here after you start signing."
          />
        ) : (
          <div className="relative flex flex-col gap-0">
            <div className="absolute left-5 top-6 bottom-6 w-px bg-ink-900/6" />
            {entries.map((entry, index) => {
              const Icon = iconMap[entry.type];
              const gradient = typeGradients[entry.type];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="relative flex items-center gap-4 py-3.5 pl-1 first:pt-0 last:pb-0"
                >
                  <div className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
                    gradient
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{entry.title}</p>
                    <p className="truncate text-sm text-ink-500">{entry.detail}</p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold text-ink-700">{entry.duration}</p>
                    <p className="text-xs text-ink-400">{entry.timestamp}</p>
                  </div>
                  <AccuracyRing value={entry.accuracy} />
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
