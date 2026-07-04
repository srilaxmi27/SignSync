import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import Card from "@/components/ui/Card";
import { recognizedGestures } from "@/data/dummyData";
import { cn } from "@/lib/utils";

export default function GestureOutputPanel() {
  return (
    <Card className="flex h-full flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-signal-50 text-signal-600">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink-900">Gesture output</h2>
          <p className="text-sm text-ink-500">Translated in real time</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-thin">
        {recognizedGestures.map((gesture, index) => (
          <motion.div
            key={gesture.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between rounded-xl2 bg-paper px-4 py-3.5"
          >
            <div>
              <p className="font-semibold text-ink-900">{gesture.word}</p>
              <p className="text-xs text-ink-400">{gesture.timestamp}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                gesture.confidence >= 95
                  ? "bg-mint-400/10 text-mint-500"
                  : "bg-signal-50 text-signal-600"
              )}
            >
              {gesture.confidence}%
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
