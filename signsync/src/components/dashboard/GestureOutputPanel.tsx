import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { recognizedGestures } from "@/data/dummyData";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function GestureOutputPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="h-full"
    >
      <Card variant="elevated" className="flex h-full flex-col gap-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-400 to-signal-600 text-white shadow-soft">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">Gesture output</h2>
            <p className="text-sm text-ink-500">Translated in real time</p>
          </div>
        </div>

        {/* List */}
        {recognizedGestures.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText className="h-5 w-5" />}
            title="No gestures yet"
            description="Start a session and begin signing — translated words will appear here."
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-1 flex-col gap-2.5 overflow-y-auto scrollbar-thin"
          >
            {recognizedGestures.map((gesture) => (
              <motion.div
                key={gesture.id}
                variants={itemVariants}
                className="rounded-xl2 bg-beige-50 px-4 py-3.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900">{gesture.word}</p>
                    <p className="text-xs text-ink-400">{gesture.timestamp}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                      gesture.confidence >= 95
                        ? "bg-mint-400/15 text-mint-500"
                        : "bg-signal-50 text-signal-600"
                    )}
                  >
                    {gesture.confidence}%
                  </span>
                </div>
                {/* Confidence bar */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-900/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${gesture.confidence}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className={cn(
                      "h-full rounded-full",
                      gesture.confidence >= 95 ? "bg-mint-400" : "bg-signal-400"
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
