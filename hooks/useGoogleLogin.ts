// hooks/useGoogleLogin.ts
import { adoptApiSessionAndRefreshUser } from "@/context/AuthContext";
import { apiHelpers } from "@/lib/api";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useState } from "react";

type Extra = { GOOGLE_WEB_CLIENT_ID?: string };
const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
const WEB_CLIENT_ID = extra.GOOGLE_WEB_CLIENT_ID ?? "";

// Perfil simplificado para UI
export type GoogleProfile = {
  idToken: string | null;
  serverAuthCode?: string | null;
  email?: string | null;
  name?: string | null;
  photo?: string | null;
};

function extractUser(resp: any) {
  // compatibilidade: algumas versões retornam resp.user, outras resp.data.user
  const data = resp?.data ?? resp;
  const user = data?.user ?? {};
  const serverAuthCode = data?.serverAuthCode ?? null;
  return {
    email: user?.email ?? null,
    name: user?.name ?? null,
    photo: user?.photo ?? null,
    serverAuthCode,
  } as Pick<GoogleProfile, "email" | "name" | "photo" | "serverAuthCode">;
}

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configuração do Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      // offlineAccess: true,
      // forceCodeForRefreshToken: true,
    });
  }, []);

  // Tenta restaurar sessão Google (opcional)
  useEffect(() => {
    (async () => {
      try {
        // 1) Já logado no Google?
        const current = await GoogleSignin.getCurrentUser();
        if (current) {
          const tokens = await GoogleSignin.getTokens();
          const u = extractUser(current);
          setProfile({
            idToken: tokens?.idToken ?? null,
            ...u,
          });
          return;
        }
        // 2) Tenta silencioso
        const resp = await GoogleSignin.signInSilently();
        const tokens = await GoogleSignin.getTokens();
        const u = extractUser(resp);
        setProfile({
          idToken: tokens?.idToken ?? null,
          ...u,
        });
      } catch {
        // Sem sessão Google, segue normal
      }
    })();
  }, []);

  // Login Google → troca por JWT da sua API → aplica no contexto
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const resp = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const u = extractUser(resp);
      const googleData: GoogleProfile = {
        idToken: tokens?.idToken ?? null,
        ...u,
      };
      setProfile(googleData);

      if (!googleData.idToken) {
        throw new Error("Falha ao obter idToken do Google.");
      }

      // Troca idToken do Google por JWT da sua API
      const { user, accessToken } = await apiHelpers.mobileLogin({
        id_token: googleData.idToken,
      });

      // Aplica token da API e atualiza preferências; injeta no AuthContext
      await adoptApiSessionAndRefreshUser({
        user: {
          ...user,
          provider: "google",
          idToken: googleData.idToken, // opcional para debug
          accessToken,                  // JWT da sua API
        },
        accessToken,
      });

      return { user, accessToken };
    } catch (e: any) {
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
        setError("Login cancelado pelo usuário.");
      } else if (e?.code === statusCodes.IN_PROGRESS) {
        setError("Login já em andamento.");
      } else if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Google Play Services indisponível/desatualizado.");
      } else {
        setError("Falha ao entrar com Google.");
      }
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await GoogleSignin.signOut();
      setProfile(null);
      // Para limpar o contexto/app, chame useAuth().signOut() na UI
    } catch {
      setError("Falha ao sair da conta Google.");
    } finally {
      setLoading(false);
    }
  }, []);

  const isSignedIn = useMemo(() => !!profile?.idToken, [profile]);

  return { loading, error, profile, isSignedIn, signInWithGoogle, signOut };
}
