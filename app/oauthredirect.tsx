// app/oauthredirect.tsx
import { useRouter } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useEffect } from "react"
import { ActivityIndicator, Text, View } from "react-native"

WebBrowser.maybeCompleteAuthSession()

export default function OAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para home ou página segura após o login
    router.replace("https://auth.expo.io/@viniciusarruda/ondetemeventorio")
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Finalizando login...</Text>
    </View>
  )
}
