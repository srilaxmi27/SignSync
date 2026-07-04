import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-paper pb-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-xl3 bg-gradient-to-br from-signal-500 via-signal-600 to-signal-700 px-8 py-16 text-center text-white sm:px-16"
        >
          {/* Overlay orbs */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.20), transparent 40%), radial-gradient(circle at 85% 80%, rgba(76,217,176,0.15), transparent 40%)",
            }}
          />
          {/* Grid pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative">
            <h2 className="text-balance text-3xl font-bold sm:text-4xl">
              Ready for conversations without barriers?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-signal-100/90">
              Create a free SignSync account and start translating sign language in minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-signal-700 hover:bg-signal-50"
                onClick={() => navigate("/register")}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Create free account
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
                I already have an account
              </Button>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
