//hooks\useGoogleLogin.ts
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { setUserOnAuthContext } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

type Extra = {
  API_BASE_URL?: string;
  GOOGLE_CLIENT_ID?: string;            // Web Client ID
  GOOGLE_ANDROID_CLIENT_ID?: string;    // Android Client ID
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
const API_BASE_URL = extra.API_BASE_URL ?? 'https://ondetemeventorio.vercel.app';
const WEB_CLIENT_ID = extra.GOOGLE_CLIENT_ID!;
const ANDROID_CLIENT_ID = extra.GOOGLE_ANDROID_CLIENT_ID!;

const OWNER = Constants.expoConfig?.owner ?? 'viniciusarruda';
const SLUG = Constants.expoConfig?.slug ?? 'ondetemeventorio';

// Proxy do Expo (para Expo Go)
const EXPO_PROXY_REDIRECT = `https://auth.expo.dev/@${OWNER}/${SLUG}`;
// Scheme (para build nativa)
const NATIVE_REDIRECT = makeRedirectUri({
  native: `com.googleusercontent.apps.${ANDROID_CLIENT_ID.replace('.apps.googleusercontent.com', '')}:/oauthredirect`
});


export function useGoogleAuth() {
  const isExpoGo = Constants.appOwnership === 'expo';
  const redirectUri = isExpoGo ? EXPO_PROXY_REDIRECT : NATIVE_REDIRECT;

  const [isLoading, setIsLoading] = useState(false);

  console.log('🔁 redirectUri em uso:', redirectUri); // ⬅️ Confirma se está usando o proxy
  // Expo Go => Web client; Build nativa => Android client
  const [request, response, promptAsync] = Google.useAuthRequest(
    isExpoGo
      ? {
          clientId: WEB_CLIENT_ID,      // ✅ Web Client ID (Expo Go + proxy)
          redirectUri,
          scopes: ['profile', 'email'],
          responseType: 'id_token',
        // seu backend espera access_token
        }
      : {
          androidClientId: ANDROID_CLIENT_ID, // ✅ Android Client ID (APK/AAB)
          redirectUri,
          scopes: ['profile', 'email'],
         responseType: 'id_token',

        }
  );

  useEffect(() => {
    (async () => {
      if (response?.type !== 'success') return;
      const accessToken = response.authentication?.accessToken;
      if (!accessToken) return;

      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/mobile-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id_token: response.authentication?.idToken })
        });

        if (!res.ok) throw new Error('backend auth failed');
        const user = await res.json();
        setUserOnAuthContext(user);
      } catch (e) {
        console.error('❌ Erro ao autenticar no backend', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [response]);

  const signInWithGoogle = useMemo(
  () => () => {
    if (!request) {
      console.warn('⚠️ Autenticação Google ainda não está pronta.');
      return;
    }
    console.log('🔁 redirectUri em uso:', redirectUri);
    promptAsync(); // ✅ sem useProxy aqui
  },
  [request, redirectUri, promptAsync]
);

  return { signInWithGoogle, isLoading, request };
}

export function logout() {
  setUserOnAuthContext(null);
}
