import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Trash2,
  Globe,
  Play,
  Square,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// Web Speech API interfaces
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

export default function SpeechTranslationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Speech to Text (STT) State ──────────────────────────────────────────────
  const [sttText, setSttText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [sttLang, setSttLang] = useState<"en-US" | "te-IN" | "hi-IN">("en-US");
  const [sttError, setSttError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // ── Text to Speech (TTS) State ──────────────────────────────────────────────
  const [ttsText, setTtsText] = useState("");
  const [ttsLang, setTtsLang] = useState<"en" | "te" | "hi">("en");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeech, setActiveSpeech] = useState<SpeechSynthesisUtterance | null>(null);

  // Preset quick phrases for the TTS panel
  const presetPhrases = {
    en: [
      "Hello, how can I help you?",
      "I need a doctor, please.",
      "Could you please show me the way?",
      "Thank you so much.",
    ],
    te: [
      "నమస్కారం, నేను మీకు ఎలా సహాయం చేయగలను?",
      "నాకు డాక్టర్ కావాలి, దయచేసి సహాయం చేయండి.",
      "దయచేసి నాకు దారి చూపిస్తారా?",
      "చాలా ధన్యవాదాలు.",
    ],
    hi: [
      "नमस्ते, मैं आपकी क्या मदद कर सकता हूँ?",
      "मुझे डॉक्टर की जरूरत है, कृपया मदद करें।",
      "कृपया मुझे रास्ता दिखा सकते हैं?",
      "आपका बहुत-धन्यवाद।",
    ],
  };

  // ── Initialize Speech Recognition ──────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSttError("Speech recognition is not supported in this browser. Please try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition() as ISpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
  }, []);

  // Update recognition language configuration when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = sttLang;
    }
  }, [sttLang]);

  // STT Toggle handler
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setSttError(null);

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setSttText("");
        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        recognitionRef.current.onerror = (e) => {
          if (e.error !== "no-speech") {
            setSttError(`Error: ${e.error}`);
          }
          setIsListening(false);
        };
        recognitionRef.current.onresult = (event) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setSttText((finalTranscript || interimTranscript).trim());
        };

        recognitionRef.current.start();
      } catch (err) {
        setSttError("Could not access microphone.");
        setIsListening(false);
      }
    }
  }, [isListening, sttLang]);

  // ── TTS play function ──────────────────────────────────────────────────────
  const speakText = () => {
    if (!ttsText.trim() || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);

    // Set correct language code
    if (ttsLang === "te") {
      utterance.lang = "te-IN";
    } else if (ttsLang === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-US";
    }

    // Assign appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const matchVoice = voices.find((v) => v.lang.startsWith(ttsLang));
    if (matchVoice) {
      utterance.voice = matchVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setActiveSpeech(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveSpeech(null);
  };

  // Helper actions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex min-h-screen bg-beige-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        <motion.main
          id="speech"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 px-6 py-8 sm:px-8 max-w-7xl mx-auto w-full"
        >
          {/* Main header block */}
          <div className="mb-6 flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold text-ink-900 tracking-tight">Audio & Speech Translation</h1>
            <p className="text-sm text-ink-500">Convert voice to text and text to spoken language instantly</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ─── Speech to Text Panel ─── */}
            <Card variant="elevated" className="flex flex-col gap-5 border border-signal-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-400 to-signal-600 text-white shadow-soft">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900">Speech to Text</h2>
                    <p className="text-xs text-ink-500">Speak into microphone to dictate</p>
                  </div>
                </div>

                {/* Language Select Pill */}
                <div className="flex rounded-lg bg-beige-100 p-0.5 border border-ink-900/5">
                  <button
                    onClick={() => setSttLang("en-US")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      sttLang === "en-US" ? "bg-white text-signal-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setSttLang("te-IN")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      sttLang === "te-IN" ? "bg-white text-signal-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    onClick={() => setSttLang("hi-IN")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      sttLang === "hi-IN" ? "bg-white text-signal-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Error notice */}
              {sttError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-coral-50 border border-coral-200/50 p-3 text-xs text-coral-600">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{sttError}</span>
                </div>
              )}

              {/* Transcript Display Box */}
              <div className="relative flex-1 min-h-[220px] rounded-xl2 bg-beige-50 p-5 border border-ink-900/5 flex flex-col justify-between">
                <div className="overflow-y-auto max-h-[250px] scrollbar-thin">
                  {sttText ? (
                    <p className="text-base font-medium text-ink-900 whitespace-pre-wrap leading-relaxed">{sttText}</p>
                  ) : (
                    <p className="text-sm italic text-ink-300">
                      {isListening ? "Listening... Speak clearly into your mic." : "Click the microphone button to start speaking..."}
                    </p>
                  )}
                </div>

                {isListening && (
                  <div className="flex items-center gap-1.5 mt-4 self-start">
                    <span className="h-2 w-2 rounded-full bg-coral-500 animate-ping" />
                    <span className="text-xs text-coral-500 font-bold uppercase tracking-wider">Recording Live</span>
                  </div>
                )}
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between border-t border-ink-900/5 pt-4">
                <Button
                  variant={isListening ? "danger" : "primary"}
                  onClick={toggleListening}
                  className="flex items-center gap-2 rounded-xl"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 animate-pulse" /> Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" /> Start Listening
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(sttText)}
                    disabled={!sttText}
                    className="rounded-xl p-2.5 border border-ink-900/10 hover:bg-beige-100 text-ink-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    title="Copy Transcript"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSttText("")}
                    disabled={!sttText}
                    className="rounded-xl p-2.5 border border-ink-900/10 hover:bg-coral-50/50 text-coral-500 hover:border-coral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    title="Clear text"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Card>

            {/* ─── Text to Speech Panel ─── */}
            <Card variant="elevated" className="flex flex-col gap-5 border border-signal-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-400 to-mint-600 text-white shadow-soft">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-ink-900">Text to Speech</h2>
                    <p className="text-xs text-ink-500">Type phrases to speak out loud</p>
                  </div>
                </div>

                {/* Voice select controls */}
                <div className="flex rounded-lg bg-beige-100 p-0.5 border border-ink-900/5">
                  <button
                    onClick={() => setTtsLang("en")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      ttsLang === "en" ? "bg-white text-signal-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setTtsLang("te")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      ttsLang === "te" ? "bg-white text-signal-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    తెలుగు
                  </button>
                  <button
                    onClick={() => setTtsLang("hi")}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                      ttsLang === "hi" ? "bg-white text-signal-700 shadow-soft" : "text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    हिंदी
                  </button>
                </div>
              </div>

              {/* Text Input Area */}
              <div className="relative flex-1 min-h-[140px]">
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder={
                    ttsLang === "te"
                      ? "ఇక్కడ తెలుగు టెక్స్ట్ టైప్ చేయండి..."
                      : ttsLang === "hi"
                      ? "यहाँ हिंदी टेक्स्ट टाइप करें..."
                      : "Type text here to hear it spoken..."
                  }
                  className="w-full h-full min-h-[140px] rounded-xl2 bg-beige-50 p-4 border border-ink-900/5 focus:outline-none focus:ring-1 focus:ring-signal-500 text-ink-900 placeholder:text-ink-300 font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Preset Phrases */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Quick Phrases</span>
                <div className="flex flex-wrap gap-2">
                  {presetPhrases[ttsLang].map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTtsText(phrase)}
                      className="rounded-lg bg-beige-100 hover:bg-beige-200 px-3 py-1.5 text-xs text-ink-700 font-semibold border border-ink-900/5 transition-all text-left truncate max-w-full"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between border-t border-ink-900/5 pt-4">
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={speakText}
                    disabled={!ttsText.trim()}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Play className="h-4 w-4" /> Speak
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={stopSpeaking}
                    disabled={!isPlaying}
                    className="flex items-center gap-2 rounded-xl"
                  >
                    <Square className="h-4 w-4" /> Stop
                  </Button>
                </div>

                {isPlaying && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <span
                        key={idx}
                        className="w-0.5 bg-mint-500 rounded-full animate-bounce"
                        style={{
                          height: `${Math.random() * 12 + 4}px`,
                          animationDelay: `${idx * 0.1}s`,
                          animationDuration: "0.5s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
