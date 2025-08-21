// app/(tests)/google-test.tsx  (ou no seu hook)
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { Button, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleTest() {
  const isExpoGo = Constants.appOwnership === "expo";

  // Expo Go usa proxy; nativo NÃO passa redirectUri
  const proxyRedirect = makeRedirectUri({ useProxy: true } as any);

  const WEB_CLIENT_ID = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID!;
  const ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID!;

  const [request, response, promptAsync] = Google.useAuthRequest(
    isExpoGo
      ? {
          clientId: WEB_CLIENT_ID,            // Web client
          redirectUri: proxyRedirect,         // proxy no Go
          responseType: "id_token",
          scopes: ["openid", "profile", "email"],
        }
      : {
          androidClientId: ANDROID_CLIENT_ID, // Android client
          // 👇 sem redirectUri no nativo! a lib define o padrão correto
          responseType: "id_token",
          scopes: ["openid", "profile", "email"],
        }
  );

  useEffect(() => {
    console.log("appOwnership:", Constants.appOwnership); // 'expo' ou 'guest'
    if (isExpoGo) console.log("redirectUri (proxy):", proxyRedirect);
    console.log("clientId usado:", isExpoGo ? WEB_CLIENT_ID : ANDROID_CLIENT_ID);
  }, [request]);

  useEffect(() => {
    if (!response) return;
    console.log("OAuth response:", JSON.stringify(response, null, 2));
  }, [response]);

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Teste Google OAuth</Text>
      <Button title="Login com Google" disabled={!request} onPress={() => promptAsync()} />
    </View>
  );
}
