import { useState } from "react";
import {
  LayoutDashboard,
  Camera,
  History,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "#overview" },
  { label: "Live translation", icon: Camera, href: "#camera" },
  { label: "Activity history", icon: History, href: "#activity" },
  { label: "Settings", icon: Settings, href: "#settings" },
  { label: "Help & support", icon: HelpCircle, href: "#help" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const [activeHref, setActiveHref] = useState("#overview");

  const content = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between px-6 py-6">
        <Logo />
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-900/5 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setActiveHref(item.href)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-signal-50 text-signal-600"
                      : "text-ink-600 hover:bg-ink-900/5"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-coral-600 transition-colors hover:bg-coral-500/10"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-ink-900/5 lg:block">
        {content}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
