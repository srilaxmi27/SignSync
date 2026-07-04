import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-beige-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-signal-400 to-signal-600 shadow-glow-signal">
          <Leaf className="h-10 w-10 text-white" />
        </div>

        {/* 404 */}
        <p className="font-display text-8xl font-bold gradient-text-green">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Page not found</h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-ink-500">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/")}
            leftIcon={<ArrowLeft className="h-5 w-5" />}
          >
            Back to home
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/dashboard")}>
            Go to dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
