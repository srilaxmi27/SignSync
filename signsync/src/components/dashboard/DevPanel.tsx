/**
 * DevPanel — Landmark Pipeline Debug Overlay
 * ───────────────────────────────────────────
 * Shows live pipeline stats over the camera viewport.
 *
 * To disable: set VITE_DEV_PANEL=false in your .env (or just don't render it).
 * The component renders nothing when `enabled` is false, so it is zero-cost
 * in production.
 *
 * Usage:
 *   <DevPanel enabled stats={pipelineStats} fps={fps} />
 */

import type { PipelineStats } from "@/hooks/useLandmarkPipeline";

interface DevPanelProps {
  enabled: boolean;
  stats:   PipelineStats;
  fps:     number;
}

// Control flag — set VITE_DEV_PANEL=false to hide in prod
const PANEL_ENABLED =
  import.meta.env.VITE_DEV_PANEL !== "false";

export default function DevPanel({ enabled, stats, fps }: DevPanelProps) {
  if (!enabled || !PANEL_ENABLED) return null;

  const rows: [string, string | number][] = [
    ["Hands detected",    stats.handCount],
    ["Total landmarks",   stats.totalLandmarks],
    ["Processing time",   `${stats.processingTimeMs.toFixed(2)} ms`],
    ["Feature length",    stats.featureLength],
    ["Confidence",        stats.maxConfidence > 0 ? `${(stats.maxConfidence * 100).toFixed(0)}%` : "—"],
    ["Detection FPS",     fps > 0 ? fps : "—"],
  ];

  return (
    <div
      className="absolute bottom-12 right-3 z-20 min-w-[180px] overflow-hidden rounded-xl bg-black/70 backdrop-blur-sm text-[11px] font-mono"
      aria-label="Developer debug panel"
    >
      <div className="border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
        Dev Panel
      </div>
      <table className="w-full">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-1 text-white/50">{label}</td>
              <td className="px-3 py-1 text-right font-semibold text-mint-400">
                {String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
