// app/_layout.tsx
import { Href, Slot, usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import SidebarSheet from "@/components/SidebarSheet";
import { I18nProvider } from "@/context/I18nContext";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { MenuProvider, useMenu } from "../context/MenuContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- Gate mantém sua lógica de redirecionamento ---
function Gate() {
  const { user, isHydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) return;
    if (pathname === "/welcome") return;

    if (user.preferencesSet === false) {
      router.replace("/welcome" as Href);
    }
  }, [isHydrated, user?.id, user?.preferencesSet, pathname]);

  return <Slot />;
}

// --- Overlay + Sidebar centralizados no layout raiz ---
function MenuOverlay() {
  const { isOpen, closeMenu } = useMenu();
  const pathname = usePathname();

  // fecha o menu sempre que a rota mudar (garante que não “viaje” pra próxima tela)
  useEffect(() => {
    if (isOpen) closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop que fecha o menu ao tocar fora */}
      <Pressable style={styles.overlay} onPress={closeMenu} />

      {/* Painel lateral, acima do overlay e interativo */}
      <AnimatedRN.View
        entering={SlideInRight}
        exiting={SlideOutRight}
        style={styles.sidebar}
      >
        <SidebarSheet />
      </AnimatedRN.View>
    </>
  );
}

// --- Toast com insets.bottom (evita sobrepor a barra/gestos) ---
function GlobalToast() {
  const insets = useSafeAreaInsets();
  return (
    <Toast
      position="bottom"
      bottomOffset={Math.max(insets.bottom, 16)}
      visibilityTime={3000}
      swipeable
    />
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <MenuProvider>
          <SafeAreaProvider>
            {/* SafeArea para o topo */}
            <SafeAreaView edges={["top"]} style={styles.safeTop} />

            {/* Conteúdo + overlay do menu */}
            <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeBottom}>
              <View style={{ flex: 1 }}>
                <Gate />
                <MenuOverlay />
              </View>
            </SafeAreaView>

            <GlobalToast />
          </SafeAreaProvider>
        </MenuProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  safeTop: { backgroundColor: "#000" },
  safeBottom: { flex: 1, backgroundColor: "#000" },

  // Backdrop do menu lateral (cinza)
  overlay: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
  },

  // Painel do menu lateral
  sidebar: {
    position: "absolute",
    top: 0, bottom: 0, right: 0,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1001,
  },
});
