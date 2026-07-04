export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void | Promise<void>;
}

export type SessionStatus = "idle" | "listening" | "translating";

export interface StatusMetric {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: "activity" | "clock" | "target" | "zap";
  trend?: string;
  trendDirection?: "up" | "down";
}

export interface RecognizedGesture {
  id: string;
  word: string;
  confidence: number;
  timestamp: string;
}

export interface ActivityEntry {
  id: string;
  title: string;
  detail: string;
  duration: string;
  timestamp: string;
  accuracy: number;
  type: "conversation" | "practice" | "translation";
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: "camera" | "brain" | "waveform" | "shield" | "globe" | "users";
}

export interface StepItem {
  id: string;
  order: number;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}
