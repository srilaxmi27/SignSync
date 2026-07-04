import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContextValue, User } from "@/types";
import { getInitials } from "@/lib/utils";

const STORAGE_KEY = "signsync.auth.user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  const persist = useCallback((nextUser: User | null) => {
    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, _password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const name = email.split("@")[0].replace(/[._]/g, " ");
      const nextUser: User = {
        id: crypto.randomUUID(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatarInitials: getInitials(name || "SignSync User"),
      };
      setUser(nextUser);
      persist(nextUser);
    },
    [persist]
  );

  const register = useCallback(
    async (name: string, email: string, _password: string) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const nextUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        avatarInitials: getInitials(name),
      };
      setUser(nextUser);
      persist(nextUser);
    },
    [persist]
  );

  const logout = useCallback(() => {
    setUser(null);
    persist(null);
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user, login, register, logout]
  );

  if (!isHydrated) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
