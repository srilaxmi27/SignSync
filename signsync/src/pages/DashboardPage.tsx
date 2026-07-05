import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Mic, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar, { addSessionToHistory } from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import StatusCard from "@/components/dashboard/StatusCard";
import CameraPanel from "@/components/dashboard/CameraPanel";
import GestureOutputPanel from "@/components/dashboard/GestureOutputPanel";
import GestureTextPanel from "@/components/dashboard/GestureTextPanel";
import AddGesturePanel from "@/components/dashboard/AddGesturePanel";
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
import Button from "@/components/ui/Button";

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
  const navigate = useNavigate();

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
  const [sosMessage,      setSosMessage]      = useState("");

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
    if (sessionActive) {
      handleSessionStop();
      window.setTimeout(() => handleSessionStart(), 120);
      return;
    }
    handleSessionStart();
  }, [sessionActive, handleSessionStart, handleSessionStop]);

  const handleSos = useCallback(() => {
    if (!sessionActive) {
      handleSessionStart();
    }

    let contact = "";
    try {
      const storedProfile = window.localStorage.getItem("signsync.profile");
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile) as { emergencyContact?: string };
        contact = parsedProfile.emergencyContact?.trim() || "";
      }
    } catch {
      contact = "";
    }

    const target = contact || "112";
    setSosMessage(`Camera session started and the app is trying to call ${target}.`);

    try {
      const link = `tel:${target}`;
      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => {
        window.location.assign(link);
      }, 120);
    } catch {
      setSosMessage("Emergency assistance is not available in this browser context. Please call local emergency services directly.");
    }
  }, [handleSessionStart, sessionActive]);

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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-signal-100 bg-white/80 p-4 shadow-card">
            <div>
              <p className="text-sm font-semibold text-ink-900">Need voice input?</p>
              <p className="text-sm text-ink-500">Open the speech translator for live microphone capture and Telugu-friendly speech output.</p>
            </div>
            <Button variant="primary" onClick={() => navigate("/speech")} leftIcon={<Mic className="h-4 w-4" />}>
              Open speech input
            </Button>
          </div>

          <div className="mt-4 rounded-2xl border border-coral-200 bg-coral-50/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-coral-500/10 text-coral-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">SOS — Emergency assist</p>
                  <p className="mt-1 text-sm text-ink-600">Need immediate help? Use this option to open emergency calling quickly.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                leftIcon={<Phone className="h-4 w-4" />}
                onClick={handleSos}
              >
                Call emergency help
              </Button>
            </div>
            {sosMessage && (
              <p className="mt-3 text-sm font-medium text-coral-700">{sosMessage}</p>
            )}
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
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
