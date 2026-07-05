/**
 * SessionHistory
 * ──────────────
 * Displays previous translation sessions grouped by Today / Yesterday / Last Week.
 * Each item has a contextual menu: Rename, Delete, Export Transcript.
 */

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, MoreHorizontal, Pencil, Trash2, FileDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SessionEntry {
  id:         string;
  title:      string;
  createdAt:  Date;
  transcript?: string[];   // list of recognized gesture sentences
}

interface SessionHistoryProps {
  sessions:        SessionEntry[];
  activeSessionId: string | null;
  onSelect:        (id: string) => void;
  onRename?:       (id: string, newTitle: string) => void;
  onDelete?:       (id: string) => void;
  onExport?:       (id: string) => void;
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

function groupSessions(sessions: SessionEntry[]) {
  const now              = new Date();
  const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  const startOfLastWeek  = new Date(startOfToday.getTime() - 7 * 86_400_000);

  const today:    SessionEntry[] = [];
  const yesterday: SessionEntry[] = [];
  const lastWeek: SessionEntry[] = [];

  for (const s of sessions) {
    if (s.createdAt >= startOfToday)      today.push(s);
    else if (s.createdAt >= startOfYesterday) yesterday.push(s);
    else if (s.createdAt >= startOfLastWeek)  lastWeek.push(s);
  }
  return { today, yesterday, lastWeek };
}

// ─── Context menu ─────────────────────────────────────────────────────────────

interface ContextMenuProps {
  sessionId:   string;
  title:       string;
  onRename?:   (id: string, t: string) => void;
  onDelete?:   (id: string) => void;
  onExport?:   (id: string) => void;
  onClose:     () => void;
}

function ContextMenu({ sessionId, title, onRename, onDelete, onExport, onClose }: ContextMenuProps) {
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const commitRename = () => {
    if (draftTitle.trim() && draftTitle.trim() !== title) {
      onRename?.(sessionId, draftTitle.trim());
    }
    setRenaming(false);
    onClose();
  };

  if (renaming) {
    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-signal-800 shadow-elevated p-2">
        <input
          autoFocus
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") onClose(); }}
          className="w-full rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-signal-400"
          placeholder="Session name…"
        />
        <div className="mt-1.5 flex gap-1">
          <button onClick={commitRename} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-signal-500 py-1.5 text-xs font-semibold text-white hover:bg-signal-600 transition-colors">
            <Check className="h-3 w-3" /> Save
          </button>
          <button onClick={onClose} className="flex flex-1 items-center justify-center rounded-lg bg-white/10 py-1.5 text-xs text-white/60 hover:bg-white/15 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-signal-800 p-1 shadow-elevated"
    >
      {onRename && (
        <button onClick={() => setRenaming(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <Pencil className="h-3.5 w-3.5" /> Rename
        </button>
      )}
      {onExport && (
        <button onClick={() => { onExport(sessionId); onClose(); }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <FileDown className="h-3.5 w-3.5" /> Export transcript
        </button>
      )}
      {onDelete && (
        <>
          <div className="my-0.5 border-t border-white/5" />
          <button onClick={() => { onDelete(sessionId); onClose(); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-coral-400 hover:bg-white/10 transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </>
      )}
    </motion.div>
  );
}

// ─── Single item ──────────────────────────────────────────────────────────────

function SessionItem({
  session, isActive, onSelect, onRename, onDelete, onExport,
}: {
  session: SessionEntry;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename?: (id: string, t: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  const handleBlur = (e: React.FocusEvent) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setMenuOpen(false);
  };

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "group flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors cursor-pointer",
          isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
        )}
      >
        <button onClick={() => onSelect(session.id)} className="flex flex-1 items-center gap-2 min-w-0 text-left">
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="truncate text-xs">{session.title}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
          className="shrink-0 rounded-md p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
          aria-label="Session options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <ContextMenu
            sessionId={session.id}
            title={session.title}
            onRename={onRename}
            onDelete={onDelete}
            onExport={onExport}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Group ────────────────────────────────────────────────────────────────────

function SessionGroup({
  label, sessions, activeSessionId, onSelect, onRename, onDelete, onExport,
}: {
  label: string;
  sessions: SessionEntry[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onRename?: (id: string, t: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (id: string) => void;
}) {
  if (sessions.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-white/25">
        {label}
      </p>
      {sessions.map((s) => (
        <SessionItem
          key={s.id}
          session={s}
          isActive={activeSessionId === s.id}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          onExport={onExport}
        />
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SessionHistory({
  sessions, activeSessionId, onSelect, onRename, onDelete, onExport,
}: SessionHistoryProps) {
  const groups = useMemo(() => groupSessions(sessions), [sessions]);

  if (sessions.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-xs text-white/25">
        No previous sessions
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <SessionGroup label="Today"     sessions={groups.today}     activeSessionId={activeSessionId} onSelect={onSelect} onRename={onRename} onDelete={onDelete} onExport={onExport} />
      <SessionGroup label="Yesterday" sessions={groups.yesterday} activeSessionId={activeSessionId} onSelect={onSelect} onRename={onRename} onDelete={onDelete} onExport={onExport} />
      <SessionGroup label="Last Week" sessions={groups.lastWeek}  activeSessionId={activeSessionId} onSelect={onSelect} onRename={onRename} onDelete={onDelete} onExport={onExport} />
    </div>
  );
}
