// app/_layout.tsx
import { Slot, usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import SidebarSheet from "@/components/SidebarSheet";
import { I18nProvider } from "@/context/I18nContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { MenuProvider, useMenu } from "../context/MenuContext";

const ORANGE = "#FF7400";

/** Habilita o renderer mais novo do Google Maps no Android, se existir na versão instalada */
async function enableLatestRendererIfAvailable() {
  try {
    const maps = await import("react-native-maps");
    const fn =
      (maps as any)?.enableLatestRenderer ??
      (maps as any)?.default?.enableLatestRenderer ??
      (maps as any)?.MapView?.enableLatestRenderer;
    if (typeof fn === "function") fn();
  } catch {
    // versão antiga do pacote: ignore
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
    if (pathname === "/" || pathname === "/SplashScreen") return;

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

  useEffect(() => {
    if (isOpen) closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isOpen) return null;

  return (
    <>
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
  useEffect(() => {
    if (Platform.OS === "android") {
      enableLatestRendererIfAvailable();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <MenuProvider>
            {/* Top no mesmo laranja da marca */}
            <SafeAreaView edges={["top"]} style={styles.safeTop} pointerEvents="none" />
            {/* Bottom também laranja, segurando o app */}
            <SafeAreaView edges={["left", "right", "bottom"]} style={styles.safeBottom}>
              <View style={styles.root}>
                <Gate />
                <MenuOverlay />
              </View>
            </SafeAreaView>
            <GlobalToast />
          </MenuProvider>
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeTop: {
    backgroundColor: ORANGE,
  },
  safeBottom: {
    flex: 1,
    backgroundColor: ORANGE,
    overflow: "visible", // não clipe o Callout
  },
  root: {
    flex: 1,
    backgroundColor: ORANGE,
    overflow: "visible",
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
    width: Math.round(
      (global as any)?.window?.innerWidth
        ? (global as any).window.innerWidth * 0.8
        : 320
    ),
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
