import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, onSessionExpired, type User } from "../../lib/api";
import { resetWebRoute } from "../../navigation/location";

interface Session {
  user: User | null; initializing: boolean; notice: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  update: (name: string) => Promise<void>;
  remove: (password: string) => Promise<void>;
}
const Context = createContext<Session | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let mounted = true;
    void api.restore().then((value) => { if (mounted) setUser(value); })
      .catch((error: unknown) => { if (mounted) setNotice(error instanceof Error ? error.message : "No se pudo recuperar la sesión."); })
      .finally(() => { if (mounted) setInitializing(false); });
    const unsubscribe = onSessionExpired(() => { setUser(null); setNotice("Tu sesión venció. Inicia sesión nuevamente."); });
    return () => { mounted = false; unsubscribe(); };
  }, []);
  return <Context.Provider value={{ user, initializing, notice,
    async login(email, password) { const value = await api.login(email, password); setNotice(""); setUser(value); },
    async logout() { await api.logout(); resetWebRoute(); setUser(null); setNotice(""); },
    async update(name) { setUser(await api.updateProfile(name)); },
    async remove(password) { await api.deleteAccount(password); resetWebRoute(); setUser(null); setNotice("Tu cuenta y sus datos asociados fueron eliminados."); },
  }}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error("AuthProvider requerido"); return value; }
