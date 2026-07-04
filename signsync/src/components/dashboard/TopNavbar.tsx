import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopNavbarProps {
  onMenuClick: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-ink-900/5 bg-white/80 px-6 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink-600 hover:bg-ink-900/5 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-ink-900 sm:text-xl">
            Welcome back{user ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-ink-500">
            Here's what's happening with your translations today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl bg-ink-900/5 px-3 py-2 sm:flex">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search sessions"
            className="w-40 bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
          />
        </div>

        <button
          className="relative rounded-xl p-2.5 text-ink-600 hover:bg-ink-900/5"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral-500" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-500 text-sm font-bold text-white">
          {user?.avatarInitials ?? "SS"}
        </div>
      </div>
    </header>
  );
}
