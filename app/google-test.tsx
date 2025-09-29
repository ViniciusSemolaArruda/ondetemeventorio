// app/(tests)/google-test.tsx
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as React from "react";
import { Button, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleTest() {
  const isExpoGo = Constants.appOwnership === "expo";

  const extra: any =
    Constants.expoConfig?.extra ??
    (Constants as any).manifest?.extra ??
    {};

  const WEB_CLIENT_ID = extra?.GOOGLE_CLIENT_ID as string;
  const ANDROID_CLIENT_ID = extra?.GOOGLE_ANDROID_CLIENT_ID as string;

  // ✅ Sem useProxy aqui — a função decide o melhor valor (em geral já usa proxy no Expo Go)
  const redirectUri = isExpoGo ? makeRedirectUri() : undefined;

  const config = isExpoGo
    ? {
        clientId: WEB_CLIENT_ID,
        responseType: "id_token" as const,
        scopes: ["openid", "profile", "email"],
        redirectUri, // ok passar no Expo Go
      }
    : {
        androidClientId: ANDROID_CLIENT_ID,
        responseType: "id_token" as const,
        scopes: ["openid", "profile", "email"],
        // no nativo NÃO passe redirectUri
      };

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  React.useEffect(() => {
    if (!response) return;
    console.log("OAuth response:", JSON.stringify(response, null, 2));
  }, [response]);

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Teste Google OAuth</Text>

      <Button
        title="Login com Google"
        disabled={!request}
        onPress={() =>
          // ✅ Proxy só aqui; se seu TS reclamar, use "as any"
          promptAsync(isExpoGo ? ({ useProxy: true } as any) : undefined)
        }
      />
    </View>
  );
}
