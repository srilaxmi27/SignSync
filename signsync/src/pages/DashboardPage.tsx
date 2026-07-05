import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Sidebar, { addSessionToHistory } from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import StatusCard from "@/components/dashboard/StatusCard";
import CameraPanel from "@/components/dashboard/CameraPanel";
import GestureOutputPanel from "@/components/dashboard/GestureOutputPanel";
import GestureTextPanel from "@/components/dashboard/GestureTextPanel";
import AddGesturePanel from "@/components/dashboard/AddGesturePanel";
import DatasetPanel from "@/components/dashboard/DatasetPanel";
import { useAuth } from "@/context/AuthContext";
import {
  loadStats,
  recordSessionStart,
  recordSessionEnd,
  type SessionStats,
} from "@/store/sessionStore";
import { type StatusMetric } from "@/types";
import type { FeatureVector } from "@/lib/featureGenerator";
import { useGesturePrediction } from "@/hooks/useGesturePrediction";
import { useGestureText } from "@/hooks/useGestureText";

// ─── Metrics builder ──────────────────────────────────────────────────────────

function buildMetrics(stats: SessionStats, elapsedSeconds: number): StatusMetric[] {
  const totalMinutes = stats.minutesTotal + elapsedSeconds / 60;
  const fmt = (min: number) => {
    if (min < 1)  return "0 min";
    if (min < 60) return `${Math.floor(min)} min`;
    const h = Math.floor(min / 60), m = Math.floor(min % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };
  return [
    {
      id: "sessions", label: "Sessions today", value: String(stats.sessionsToday),
      helper: stats.sessionsToday === 0 ? "Start your first session"
        : `${stats.sessionsToday} session${stats.sessionsToday !== 1 ? "s" : ""} today`,
      icon: "activity",
    },
    {
      id: "minutes", label: "Minutes translated", value: fmt(totalMinutes),
      helper: totalMinutes === 0 ? "No sessions yet"
        : `Across ${stats.sessionsToday} session${stats.sessionsToday !== 1 ? "s" : ""} today`,
      icon: "clock",
    },
    {
      id: "accuracy", label: "Recognition accuracy", value: "—",
      helper: "Available after first session", icon: "target",
    },
    {
      id: "latency", label: "Avg. response time", value: "—",
      helper: "Available after first session", icon: "zap",
    },
  ];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  const [isSidebarOpen,   setIsSidebarOpen]   = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [stats,           setStats]           = useState<SessionStats>(() =>
    user ? loadStats(user.id) : { sessionsToday: 0, minutesTotal: 0, sessionDate: "" }
  );
  const [sessionActive,   setSessionActive]   = useState(false);
  const [elapsedSeconds,  setElapsedSeconds]  = useState(0);
  const [sessionStartAt,  setSessionStartAt]  = useState<number | null>(null);
  const [featureVector,   setFeatureVector]   = useState<FeatureVector | null>(null);
  const [gestures,        setGestures]        = useState<import("@/types").RecognizedGesture[]>([]);
  // Show dev tools (DatasetPanel) only when explicitly opened
  const [showDevTools,    setShowDevTools]    = useState(false);

  const prediction  = useGesturePrediction(featureVector, { threshold: 0.65, windowSize: 15 });
  const gestureText = useGestureText(prediction, 0.65);

  useEffect(() => { if (user) setStats(loadStats(user.id)); }, [user]);

  useEffect(() => {
    if (!sessionActive || !sessionStartAt) { setElapsedSeconds(0); return; }
    const id = setInterval(() =>
      setElapsedSeconds(Math.floor((Date.now() - sessionStartAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [sessionActive, sessionStartAt]);

  // Accumulate gesture log only (no transcript)
  useEffect(() => {
    if (sessionActive && gestureText.isActive && gestureText.currentLabel) {
      const word = gestureText.currentLabel;
      if (!gestures[0] || gestures[0].word !== word) {
        const entry: import("@/types").RecognizedGesture = {
          id:         Math.random().toString(36).slice(2, 9),
          word,
          confidence: Math.round(prediction.confidence * 100),
          timestamp:  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        };
        setGestures((prev) => [entry, ...prev]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureText.currentLabel, gestureText.isActive, sessionActive]);

  const handleSessionStart = useCallback(() => {
    if (!user) return;
    const id = Math.random().toString(36).slice(2, 11);
    setActiveSessionId(id);
    setStats(recordSessionStart(user.id));
    setSessionActive(true);
    setSessionStartAt(Date.now());
    setElapsedSeconds(0);
    setGestures([]);
  }, [user]);

  const handleSessionStop = useCallback(() => {
    if (!user || !sessionStartAt) return;
    const elapsed = Math.floor((Date.now() - sessionStartAt) / 1000);
    setStats(recordSessionEnd(user.id, elapsed));
    setSessionActive(false);
    setSessionStartAt(null);
    setElapsedSeconds(0);
    if (activeSessionId) {
      addSessionToHistory({
        id:        activeSessionId,
        title:     `Session — ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        createdAt: new Date(),
      });
      window.dispatchEvent(new Event("storage"));
    }
    setActiveSessionId(null);
  }, [user, sessionStartAt, activeSessionId]);

  const handleNewSession = useCallback(() => {
    if (sessionActive) handleSessionStop();
  }, [sessionActive, handleSessionStop]);

  const metrics = buildMetrics(stats, sessionActive ? elapsedSeconds : 0);

  return (
    <div className="flex min-h-screen bg-beige-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewSession={handleNewSession}
        activeSessionId={activeSessionId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 px-6 py-8 sm:px-8"
        >
          {/* Status cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => (
              <StatusCard key={metric.id} metric={metric} index={index} />
            ))}
          </div>

          {/* Primary grid */}
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.8fr_1fr]">
            {/* Camera — StandardSignLanguageCard integrated inside */}
            <CameraPanel
              onSessionStart={handleSessionStart}
              onSessionStop={handleSessionStop}
              sessionElapsed={elapsedSeconds}
              onFeatureVector={setFeatureVector}
              activeGestureLabel={
                sessionActive && gestureText.isActive ? gestureText.currentLabel : null
              }
              activeGestureSentence={
                sessionActive && gestureText.isActive ? gestureText.sentenceResult : null
              }
            />

            {/* Right column — clean, no redundancy */}
            <div className="flex flex-col gap-5">
              {/* Primary output: gesture → multilingual sentence + TTS */}
              <GestureTextPanel
                gestureText={gestureText}
                prediction={prediction}
                sessionActive={sessionActive}
              />

              {/* Gesture output log */}
              <GestureOutputPanel gestures={gestures} />

              {/* Add custom gesture mapping + sample recording */}
              <AddGesturePanel
                featureVector={featureVector}
                sessionActive={sessionActive}
              />

              {/* Dev tools toggle */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowDevTools((p) => !p)}
                  className="text-xs text-ink-400 hover:text-ink-600 transition-colors underline underline-offset-2"
                >
                  {showDevTools ? "Hide developer tools" : "Show developer tools"}
                </button>
              </div>

              {/* DatasetPanel — collapsed by default */}
              {showDevTools && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <DatasetPanel featureVector={featureVector} sessionActive={sessionActive} />
                </motion.div>
              )}
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
