// context/AuthContext.tsx
import { apiHelpers, setAuthToken } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useMemo, useState } from "react";

/* ======================= Tipos ======================= */

export type User = {
  id?: string;                    // opcional p/ manter compat
  name: string;
  email: string;
  image?: string | null;
  idToken?: string | null;        // id_token do Google (opcional, se ainda usar)
  provider?: "google" | "manual";
  accessToken?: string | null;    // JWT da SUA API (Bearer)

  // Preferências
  preferencesSet?: boolean;
  preferences?: string[];
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isHydrated: boolean;
  signOut: () => Promise<void>;
};

/* ======================= Contexto ======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chaves de armazenamento
const LEGACY_USER_KEY = "@auth:user";
const AUTH_KEY = "@auth"; // guarda { user, accessToken }

// setter externo para uso fora de componentes
let externalSetUser: ((user: User | null) => void) | null = null;

/* ======================= Utils de Storage ======================= */

async function loadFromStorage(): Promise<{ user: User | null; accessToken: string | null }> {
  // Tenta novo formato
  const rawAuth = await AsyncStorage.getItem(AUTH_KEY);
  if (rawAuth) {
    try {
      const parsed = JSON.parse(rawAuth) as { user?: User | null; accessToken?: string | null };
      return { user: parsed.user ?? null, accessToken: parsed.accessToken ?? null };
    } catch {
      // cai para o legado
    }
  }

  // Compat: formato antigo
  const rawLegacy = await AsyncStorage.getItem(LEGACY_USER_KEY);
  if (rawLegacy) {
    try {
      const parsed: User = JSON.parse(rawLegacy);
      return { user: parsed ?? null, accessToken: parsed?.accessToken ?? null };
    } catch {
      // sem storage válido
    }
  }

  return { user: null, accessToken: null };
}

async function saveToStorage(user: User | null) {
  if (user) {
    const payload = {
      user,
      accessToken: user.accessToken ?? null,
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    await AsyncStorage.removeItem(LEGACY_USER_KEY);
  } else {
    await AsyncStorage.removeItem(AUTH_KEY);
    await AsyncStorage.removeItem(LEGACY_USER_KEY);
  }
}

/* ======================= Provider ======================= */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, _setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hidratação inicial: restaura user + accessToken e aplica Bearer
  React.useEffect(() => {
    (async () => {
      try {
        const { user: storedUser, accessToken } = await loadFromStorage();

        // Aplica Bearer no Axios
        if (accessToken) setAuthToken(accessToken);

        // Tenta atualizar preferências/infos do perfil com endpoint protegido
        if (storedUser?.id && accessToken) {
          try {
            const me = await apiHelpers.getUserPreferences(); // exige Bearer
            storedUser.preferencesSet = me?.preferencesSet ?? storedUser.preferencesSet;
            storedUser.preferences = me?.preferences ?? storedUser.preferences;

            // Garante id/nome/email se backend devolver:
            storedUser.id = storedUser.id ?? (me as unknown as { id?: string })?.id;
            storedUser.name = storedUser.name ?? (me as unknown as { name?: string })?.name ?? storedUser.name;
            storedUser.email = storedUser.email ?? (me as unknown as { email?: string })?.email ?? storedUser.email;
            storedUser.image = storedUser.image ?? (me as unknown as { image?: string | null })?.image ?? null;
          } catch {
            // silencioso (offline/rede)
          }
        }

        _setUser(storedUser ?? null);
      } catch (error) {
        console.error("Erro na hidratação do usuário:", error);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  // Define usuário e persiste; também ajusta Bearer
  const setUser = React.useCallback(async (u: User | null) => {
    _setUser(u);
    if (u?.accessToken) setAuthToken(u.accessToken);
    else setAuthToken(null);
    await saveToStorage(u);
  }, []);

  // Expor setter global
  React.useEffect(() => {
    externalSetUser = setUser;
    return () => {
      externalSetUser = null;
    };
  }, [setUser]);

  // Logout geral
  const signOut = React.useCallback(async () => {
    try {
      await saveToStorage(null);
      setAuthToken(null);
      _setUser(null);
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, isHydrated, signOut }),
    [user, setUser, isHydrated, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ======================= Hooks/Helpers ======================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

// Setter externo (ex.: em hooks de login)
export function setUserOnAuthContext(u: User | null) {
  if (!externalSetUser) {
    console.warn("AuthProvider ainda não montou; setUserOnAuthContext foi ignorado.");
    return;
  }
  externalSetUser(u);
}

/**
 * Adota a sessão (accessToken) da sua API e tenta atualizar o usuário local
 * com os dados protegidos do backend (preferências, etc).
 */
export async function adoptApiSessionAndRefreshUser(partial: {
  user?: User | null;
  accessToken?: string | null;
}) {
  // 1) Aplica/limpa Bearer global
  if (partial.accessToken) setAuthToken(partial.accessToken);
  else setAuthToken(null);

  // 2) Busca preferências/infos do perfil no backend (se autenticado)
  let finalUser: User | null = partial.user ?? null;
  try {
    if (partial.accessToken) {
      const me = await apiHelpers.getUserPreferences(); // GET /api/users/preferences (protegido)
      finalUser = {
        ...(finalUser ?? ({} as User)),
        id: finalUser?.id ?? (me as unknown as { id?: string })?.id,
        name: finalUser?.name ?? (me as unknown as { name?: string })?.name ?? finalUser?.name ?? "",
        email: finalUser?.email ?? (me as unknown as { email?: string })?.email ?? finalUser?.email ?? "",
        image: finalUser?.image ?? (me as unknown as { image?: string | null })?.image ?? null,
        preferencesSet: me?.preferencesSet ?? finalUser?.preferencesSet,
        preferences: me?.preferences ?? finalUser?.preferences,
        accessToken: partial.accessToken ?? finalUser?.accessToken ?? null,
        provider: finalUser?.provider ?? "google",
      };
    }
  } catch {
    // se falhar a busca, mantém o que já temos e garante o token
    finalUser = finalUser
      ? { ...finalUser, accessToken: partial.accessToken ?? finalUser.accessToken ?? null }
      : finalUser;
  }

  // 3) Injeta no contexto (também persiste)
  setUserOnAuthContext(finalUser ?? null);
}
