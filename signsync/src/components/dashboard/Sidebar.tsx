import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Camera,
  History,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Overview",         icon: LayoutDashboard, href: "#overview" },
  { label: "Live translation", icon: Camera,           href: "#camera" },
  { label: "Activity history", icon: History,          href: "#activity" },
  { label: "Settings",         icon: Settings,         href: null },
  { label: "Help & support",   icon: HelpCircle,       href: null },
];

const drawerVariants = {
  closed: { x: "-100%", transition: { type: "tween" as const, duration: 0.28, ease: [0.4, 0, 1, 1] as number[] } },
  open:   { x: 0,       transition: { type: "tween" as const, duration: 0.32, ease: [0, 0, 0.2, 1] as number[] } },
};

const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = ({ animate }: { animate?: boolean }) => (
    <div className="flex h-full flex-col bg-signal-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
        <Logo light />
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/5 hover:text-white lg:hidden transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4">
        <motion.ul
          className="flex flex-col gap-1"
          variants={animate ? containerVariants : undefined}
          initial={animate ? "hidden" : undefined}
          animate={animate ? "visible" : undefined}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li key={item.href} variants={animate ? itemVariants : undefined}>
                <NavItem item={item} Icon={Icon} />
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 px-4 pb-6 pt-4">
        {user && (
          <div className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-signal-400 to-signal-600 text-sm font-bold text-white">
              {user.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-coral-400 transition-colors hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="absolute left-0 top-0 h-full w-72 shadow-2xl"
            >
              <SidebarContent animate />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ item, Icon }: { item: (typeof navItems)[0]; Icon: typeof LayoutDashboard }) {
  const handleClick = (e: React.MouseEvent) => {
    if (!item.href) return; // no-op for items without a target section
    e.preventDefault();
    const el = document.querySelector(item.href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <a
      href={item.href ?? "#"}
      onClick={handleClick}
      title={!item.href ? "Coming soon" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150",
        item.href
          ? "text-white/60 hover:bg-white/5 hover:text-white"
          : "cursor-default text-white/30"
      )}
    >
      <Icon className="h-5 w-5 shrink-0 transition-colors" />
      {item.label}
      {!item.href && (
        <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/40">
          Soon
        </span>
      )}
    </a>
  );
}
