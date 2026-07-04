/**
 * Session statistics store.
 *
 * Persists cumulative stats in localStorage under the authenticated user's ID
 * so each user has their own counters that grow over real usage.
 *
 * Stats tracked:
 *   - sessionsToday   : number of sessions started today (resets at midnight)
 *   - minutesTotal    : total minutes translated across all sessions
 *   - sessionDate     : the calendar date sessionsToday was last counted
 */

const KEY = (userId: string) => `signsync.stats.${userId}`;

export interface SessionStats {
  sessionsToday: number;
  minutesTotal:  number;
  sessionDate:   string;   // YYYY-MM-DD
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadStats(userId: string): SessionStats {
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as SessionStats;
      // Reset daily counter if it's a new day
      if (parsed.sessionDate !== todayStr()) {
        return { sessionsToday: 0, minutesTotal: parsed.minutesTotal, sessionDate: todayStr() };
      }
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return { sessionsToday: 0, minutesTotal: 0, sessionDate: todayStr() };
}

export function saveStats(userId: string, stats: SessionStats): void {
  localStorage.setItem(KEY(userId), JSON.stringify(stats));
}

/** Called when a session starts. Returns updated stats. */
export function recordSessionStart(userId: string): SessionStats {
  const stats = loadStats(userId);
  const next: SessionStats = {
    ...stats,
    sessionsToday: stats.sessionsToday + 1,
    sessionDate:   todayStr(),
  };
  saveStats(userId, next);
  return next;
}

/** Called when a session ends. Adds elapsed seconds to minutesTotal. */
export function recordSessionEnd(userId: string, elapsedSeconds: number): SessionStats {
  const stats = loadStats(userId);
  const next: SessionStats = {
    ...stats,
    minutesTotal: stats.minutesTotal + elapsedSeconds / 60,
  };
  saveStats(userId, next);
  return next;
}
