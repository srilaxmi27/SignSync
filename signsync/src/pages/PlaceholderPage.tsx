import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BellRing,
  BookOpen,
  CheckCircle2,
  LifeBuoy,
  MessageCircleQuestion,
  MoonStar,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Volume2,
  WandSparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface PageShellProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

function PageShell({ title, description, icon, children }: PageShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-beige-50 px-6 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex w-fit items-center gap-2 rounded-full border border-ink-100 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </button>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal-100 text-signal-700">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
              <p className="text-sm text-ink-500">{description}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", role: "Student / Interpreter", emergencyContact: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("signsync.profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as typeof form;
        setForm(parsed);
      } catch {
        // ignore invalid stored data
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    window.localStorage.setItem("signsync.profile", JSON.stringify(form));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <PageShell
      title="Profile"
      description="Keep your account details and translation identity up to date."
      icon={<UserCircle2 className="h-6 w-6" />}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card variant="elevated" className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-500 to-signal-700 text-lg font-bold text-white">
              {form.name ? form.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() : "SS"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{form.name || user?.name || "Your profile"}</h2>
              <p className="text-sm text-ink-500">{form.role}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-ink-600">
                <span className="font-medium">Display name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2.5 text-ink-900 outline-none ring-0 focus:border-signal-400"
                />
              </label>
              <label className="space-y-2 text-sm text-ink-600">
                <span className="font-medium">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2.5 text-ink-900 outline-none ring-0 focus:border-signal-400"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-ink-600">
              <span className="font-medium">Role / focus</span>
              <input
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2.5 text-ink-900 outline-none ring-0 focus:border-signal-400"
              />
            </label>

            <label className="space-y-2 text-sm text-ink-600">
              <span className="font-medium">Emergency contact</span>
              <input
                type="tel"
                value={form.emergencyContact}
                onChange={(event) => setForm((prev) => ({ ...prev, emergencyContact: event.target.value }))}
                placeholder="+1 234 567 8900"
                className="w-full rounded-xl border border-ink-900/10 bg-beige-50 px-3 py-2.5 text-ink-900 outline-none ring-0 focus:border-signal-400"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary">Save profile</Button>
              {saved && (
                <span className="flex items-center gap-2 text-sm font-medium text-mint-600">
                  <CheckCircle2 className="h-4 w-4" /> Saved locally
                </span>
              )}
            </div>
          </form>
        </Card>

        <Card variant="outlined" className="space-y-4">
          <div className="flex items-center gap-2 text-signal-700">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-ink-900">Quick overview</h2>
          </div>
          <ul className="space-y-3 text-sm text-ink-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
              <span>Update your preferred display identity for future sessions.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
              <span>Keep your role context visible for teachers, interpreters, and clinicians.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
              <span>Profile changes are stored locally in this browser for quick reuse.</span>
            </li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState({
    captions: true,
    tts: true,
    compactMode: false,
    notifications: true,
    highContrast: false,
  });

  useEffect(() => {
    const stored = window.localStorage.getItem("signsync.settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // ignore invalid stored data
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("signsync.settings", JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSettings = () => {
    const defaults = {
      captions: true,
      tts: true,
      compactMode: false,
      notifications: true,
      highContrast: false,
    };
    setSettings(defaults);
    window.localStorage.setItem("signsync.settings", JSON.stringify(defaults));
  };

  return (
    <PageShell
      title="Settings"
      description="Adjust the experience to suit your workflow, accessibility, and device preferences."
      icon={<Settings className="h-6 w-6" />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Preferences</h2>
              <p className="text-sm text-ink-500">Fine-tune how SignSync responds and looks.</p>
            </div>
            <Button variant="secondary" onClick={resetSettings}>Reset</Button>
          </div>

          <div className="space-y-3">
            {[
              { key: "captions", label: "Live captions", description: "Show translated text alongside the live session." },
              { key: "tts", label: "Text-to-speech", description: "Play spoken output for the selected translation." },
              { key: "notifications", label: "Session reminders", description: "Notify you when a session is ready to review." },
              { key: "compactMode", label: "Compact layout", description: "Reduce spacing for smaller screens and dense workflows." },
              { key: "highContrast", label: "High contrast", description: "Increase visual contrast for easier reading." },
            ].map((item) => (
              <label key={item.key} className="flex items-start justify-between gap-4 rounded-2xl border border-ink-900/8 bg-beige-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-ink-800">{item.label}</p>
                  <p className="text-sm text-ink-500">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings]}
                  onChange={() => toggleSetting(item.key as keyof typeof settings)}
                  className="mt-1 h-4 w-4 rounded border-ink-200 text-signal-600"
                />
              </label>
            ))}
          </div>
        </Card>

        <Card variant="outlined" className="space-y-4">
          <div className="flex items-center gap-2 text-signal-700">
            <MoonStar className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-ink-900">Accessibility tips</h2>
          </div>
          <ul className="space-y-3 text-sm text-ink-600">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
              <span>Enable captions when you want the full transcript visible during sessions.</span>
            </li>
            <li className="flex items-start gap-2">
              <Volume2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
              <span>Turn on text-to-speech for hands-free playbacks and classroom use.</span>
            </li>
            <li className="flex items-start gap-2">
              <WandSparkles className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
              <span>Use high contrast mode when you need stronger visual clarity.</span>
            </li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}

export function HelpPage() {
  return (
    <PageShell
      title="Help & Support"
      description="Get fast answers, learning resources, and direct help for the translator experience."
      icon={<LifeBuoy className="h-6 w-6" />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card variant="elevated" className="space-y-4">
          <div className="flex items-center gap-2 text-signal-700">
            <MessageCircleQuestion className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-ink-900">Popular help topics</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { title: "Start a session", body: "Open the dashboard, begin a live session, and view instant translation output." },
              { title: "Use speech tools", body: "Switch to the speech translator page for audio capture and text-to-speech playback." },
              { title: "Review history", body: "Track previous sessions from the sidebar and export transcripts when needed." },
              { title: "Adjust preferences", body: "Use settings to tailor captions, notifications, and accessibility preferences." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-ink-900/8 bg-beige-50 p-4">
                <p className="font-semibold text-ink-800">{item.title}</p>
                <p className="mt-1 text-sm text-ink-500">{item.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="outlined" className="space-y-4">
          <div className="flex items-center gap-2 text-signal-700">
            <BellRing className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-ink-900">Support center</h2>
          </div>
          <div className="space-y-3 text-sm text-ink-600">
            <div className="rounded-2xl border border-ink-900/8 bg-beige-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-ink-800">
                <BookOpen className="h-4 w-4" /> Quick start guide
              </div>
              <p className="mt-2">Use the sidebar to jump between the live dashboard, speech translator, and account tools.</p>
            </div>
            <div className="rounded-2xl border border-ink-900/8 bg-beige-50 p-4">
              <div className="flex items-center gap-2 font-semibold text-ink-800">
                <LifeBuoy className="h-4 w-4" /> Contact support
              </div>
              <p className="mt-2">Need help with audio, account access, or translation quality? Reach us at support@signsync.app.</p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="primary" onClick={() => window.location.href = "mailto:support@signsync.app"}>Email support</Button>
              <Button variant="secondary" onClick={() => window.location.href = "/speech"}>Open translator</Button>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
