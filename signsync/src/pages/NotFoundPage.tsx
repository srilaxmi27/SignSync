import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <div className="mb-10">
        <Logo />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <svg
          width="220"
          height="140"
          viewBox="0 0 220 140"
          className="mx-auto mb-8"
          role="img"
          aria-label="Illustration of a hand signing a question mark shape, indicating a page that could not be found"
        >
          <circle cx="60" cy="70" r="6" fill="#2563EB" />
          <circle cx="110" cy="40" r="6" fill="#2563EB" />
          <circle cx="160" cy="70" r="6" fill="#2563EB" />
          <circle cx="90" cy="110" r="6" fill="#4CD9B0" />
          <circle cx="130" cy="110" r="6" fill="#4CD9B0" />
          <path
            d="M60 70 L110 40 L160 70 M90 110 L60 70 M130 110 L160 70 M90 110 L130 110"
            stroke="#B4D0FF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        <h1 className="font-display text-5xl font-bold text-ink-900 sm:text-6xl">
          404
        </h1>
        <p className="mt-4 max-w-md text-lg text-ink-500">
          We couldn't find the sign you were looking for. The page may have
          moved or no longer exists.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button variant="primary" size="lg">
              <Home className="h-5 w-5" />
              Back to home
            </Button>
          </Link>
          <Button variant="secondary" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
            Go back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
