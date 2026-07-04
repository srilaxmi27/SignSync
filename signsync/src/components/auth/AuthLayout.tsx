import { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Logo from "@/components/ui/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  heading: string;
  subheading: string;
  sidePoints: string[];
}

export default function AuthLayout({
  children,
  heading,
  subheading,
  sidePoints,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Logo />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            <h1 className="text-3xl font-bold text-ink-900">{heading}</h1>
            <p className="mt-2 text-base text-ink-500">{subheading}</p>
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-signal-800 via-signal-700 to-ink-900 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 10%, rgba(76,217,176,0.25), transparent 40%), radial-gradient(circle at 10% 80%, rgba(76,141,255,0.3), transparent 45%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-md text-white"
        >
          <h2 className="text-3xl font-bold leading-tight">
            Every conversation deserves to flow both ways.
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {sidePoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint-400" />
                <span className="text-signal-100/90">{point}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
