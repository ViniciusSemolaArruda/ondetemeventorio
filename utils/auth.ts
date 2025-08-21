// utils/auth.ts
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { setUserOnAuthContext } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

type Extra = {
  API_BASE_URL?: string;
  GOOGLE_CLIENT_ID?: string;          // Web client
  GOOGLE_ANDROID_CLIENT_ID?: string;  // Android client
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
const API_BASE_URL = extra.API_BASE_URL ?? 'https://ondetemeventorio.vercel.app';
const WEB_CLIENT_ID = extra.GOOGLE_CLIENT_ID!;
const ANDROID_CLIENT_ID = extra.GOOGLE_ANDROID_CLIENT_ID!;

export function useGoogleAuth() {
  const isExpoGo = Constants.appOwnership === 'expo'; // 'expo' = Expo Go ; 'guest' = dev build
  const [isLoading, setIsLoading] = useState(false);

  // Expo Go usa proxy; Nativo (dev build) NÃO passa redirectUri.
  const proxyRedirect = makeRedirectUri({ useProxy: true } as any);

  const [request, response, promptAsync] = Google.useAuthRequest(
    isExpoGo
      ? {
          clientId: WEB_CLIENT_ID,                 // Web client
          redirectUri: proxyRedirect,              // proxy no Expo Go
          scopes: ['openid', 'profile', 'email'],
          responseType: 'id_token',
        }
      : {
          androidClientId: ANDROID_CLIENT_ID,      // Android client
          // ⚠️ sem redirectUri no nativo
          scopes: ['openid', 'profile', 'email'],
          responseType: 'id_token',
        }
  );

  // Logs de diagnóstico
  useEffect(() => {
    console.log('appOwnership:', Constants.appOwnership); // 'expo' ou 'guest'
    if (isExpoGo) console.log('redirectUri (proxy):', proxyRedirect);
    console.log('clientId usado:', isExpoGo ? WEB_CLIENT_ID : ANDROID_CLIENT_ID);
    if (request) console.log('auth URL:', (request as any).url);
  }, [request]);

  // Trata o retorno do Google
  useEffect(() => {
    (async () => {
      if (response?.type !== 'success') return;
      const idToken = response.authentication?.idToken;
      if (!idToken) return;

      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/mobile-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: idToken }),
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
      promptAsync();
    },
    [request, promptAsync]
  );

  return { signInWithGoogle, isLoading, request };
}
