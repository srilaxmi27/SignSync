import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Search, LogOut, User, Settings, HelpCircle, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface TopNavbarProps {
  onMenuClick: () => void;
}

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  const g = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${g}, ${name.split(" ")[0]}` : g;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-signal-700/80 px-6 backdrop-blur-xl sm:px-8"
      style={{ height: "4.5rem" }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-white sm:text-lg">{getGreeting(user?.name ?? "")}</h1>
          <p className="text-xs text-white/40">Live translation workspace</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.div
          layout
          className="hidden items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 sm:flex"
          animate={{ width: searchFocused ? 220 : 160 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            type="text"
            placeholder="Search sessions"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
        </motion.div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((p) => !p)}
            className="relative rounded-xl p-2.5 text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral-500 ring-2 ring-signal-700" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                key="notif"
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl2 border border-white/10 bg-signal-700 shadow-elevated"
              >
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <button onClick={() => setNotifOpen(false)} className="text-white/40 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-white/40">You're all caught up!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar + profile dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-white/5 transition-colors"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-signal-400 to-signal-600 text-sm font-bold text-white shadow-glow-signal">
              {user?.avatarInitials ?? "SS"}
            </div>
            <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                key="profile-dropdown"
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl2 border border-white/10 bg-signal-700 shadow-elevated"
              >
                {user && (
                  <div className="border-b border-white/5 px-4 py-3">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/40">{user.email}</p>
                  </div>
                )}
                <div className="p-1">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate("/dashboard"); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" /> Help &amp; Support
                  </button>
                  <div className="my-1 border-t border-white/5" />
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); navigate("/"); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-coral-400 hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
