// context/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useMemo, useState } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isHydrated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// armazena a função setUser após o Provider montar
let externalSetUser: ((user: User | null) => void) | null = null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, _setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // hidratação opcional (comentado se não quiser persistir)
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('@auth:user');
        if (raw) _setUser(JSON.parse(raw));
      } catch {}
      setIsHydrated(true);
    })();
  }, []);

  const setUser = React.useCallback(async (u: User | null) => {
    _setUser(u);
    try {
      if (u) await AsyncStorage.setItem('@auth:user', JSON.stringify(u));
      else await AsyncStorage.removeItem('@auth:user');
    } catch {}
  }, []);

  // expõe setUser externamente após montar
  React.useEffect(() => {
    externalSetUser = setUser;
    return () => { externalSetUser = null; };
  }, [setUser]);

  const value = useMemo(() => ({ user, setUser, isHydrated }), [user, setUser, isHydrated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}

// ✅ usado fora de componentes (ex.: em utils/auth.ts)
export function setUserOnAuthContext(u: User | null) {
  if (!externalSetUser) {
    console.warn('AuthProvider ainda não montou; setUserOnAuthContext foi ignorado.');
    return;
  }
  externalSetUser(u);
}

export function clearUserOnAuthContext() {
  setUserOnAuthContext(null);
}
