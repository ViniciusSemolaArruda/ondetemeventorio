// app/_layout.tsx
import { Slot, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import SidebarSheet from "@/components/SidebarSheet";
import { I18nProvider } from "@/context/I18nContext";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { MenuProvider, useMenu } from "../context/MenuContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================
   Gate: decide só quando não é /
   e nunca mexe em /SplashScreen
   ========================= */
function Gate() {
  const { user, isHydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated) return;

    // 🚫 Não mexe na raiz "/" — o index.tsx já redireciona para /SplashScreen
    if (pathname === "/") return;

    // 🚫 Nunca redirecione a partir da sua animação
    if (pathname === "/SplashScreen") return;

    // Daqui para baixo são rotas já dentro do app
    if (pathname === "/welcome" && user && user.preferencesSet === true) {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      router.replace("/home");
    }

    // Em outras rotas, não faz nada
  }, [isHydrated, pathname, user?.id, user?.preferencesSet]);

  return <Slot />;
}

/* =======================================
   Overlay + Sidebar centralizados no root
   ======================================= */
function MenuOverlay() {
  const { isOpen, closeMenu } = useMenu();
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <>
      <Pressable style={styles.overlay} onPress={closeMenu} />
      <AnimatedRN.View entering={SlideInRight} exiting={SlideOutRight} style={styles.sidebar}>
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
  return (
    <I18nProvider>
      <AuthProvider>
        <MenuProvider>
          <SafeAreaProvider>
            <SafeAreaView edges={["top"]} style={styles.safeTop} />
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
  safeTop: { backgroundColor: "#fff" },
  safeBottom: { flex: 1, backgroundColor: "#fff" },
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
