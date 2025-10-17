// app/_layout.tsx
import { Slot, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import SidebarSheet from "@/components/SidebarSheet";
import { I18nProvider } from "@/context/I18nContext";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { MenuProvider, useMenu } from "../context/MenuContext";

// ✅ importa normalmente o MapView (sem named import do enableLatestRenderer)
import MapView from "react-native-maps";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/** Habilita o renderer mais novo do Google Maps no Android, com fallback entre versões */
function enableLatestRendererIfAvailable() {
  try {
    // 1) tenta pegar pelo require (caso exista como export nomeado)
    const maps = require("react-native-maps");
    const fn =
      maps?.enableLatestRenderer ??
      maps?.default?.enableLatestRenderer ??     // algumas builds expõem no default
      (MapView as any)?.enableLatestRenderer;    // outras no próprio MapView

    if (typeof fn === "function") fn();
  } catch {
    // se não existir na sua versão, apenas ignore
  }
}

/* =========================
   Gate: não interfere na splash/root
   ========================= */
function Gate() {
  const { user, isHydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (pathname === "/") return;             // root
    if (pathname === "/SplashScreen") return; // splash

    if (pathname === "/welcome" && user && user.preferencesSet === true) {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.replace("/home");
    }
  }, [isHydrated, pathname, user?.id, user?.preferencesSet, router]);

  return <Slot />;
}

/* =======================================
   Overlay + Sidebar montam só quando aberto
   ======================================= */
function MenuOverlay() {
  const { isOpen, closeMenu } = useMenu();
  const pathname = usePathname();

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    if (isOpen) closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <>
      {/* overlay só existe quando o menu está aberto */}
      <Pressable
        style={styles.overlay}
        onPress={closeMenu}
        pointerEvents="auto"
        accessibilityLabel="Fechar menu lateral"
        accessibilityRole="button"
      />
      <AnimatedRN.View
        entering={SlideInRight}
        exiting={SlideOutRight}
        style={styles.sidebar}
        pointerEvents="box-none"
      >
        <SidebarSheet />
      </AnimatedRN.View>
    </>
  );
}

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
  // ⚙️ Habilita o renderer novo do Google Maps no Android (evita bugs do Callout)
  useEffect(() => {
    if (Platform.OS === "android") {
      enableLatestRendererIfAvailable();
    }
  }, []);

  return (
    <I18nProvider>
      <AuthProvider>
        <MenuProvider>
          <SafeAreaProvider>
            {/* Top não precisa receber toques */}
            <SafeAreaView edges={["top"]} style={styles.safeTop} pointerEvents="none" />
            {/* Bottom segura o app; sem overflow pra não clipear Callout do mapa */}
            <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeBottom}>
              <View style={styles.root}>
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
  safeTop: { backgroundColor: "#fff" },
  safeBottom: {
    flex: 1,
    backgroundColor: "#fff",
    overflow: "visible", // 👈 não clipe o Callout
  },
  root: {
    flex: 1,
    overflow: "visible", // 👈 idem
  },
  overlay: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
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
