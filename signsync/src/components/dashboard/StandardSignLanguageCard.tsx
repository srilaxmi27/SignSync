import { motion } from "framer-motion";
import { BookOpen, Video, Image as ImageIcon, ExternalLink, Globe } from "lucide-react";
import Card from "@/components/ui/Card";
import type { SentenceResult } from "@/lib/sentenceGenerator";

interface StandardSignLanguageCardProps {
  label: string;
  sentenceResult: SentenceResult;
}

function getEmbedUrl(url?: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export default function StandardSignLanguageCard({
  label,
  sentenceResult,
}: StandardSignLanguageCardProps) {
  const {
    sentence,
    standardName,
    emoji,
    tutorialUrl,
    imageUrl,
    gifUrl,
    videoUrl,
    externalLink,
  } = sentenceResult;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" className="flex flex-col gap-4 overflow-hidden border border-signal-100 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-soft">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">Sign Language Reference</h2>
            <p className="text-sm text-ink-500">Dictionary details & tutorials</p>
          </div>
        </div>

        {/* Translation metadata grid */}
        <div className="grid gap-3 sm:grid-cols-3 rounded-xl2 bg-beige-50 p-4">
          <div className="flex flex-col gap-1 border-b pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3 border-ink-900/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Detected Gesture</span>
            <span className="flex items-center gap-1.5 font-display text-base font-bold capitalize text-ink-900">
              <span className="text-lg">{emoji}</span>
              {label}
            </span>
          </div>

          <div className="flex flex-col gap-1 border-b pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3 border-ink-900/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Generated Sentence</span>
            <span className="text-sm font-semibold text-ink-800 line-clamp-2">
              "{sentence}"
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Standard Sign Language</span>
            <span className="flex items-center gap-1 text-sm font-bold text-signal-600">
              <Globe className="h-3.5 w-3.5" />
              {standardName}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-signal-100 bg-signal-50/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">Learning guide</p>
              <p className="text-sm font-semibold text-ink-700">Open a YouTube tutorial for this sign.</p>
            </div>
            <a
              href={tutorialUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${standardName || label} sign language tutorial`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <Video className="h-3.5 w-3.5" />
              YouTube tutorial
            </a>
          </div>
        </div>

        {/* Extensible Future Expansion Sections */}
        {(imageUrl || gifUrl || videoUrl || tutorialUrl || externalLink) && (
          <div className="flex flex-col gap-3 border-t border-ink-900/5 pt-4">
            {/* Image & GIF section */}
            {(imageUrl || gifUrl) && (
              <div className="flex flex-wrap gap-3">
                {imageUrl && (
                  <div className="flex-1 min-w-[200px] rounded-xl overflow-hidden border border-ink-900/10">
                    <div className="bg-ink-100 flex items-center justify-center p-1 text-ink-400 text-xs">
                      <ImageIcon className="h-3.5 w-3.5 mr-1" /> Reference Image
                    </div>
                    <img src={imageUrl} alt={label} className="w-full h-auto object-cover" />
                  </div>
                )}
                {gifUrl && (
                  <div className="flex-1 min-w-[200px] rounded-xl overflow-hidden border border-ink-900/10">
                    <div className="bg-ink-100 flex items-center justify-center p-1 text-ink-400 text-xs">
                      <ImageIcon className="h-3.5 w-3.5 mr-1" /> Sign GIF Demo
                    </div>
                    <img src={gifUrl} alt={`${label} sign`} className="w-full h-auto object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* Video file player section */}
            {videoUrl && (
              <div className="rounded-xl overflow-hidden border border-ink-900/10">
                <div className="bg-ink-100 flex items-center justify-center p-1 text-ink-400 text-xs">
                  <Video className="h-3.5 w-3.5 mr-1" /> Demonstration Video
                </div>
                <video src={videoUrl} controls className="w-full max-h-60 object-contain" />
              </div>
            )}

            {/* Tutorial YouTube Video Iframe */}
            {tutorialUrl && (
              <div className="rounded-xl overflow-hidden border border-ink-900/10 shadow-sm">
                <div className="bg-ink-100 flex items-center justify-center p-1.5 text-ink-500 text-xs font-semibold">
                  <Video className="h-3.5 w-3.5 mr-1 text-red-500" /> Interactive Tutorial
                </div>
                <div className="relative w-full aspect-video">
                  <iframe
                    src={getEmbedUrl(tutorialUrl)}
                    title={`${label} Sign Tutorial`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* External reference link */}
            {externalLink && (
              <a
                href={externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-signal-200 bg-signal-50/50 py-2.5 text-xs font-bold text-signal-700 hover:bg-signal-50 transition-all shadow-soft"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open External Dictionary & Study Guide
              </a>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
