/**
 * useMediaPipe — runs MediaPipe Hands entirely in the browser.
 *
 * No WebSocket. No network round-trip.
 * The HandLandmarker WASM runs in the same JS thread as the video element,
 * processing each frame synchronously before the next rAF tick.
 *
 * Result: true zero-latency detection — landmarks move with the hand,
 * not 1-2 frames behind it.
 */

import { useCallback, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LandmarkPoint {
  id: number;
  x:  number;   // normalised 0-1
  y:  number;
  z:  number;
}

export interface HandData {
  hand_index: number;
  handedness: "Left" | "Right";
  landmarks:  LandmarkPoint[];
}

export interface MediaPipeFrame {
  hand_count: number;
  fps:        number;
  detected:   boolean;
  hands:      HandData[];
}

export type MediaPipeStatus =
  | "idle"
  | "loading"
  | "processing"
  | "error"
  | "stopped";

// ─── Hand skeleton connections ────────────────────────────────────────────────

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20],
];

// ─── Drawing ─────────────────────────────────────────────────────────────────

function drawHands(
  ctx:   CanvasRenderingContext2D,
  hands: HandData[],
  cw:    number,
  ch:    number,
) {
  ctx.clearRect(0, 0, cw, ch);
  for (const hand of hands) {
    const pts = hand.landmarks.map((lm) => ({
      x: lm.x * cw,
      y: lm.y * ch,
    }));

    // Connections
    ctx.strokeStyle = "rgba(80, 220, 160, 0.9)";
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = "round";
    for (const [a, b] of CONNECTIONS) {
      if (!pts[a] || !pts[b]) continue;
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    }

    // Dots
    for (let i = 0; i < pts.length; i++) {
      ctx.beginPath();
      // Fingertips (4,8,12,16,20) slightly larger
      const r = [4, 8, 12, 16, 20].includes(i) ? 6 : 4;
      ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
      ctx.fillStyle = [4, 8, 12, 16, 20].includes(i)
        ? "rgba(255, 220, 60, 1)"
        : "rgba(0, 230, 120, 1)";
      ctx.fill();
    }
  }
}

// ─── FPS tracker ─────────────────────────────────────────────────────────────

class FpsTracker {
  private times: number[] = [];
  private window = 30;

  tick(): number {
    const now = performance.now();
    this.times.push(now);
    if (this.times.length > this.window) this.times.shift();
    if (this.times.length < 2) return 0;
    const elapsed = this.times[this.times.length - 1] - this.times[0];
    return elapsed > 0 ? ((this.times.length - 1) / elapsed) * 1000 : 0;
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMediaPipe(
  videoRef:  React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef        = useRef<number | null>(null);
  const fpsRef        = useRef(new FpsTracker());
  const lastTs        = useRef(0);

  const [status,    setStatus]    = useState<MediaPipeStatus>("idle");
  const [handCount, setHandCount] = useState(0);
  const [fps,       setFps]       = useState(0);
  const [detected,  setDetected]  = useState(false);
  const [lastFrame, setLastFrame] = useState<MediaPipeFrame | null>(null);

  // ── Load model (once) ────────────────────────────────────────────────────
  const loadModel = useCallback(async () => {
    if (landmarkerRef.current) return; // already loaded
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_URL,
        delegate: "GPU",  // falls back to CPU automatically if GPU unavailable
      },
      runningMode:              "VIDEO",
      numHands:                  2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence:  0.5,
      minTrackingConfidence:      0.5,
    });
  }, []);

  // ── Detection loop ───────────────────────────────────────────────────────
  const runLoop = useCallback(() => {
    const video   = videoRef.current;
    const canvas  = canvasRef.current;
    const lm      = landmarkerRef.current;

    if (!video || !canvas || !lm || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runLoop);
      return;
    }

    // Sync canvas size to displayed video
    const dw = canvas.offsetWidth  || video.videoWidth  || 640;
    const dh = canvas.offsetHeight || video.videoHeight || 360;
    if (canvas.width !== dw || canvas.height !== dh) {
      canvas.width  = dw;
      canvas.height = dh;
    }

    const nowMs = performance.now();
    // VIDEO mode requires strictly increasing timestamps
    const ts = nowMs > lastTs.current ? nowMs : lastTs.current + 1;
    lastTs.current = ts;

    // ── Run detection (synchronous in VIDEO mode) ────────────────────────
    const result: HandLandmarkerResult = lm.detectForVideo(video, ts);
    const currentFps = fpsRef.current.tick();

    // Build structured hand data
    const hands: HandData[] = result.handedness.map((h, i) => ({
      hand_index: i,
      handedness: (h[0]?.categoryName ?? "Right") as "Left" | "Right",
      landmarks: (result.landmarks[i] ?? []).map(
        (lmk: NormalizedLandmark, id: number) => ({
          id,
          x: lmk.x,
          y: lmk.y,
          z: lmk.z,
        })
      ),
    }));

    const frame: MediaPipeFrame = {
      hand_count: hands.length,
      fps:        Math.round(currentFps),
      detected:   hands.length > 0,
      hands,
    };

    // ── Draw on canvas ───────────────────────────────────────────────────
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (hands.length > 0) {
        drawHands(ctx, hands, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // ── Update React state (batched, non-blocking) ────────────────────────
    setHandCount(frame.hand_count);
    setFps(frame.fps);
    setDetected(frame.detected);
    setLastFrame(frame);

    rafRef.current = requestAnimationFrame(runLoop);
  }, [videoRef, canvasRef]);

  // ── start ─────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    if (rafRef.current) return;
    setStatus("loading");
    try {
      await loadModel();
      fpsRef.current = new FpsTracker();
      lastTs.current = 0;
      setStatus("processing");
      rafRef.current = requestAnimationFrame(runLoop);
    } catch (err) {
      console.error("MediaPipe load error:", err);
      setStatus("error");
    }
  }, [loadModel, runLoop]);

  // ── stop ──────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

    setStatus("stopped");
    setHandCount(0);
    setFps(0);
    setDetected(false);
    setLastFrame(null);
  }, [canvasRef]);

  return { status, handCount, fps, detected, lastFrame, start, stop };
}
