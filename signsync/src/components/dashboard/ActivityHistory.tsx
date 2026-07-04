import { MessagesSquare, Dumbbell, Languages } from "lucide-react";
import Card from "@/components/ui/Card";
import { activityHistory } from "@/data/dummyData";
import { ActivityEntry } from "@/types";

const iconMap: Record<ActivityEntry["type"], typeof MessagesSquare> = {
  conversation: MessagesSquare,
  practice: Dumbbell,
  translation: Languages,
};

export default function ActivityHistory() {
  return (
    <Card id="activity" className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink-900">Activity history</h2>
          <p className="text-sm text-ink-500">Your recent sessions</p>
        </div>
        <button className="text-sm font-semibold text-signal-600 hover:text-signal-700">
          View all
        </button>
      </div>

      <div className="flex flex-col divide-y divide-ink-900/5">
        {activityHistory.map((entry) => {
          const Icon = iconMap[entry.type];
          return (
            <div key={entry.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-signal-50 text-signal-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{entry.title}</p>
                <p className="truncate text-sm text-ink-500">{entry.detail}</p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-sm font-semibold text-ink-700">{entry.duration}</p>
                <p className="text-xs text-ink-400">{entry.timestamp}</p>
              </div>
              <span className="hidden shrink-0 rounded-full bg-mint-400/10 px-2.5 py-1 text-xs font-bold text-mint-500 sm:inline-block">
                {entry.accuracy}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
