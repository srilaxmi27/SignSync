import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Mic, Plus, X, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import SessionHistory, { type SessionEntry } from "@/components/dashboard/SessionHistory";

interface SidebarProps {
  isOpen:            boolean;
  onClose:           () => void;
  onNewSession?:     () => void;
  activeSessionId?:  string | null;
}

// ─── Session persistence ───────────────────────────────────────────────────────

const SESSIONS_KEY = "signsync.sessions";

function loadSessions(): SessionEntry[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return (
      JSON.parse(raw) as Array<{ id: string; title: string; createdAt: string; transcript?: string[] }>
    ).map((s) => ({ ...s, createdAt: new Date(s.createdAt) }));
  } catch { return []; }
}

function saveSessions(sessions: SessionEntry[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
}

function getEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}`;
  return url;
}

/** Call this from DashboardPage when a session ends. */
export function addSessionToHistory(entry: SessionEntry): void {
  const sessions = loadSessions();
  sessions.unshift(entry);
  saveSessions(sessions);
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const drawerVariants = {
  closed: { x: "-100%", transition: { type: "tween" as const, duration: 0.28, ease: [0.4, 0, 1, 1] as number[] } },
  open:   { x: 0,       transition: { type: "tween" as const, duration: 0.32, ease: [0, 0, 0.2, 1] as number[] } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({
  isOpen,
  onClose,
  onNewSession,
  activeSessionId = null,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  // Refresh session list whenever the sidebar becomes visible
  useEffect(() => { setSessions(loadSessions()); }, [isOpen]);

  // Also refresh on storage events (e.g. session saved from another tab or same page)
  useEffect(() => {
    const onStorage = () => setSessions(loadSessions());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout      = useCallback(() => { logout(); navigate("/"); }, [logout, navigate]);
  const handleNewSession  = useCallback(() => {
    navigate("/dashboard");
    onNewSession?.();
    onClose();
  }, [navigate, onNewSession, onClose]);
  const handleSelect = useCallback((_id: string) => {
    navigate("/dashboard");
    onClose();
  }, [navigate, onClose]);

  const handleRename = useCallback((id: string, newTitle: string) => {
    setSessions((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, title: newTitle } : s);
      saveSessions(next);
      return next;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveSessions(next);
      return next;
    });
  }, []);

  const handleExport = useCallback((id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    const lines = [
      `# SignSync Transcript — ${session.title}`,
      `Date: ${session.createdAt.toLocaleString()}`,
      "",
      ...(session.transcript ?? ["(no transcript)"]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `signsync-transcript-${session.id}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [sessions]);

  const Content = ({ animate: _animate }: { animate?: boolean }) => (
    <div className="flex h-full flex-col bg-signal-700">

      {/* Logo + close */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
        <Logo light />
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white lg:hidden transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* New Session */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={handleNewSession}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 active:bg-white/20"
        >
          <Plus className="h-4 w-4" />
          New Session
        </button>
      </div>

      {/* Session history */}
      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
        <SessionHistory
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={handleSelect}
          onRename={handleRename}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      </div>

      {/* ISL Basics Tutorial */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            <Youtube className="h-3.5 w-3.5 text-red-400" />
            ISL basics
          </div>
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
            <iframe
              src={getEmbedUrl("https://www.youtube.com/watch?v=6w1ZDaE-whc&list=PLMN7QCuj6dfaUwmtdkdKhINGZzyGwp7Q1")}
              title="Basic Indian Sign Language tutorial"
              className="aspect-video w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="mt-2 text-[11px] leading-5 text-white/60">
            Learn core ISL signs and everyday phrases from a beginner-friendly video.
          </p>
        </div>
      </div>

      {/* Speech Translation */}
      <div className="border-t border-white/5 px-3 py-3">
        <button
          onClick={() => { navigate("/speech"); onClose(); }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Mic className="h-5 w-5 shrink-0" />
          Speech Translation
        </button>
      </div>

      {/* User + Logout */}
      <div className="border-t border-white/5 px-3 pb-5 pt-3">
        {user && (
          <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-signal-400 to-signal-600 text-xs font-bold text-white">
              {user.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-[10px] text-white/40">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-coral-400 transition-colors hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-hidden">
          <Content />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              variants={drawerVariants}
              initial="closed" animate="open" exit="closed"
              className="absolute left-0 top-0 h-full w-64 shadow-2xl"
            >
              <Content animate />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
