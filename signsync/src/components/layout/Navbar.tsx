import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { NavLink } from "@/types";
import { cn } from "@/lib/utils";

const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-card border-b border-ink-900/5"
          : "bg-transparent"
      )}
    >
      <nav className="section-container flex h-20 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-semibold text-ink-600 transition-colors hover:text-signal-600"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Log in
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
            Get started
          </Button>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-xl p-2 text-ink-700 lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-ink-900/5 bg-white lg:hidden"
          >
            <div className="section-container flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="rounded-xl px-3 py-3 text-left text-base font-semibold text-ink-700 hover:bg-signal-50"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ink-900/5 pt-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Get started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
