import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import StatusCard from "@/components/dashboard/StatusCard";
import CameraPanel from "@/components/dashboard/CameraPanel";
import GestureOutputPanel from "@/components/dashboard/GestureOutputPanel";
import GesturePredictionPanel from "@/components/dashboard/GesturePredictionPanel";
import ActivityHistory from "@/components/dashboard/ActivityHistory";
import DatasetPanel from "@/components/dashboard/DatasetPanel";
import { useAuth } from "@/context/AuthContext";
import { loadStats, recordSessionStart, recordSessionEnd, type SessionStats } from "@/store/sessionStore";
import { type StatusMetric } from "@/types";
import type { FeatureVector } from "@/lib/featureGenerator";
import { useGesturePrediction } from "@/hooks/useGesturePrediction";
import GestureTextPanel from "@/components/dashboard/GestureTextPanel";
import { useGestureText }        from "@/hooks/useGestureText";

// ─── Live stats → StatusMetric shape ─────────────────────────────────────────

function buildMetrics(
  stats:          SessionStats,
  elapsedSeconds: number,
): StatusMetric[] {
  const totalMinutes = stats.minutesTotal + elapsedSeconds / 60;

  const fmt = (min: number) => {
    if (min < 1)   return "0 min";
    if (min < 60)  return `${Math.floor(min)} min`;
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return [
    {
      id:    "sessions",
      label: "Sessions today",
      value: String(stats.sessionsToday),
      helper: stats.sessionsToday === 0
        ? "Start your first session"
        : stats.sessionsToday === 1
        ? "1 session so far today"
        : `${stats.sessionsToday} sessions so far today`,
      icon: "activity",
    },
    {
      id:    "minutes",
      label: "Minutes translated",
      value: fmt(totalMinutes),
      helper: totalMinutes === 0
        ? "No sessions yet"
        : `Across ${stats.sessionsToday} session${stats.sessionsToday !== 1 ? "s" : ""} today`,
      icon: "clock",
    },
    {
      id:    "accuracy",
      label: "Recognition accuracy",
      value: "—",
      helper: "Available after first session",
      icon: "target",
    },
    {
      id:    "latency",
      label: "Avg. response time",
      value: "—",
      helper: "Available after first session",
      icon: "zap",
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [isSidebarOpen,   setIsSidebarOpen]   = useState(false);
  const [stats,           setStats]           = useState<SessionStats>(() =>
    user ? loadStats(user.id) : { sessionsToday: 0, minutesTotal: 0, sessionDate: "" }
  );
  const [sessionActive,   setSessionActive]   = useState(false);
  const [elapsedSeconds,  setElapsedSeconds]  = useState(0);
  const [sessionStartAt,  setSessionStartAt]  = useState<number | null>(null);
  const [featureVector,   setFeatureVector]   = useState<FeatureVector | null>(null);

  // ── Gesture prediction (RF model, in-browser) ─────────────────────────────
  const prediction = useGesturePrediction(featureVector, {
    threshold:  0.55,
    windowSize: 10,
  });

  // ── Gesture → Text (sentence generation with flicker suppression) ─────────
  const gestureText = useGestureText(prediction, 0.55);

  // Reload stats from storage on mount (handles page refresh)
  useEffect(() => {
    if (user) setStats(loadStats(user.id));
  }, [user]);

  // Live elapsed-time ticker while session is running
  useEffect(() => {
    if (!sessionActive || !sessionStartAt) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, sessionStartAt]);

  const handleSessionStart = useCallback(() => {
    if (!user) return;
    const updated = recordSessionStart(user.id);
    setStats(updated);
    setSessionActive(true);
    setSessionStartAt(Date.now());
    setElapsedSeconds(0);
  }, [user]);

  const handleSessionStop = useCallback(() => {
    if (!user || !sessionStartAt) return;
    const elapsed = Math.floor((Date.now() - sessionStartAt) / 1000);
    const updated = recordSessionEnd(user.id, elapsed);
    setStats(updated);
    setSessionActive(false);
    setSessionStartAt(null);
    setElapsedSeconds(0);
  }, [user, sessionStartAt]);

  const metrics = buildMetrics(stats, sessionActive ? elapsedSeconds : 0);

  return (
    <div className="flex min-h-screen bg-beige-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        <motion.main
          id="overview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 px-6 py-8 sm:px-8"
        >
          {/* Status cards — live data */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => (
              <StatusCard key={metric.id} metric={metric} index={index} />
            ))}
          </div>

          {/* Primary grid */}
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <CameraPanel
              onSessionStart={handleSessionStart}
              onSessionStop={handleSessionStop}
              sessionElapsed={elapsedSeconds}
              onFeatureVector={setFeatureVector}
            />
            <div className="flex flex-col gap-6">
              {/* Live gesture prediction — model output */}
              <GesturePredictionPanel
                prediction={prediction}
                sessionActive={sessionActive}
              />
              {/* Gesture → Text translation */}
              <GestureTextPanel
                gestureText={gestureText}
                prediction={prediction}
                sessionActive={sessionActive}
              />
              {/* Gesture output log */}
              <GestureOutputPanel />
              {/* Dataset collection (dev tool) */}
              <DatasetPanel
                featureVector={featureVector}
                sessionActive={sessionActive}
              />
            </div>
          </div>

          {/* Activity */}
          <div className="mt-6">
            <ActivityHistory />
          </div>
        </motion.main>
      </div>
    </div>
  );
}
