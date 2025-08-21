// app/_layout.tsx
import { Slot } from "expo-router"
import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AuthProvider } from "../context/AuthContext"
import { MenuProvider } from "../context/MenuContext"

export default function RootLayout() {
  return (
    <AuthProvider>
      <MenuProvider>
        {/* Área superior (status bar) com fundo laranja */}
        <SafeAreaView edges={["top"]} style={styles.safeTop} />

        {/* Área inferior (conteúdo) com fundo preto */}
        <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeBottom}>
          <Slot />
        </SafeAreaView>
      </MenuProvider>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  safeTop: {
    backgroundColor: "#000", // topo laranja
  },
  safeBottom: {
    flex: 1,
    backgroundColor: "#000", // fundo preto
  },
})
