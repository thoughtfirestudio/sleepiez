import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../api";
import { Events } from "./useTracking";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ ok: boolean; message: string }>;
  verify: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const u = await api.get<User>("/api/auth/me");
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (email: string) => {
    const result = await api.post<{ ok: boolean; message: string; debug_code?: string }>("/api/auth/login", { email });
    if (result.debug_code) {
      console.log(`[auth] Debug code for ${email}: ${result.debug_code}`);
    }
    return result;
  }, []);

  const verify = useCallback(async (email: string, code: string) => {
    try {
      const result = await api.post<{ ok: boolean; user: User }>("/api/auth/verify", { email, code });
      setUser(result.user);
      Events.login();
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Best-effort
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, verify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
