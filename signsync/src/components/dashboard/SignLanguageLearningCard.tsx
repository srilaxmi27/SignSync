import { motion } from "framer-motion";
import { Youtube, GraduationCap } from "lucide-react";
import Card from "@/components/ui/Card";

// =========================================================================
// CONFIGURATION CONSTANTS (REPLACE YOUTUBE URL HERE)
// =========================================================================
// Replace this URL with your desired YouTube tutorial embed URL:
// Example format: "https://www.youtube.com/embed/dQw4w9WgXcQ"
export const YOUTUBE_TUTORIAL_URL = "https://www.youtube.com/watch?v=6w1ZDaE-whc&list=PLMN7QCuj6dfaUwmtdkdKhINGZzyGwp7Q1";

function getEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  
  // Extract video ID from watch URL or short share URL
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export default function SignLanguageLearningCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card variant="elevated" className="flex flex-col gap-4 overflow-hidden border border-mint-100 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">Learn Sign Language</h2>
            <p className="text-sm text-ink-500">Master basic gestures & phrases</p>
          </div>
        </div>

        {/* Video Tutorial Title and Description */}
        <div className="flex flex-col gap-1.5 px-1">
          <h3 className="text-sm font-bold text-ink-800 flex items-center gap-1.5">
            <Youtube className="h-4 w-4 text-red-500" />
            Complete Indian & American Sign Language Basics
          </h3>
          <p className="text-xs text-ink-500 leading-relaxed">
            Follow this comprehensive tutorial video to learn fundamental signs like alphabet, numbers, greetings, and common phrases. Align your hands with the camera to practice live!
          </p>
        </div>

        {/* Responsive Youtube Iframe Container */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-ink-900/10 shadow-sm bg-black">
          <iframe
            src={getEmbedUrl(YOUTUBE_TUTORIAL_URL)}
            title="Sign Language Tutorial for Beginners"
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </Card>
    </motion.div>
  );
}
