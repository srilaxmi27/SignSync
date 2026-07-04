import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  CameraOff,
  Maximize2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Download,
  Circle,
  Hand,
  Gauge,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { SessionStatus } from "@/types";
import { useMediaPipe } from "@/hooks/useMediaPipe";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecordingState = "inactive" | "recording" | "stopped";

interface CameraError {
  type: "permission" | "notfound" | "unknown";
  message: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getCameraError(err: unknown): CameraError {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      return { type: "permission", message: "Camera permission denied. Allow access in browser settings." };
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError")
      return { type: "notfound", message: "No camera found on this device." };
  }
  return { type: "unknown", message: "Could not access camera. Please try again." };
}

const statusMap: Record<SessionStatus, { status: "live" | "idle"; label: string }> = {
  idle:        { status: "idle", label: "Camera off" },
  listening:   { status: "live", label: "Watching for signs" },
  translating: { status: "live", label: "Translating" },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface CameraPanelProps {
  onSessionStart?: () => void;
  onSessionStop?:  () => void;
  sessionElapsed?: number;   // live elapsed seconds from parent
}

export default function CameraPanel({
  onSessionStart,
  onSessionStop,
  sessionElapsed = 0,
}: CameraPanelProps) {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);   // MediaPipe overlay
  const streamRef       = useRef<MediaStream | null>(null);
  const mediaRecRef     = useRef<MediaRecorder | null>(null);
  const chunksRef       = useRef<Blob[]>([]);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef    = useRef<HTMLDivElement>(null);

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [micEnabled,    setMicEnabled]    = useState(true);
  const [recordState,   setRecordState]   = useState<RecordingState>("inactive");
  const [recordingTime, setRecordingTime] = useState(0);
  const [downloadUrl,   setDownloadUrl]   = useState<string | null>(null);
  const [cameraError,   setCameraError]   = useState<CameraError | null>(null);
  const [isFullscreen,  setIsFullscreen]  = useState(false);

  const isActive = sessionStatus !== "idle";
  const badge    = statusMap[sessionStatus];

  // ── MediaPipe hook ───────────────────────────────────────────────────────
  const {
    status:    mpStatus,
    handCount,
    fps,
    detected,
    start:     mpStart,
    stop:      mpStop,
  } = useMediaPipe(videoRef, canvasRef);

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: micEnabled,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setSessionStatus("listening");
      onSessionStart?.();
      // Give the video element one frame before starting MediaPipe
      setTimeout(() => mpStart(), 200);
    } catch (err) {
      setCameraError(getCameraError(err));
    }
  }, [micEnabled, mpStart, onSessionStart]);

  // ── Stop camera ───────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    mpStop();
    onSessionStop?.();
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      mediaRecRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setSessionStatus("idle");
    setRecordState("inactive");
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [mpStop, onSessionStop]);

  // ── Mic toggle ────────────────────────────────────────────────────────────
  const toggleMic = () => {
    if (!streamRef.current) return;
    const next = !micEnabled;
    streamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicEnabled(next);
  };

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    setDownloadUrl(null);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const rec = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecRef.current = rec;
    rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setDownloadUrl(URL.createObjectURL(blob));
      setRecordState("stopped");
      if (timerRef.current) clearInterval(timerRef.current);
    };
    rec.start(250);
    setRecordState("recording");
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") mediaRecRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const downloadRecording = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `signsync-session-${Date.now()}.webm`;
    a.click();
  };

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      mpStop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card id="camera" variant="elevated" className="flex flex-col gap-5">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink-900">Live translation</h2>
            <p className="text-sm text-ink-500">Point your camera and start signing</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {recordState === "recording" && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-600">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" />
                REC {formatDuration(recordingTime)}
              </span>
            )}
            {isActive && sessionElapsed > 0 && (
              <span className="rounded-full bg-signal-50 px-3 py-1 text-xs font-semibold text-signal-700">
                {formatDuration(sessionElapsed)}
              </span>
            )}
            <StatusBadge status={badge.status} label={badge.label} pulse={isActive} />
          </div>
        </div>

        {/* ── MediaPipe stats bar (only when active) ────────────────────── */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-3 overflow-hidden rounded-xl bg-signal-50 px-4 py-2.5"
          >
            {/* Hand detection status */}
            <div className="flex items-center gap-1.5">
              <Hand className={`h-4 w-4 ${detected ? "text-signal-600" : "text-ink-400"}`} />
              <span className={`text-xs font-semibold ${detected ? "text-signal-700" : "text-ink-400"}`}>
                {detected
                  ? `${handCount} Hand${handCount !== 1 ? "s" : ""} Detected`
                  : "No Hand Detected"}
              </span>
            </div>
            <div className="h-3 w-px bg-ink-900/10" />
            {/* FPS */}
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-ink-400" />
              <span className="text-xs font-medium text-ink-500">
                {fps > 0 ? `${fps.toFixed(1)} FPS` : "—"}
              </span>
            </div>
            <div className="h-3 w-px bg-ink-900/10" />
            {/* Connection status */}
            <span className={`ml-auto text-xs font-medium ${
              mpStatus === "processing" ? "text-signal-600" :
              mpStatus === "loading"    ? "text-amber-500"  :
              mpStatus === "error"      ? "text-coral-600"  :
              "text-ink-400"
            }`}>
              {mpStatus === "processing" ? "MediaPipe ✓" :
               mpStatus === "loading"    ? "Loading model…" :
               mpStatus === "error"      ? "MP Error" :
               "MediaPipe off"}
            </span>
          </motion.div>
        )}

        {/* ── Viewport ──────────────────────────────────────────────────── */}
        <div
          ref={containerRef}
          className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-ink-900"
        >
          {/* Raw webcam feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{ display: isActive ? "block" : "none" }}
          />

          {/* MediaPipe landmark overlay canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ display: isActive && detected ? "block" : "none", pointerEvents: "none" }}
          />

          <AnimatePresence mode="wait">
            {cameraError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900 px-6 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-500/10">
                  <CameraOff className="h-7 w-7 text-coral-500" />
                </div>
                <p className="text-sm font-semibold text-white">{cameraError.message}</p>
                {cameraError.type === "permission" && (
                  <p className="text-xs text-white/40">
                    Open browser settings → Site permissions → Camera → Allow
                  </p>
                )}
              </motion.div>
            )}

            {!isActive && !cameraError && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                  <Video className="h-8 w-8 text-white/30" />
                </div>
                <p className="text-sm font-medium text-white/40">
                  Press "Start session" to enable your camera
                </p>
              </motion.div>
            )}

            {isActive && !cameraError && (
              <motion.div
                key="active-overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0"
              >
                {/* Corner brackets */}
                <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-mint-400/60 rounded-tl" />
                <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-mint-400/60 rounded-tr" />
                <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-mint-400/60 rounded-bl" />
                <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-mint-400/60 rounded-br" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar — top right */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <button
              onClick={toggleFullscreen}
              className="rounded-lg bg-black/40 p-2 text-white/70 backdrop-blur-sm hover:text-white transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Mic indicator — bottom left */}
          {isActive && (
            <div className="absolute bottom-3 left-3">
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
                micEnabled ? "bg-black/40 text-white/70" : "bg-red-500/80 text-white"
              }`}>
                {micEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                {micEnabled ? "Mic on" : "Mic off"}
              </div>
            </div>
          )}
        </div>

        {/* ── Controls ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant={isActive ? "secondary" : "primary"}
            fullWidth
            onClick={isActive ? stopCamera : startCamera}
            leftIcon={isActive ? <VideoOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
          >
            {isActive ? "Stop session" : "Start session"}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            disabled={!isActive}
            onClick={toggleMic}
            leftIcon={micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          >
            {micEnabled ? "Mute mic" : "Unmute mic"}
          </Button>
        </div>

        {/* ── Recording controls ────────────────────────────────────────── */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3 border-t border-ink-900/6 pt-4 sm:flex-row"
          >
            {recordState !== "recording" ? (
              <Button
                variant="primary"
                fullWidth
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700"
                leftIcon={<Circle className="h-4 w-4 fill-current" />}
              >
                Start recording
              </Button>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onClick={stopRecording}
                leftIcon={<VideoOff className="h-5 w-5" />}
              >
                Stop recording
              </Button>
            )}
            {downloadUrl && recordState === "stopped" && (
              <Button
                variant="secondary"
                fullWidth
                onClick={downloadRecording}
                leftIcon={<Download className="h-5 w-5" />}
              >
                Download clip
              </Button>
            )}
          </motion.div>
        )}

        {/* ── Permission tip ────────────────────────────────────────────── */}
        {!isActive && !cameraError && (
          <p className="text-center text-xs text-ink-400">
            Your browser will ask for camera &amp; microphone permission when you start a session.
          </p>
        )}
      </Card>
    </motion.div>
  );
}
