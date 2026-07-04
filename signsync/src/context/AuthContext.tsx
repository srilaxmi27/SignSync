import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContextValue, User } from "@/types";
import { getInitials } from "@/lib/utils";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function supabaseUserToAppUser(session: Session): User {
  const meta = session.user.user_metadata as Record<string, string> | undefined;
  const name = meta?.name ?? session.user.email?.split("@")[0] ?? "User";
  return {
    id:               session.user.id,
    name,
    email:            session.user.email ?? "",
    avatarInitials:   getInitials(name),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<User | null>(null);
  const [isHydrated,  setIsHydrated]  = useState(false);

  // ── Hydrate from existing Supabase session on mount ──────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(supabaseUserToAppUser(data.session));
      setIsHydrated(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? supabaseUserToAppUser(session) : null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.session) setUser(supabaseUserToAppUser(data.session));
  }, []);

  // ── register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    if (data.session) {
      // Auto-confirmed — user is immediately logged in
      setUser(supabaseUserToAppUser(data.session));
      return false; // no confirmation needed
    }
    // Email confirmation required — session is null
    return true;
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), login, register, logout }),
    [user, login, register, logout]
  );

  if (!isHydrated) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
