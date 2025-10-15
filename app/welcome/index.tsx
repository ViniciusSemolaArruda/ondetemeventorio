// app/welcome/index.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import SidebarSheet from "@/components/SidebarSheet";
import { quickSearchOptions } from "@/constants/search2";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useMenu } from "@/context/MenuContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Layout
const H_PADDING = 16;
const GAP = 12;
const CARD_HEIGHT = 128;

/** ===========================
 *  IMAGENS (mapa robusto)
 * =========================== */
const imageMap: Record<string, ImageSourcePropType> = {
  "sapucai1.png": require("../../assets/icons/SAPUCAI1.png"),
  "roda-gpt.png": require("../../assets/icons/roda-gpt.png"),
  "bossa-gpt.png": require("../../assets/icons/bossa-gpt.png"),
  "passinho-gpt.png": require("../../assets/icons/passinho-gpt.png"),
  "funk-gpt.png": require("../../assets/icons/funk-gpt.png"),
  "eletronica-gpt.png": require("../../assets/icons/eletronica-gpt.png"),
  "forro-gpt.png": require("../../assets/icons/forro-gpt.png"),
  "mpb-gpt.png": require("../../assets/icons/mpb-gpt.png"),
  "rock-gpt.png": require("../../assets/icons/rock-gpt.png"),
  "blues-gpt.png": require("../../assets/icons/blues-gpt.png"),
  "jazz-gpt.png": require("../../assets/icons/jazz-gpt.png"),
  "chorinho-gpt.png": require("../../assets/icons/chorinho-gpt.png"),
  "festivais-gpt.png": require("../../assets/icons/festivais-gpt.png"),
  "festas-gpt.png": require("../../assets/icons/festas-gpt.png"),
  "boate-gpt.png": require("../../assets/icons/boate-gpt.png"),
  "parques-gpt.png": require("../../assets/icons/parques-gpt.png"),
  "bar-gpt.png": require("../../assets/icons/bar-gpt.png"),
  "restaurantes-gpt.png": require("../../assets/icons/restaurantes-gpt.png"),
  "cristo_redentor_card_size.png": require("../../assets/icons/cristo_redentor_card_size.png"),
  "cinema-gpt.png": require("../../assets/icons/cinema-gpt.png"),
  "teatro-gpt.png": require("../../assets/icons/teatro-gpt.png"),
  "standup-gpt.png": require("../../assets/icons/standup-gpt.png"),
  "familia-gpt.png": require("../../assets/icons/familia-gpt.png"),
  "esporte3-gpt.png": require("../../assets/icons/esporte3-gpt.png"),
  "gastronomia-gpt.png": require("../../assets/icons/gastronomia-gpt.png"),
  "feiras-gpt.png": require("../../assets/icons/feiras-gpt.png"),
  "seminario-gpt.png": require("../../assets/icons/seminario-gpt.png"),
  "simposio-gpt.png": require("../../assets/icons/simposio-gpt.png"),
  "ambiente-gpt.png": require("../../assets/icons/ambiente-gpt.png"),
  "agro-gpt.png": require("../../assets/icons/agro-gpt.png"),
};

const fallbackImg = require("../../assets/icons/simposio-gpt.png");

const normalizeKey = (s?: string) => (s || "").replace(/^\/+/, "").toLowerCase();
export const getImageSource = (name: string): ImageSourcePropType => {
  const key = normalizeKey(name);
  const src = imageMap[key];
  if (!src) {
    console.warn(`[Welcome] image not found for "${key}". Using fallback.`);
    return fallbackImg;
  }
  return src;
};

// API base
const API_BASE = "https://ondetemeventorio.vercel.app";

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshUser } = useAuth() as any;
  const { isOpen, closeMenu } = useMenu();
  const { t } = useI18n();

  const firstName = useMemo(
    () => (user?.name || "").trim().split(" ")[0],
    [user?.name],
  );

  const numColumns = useMemo(() => {
    const { width } = Dimensions.get("window");
    if (width >= 900) return 4;
    if (width >= 680) return 3;
    return 2;
  }, []);

  const ITEM_WIDTH = useMemo(() => {
    const { width } = Dimensions.get("window");
    const available = width - H_PADDING * 2 - GAP * (numColumns - 1);
    return Math.round(available / numColumns);
  }, [numColumns]);

  const toggleSelect = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  /** Continuar → salva preferências (primeira vez) e só então vai para HOME */
  const handleContinue = async () => {
    const token = user?.accessToken;
    const isFirstTime = !user?.preferencesSet; // sem preferências no backend ainda?

    // Se não tem token ou nada selecionado, só navega
    if (!token || selected.length === 0) {
      router.replace("/home");
      return;
    }

    try {
      setLoading(true);

      const saveReq = fetch(`${API_BASE}/api/users/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferences: selected }),
      });

      if (isFirstTime) {
        // PRIMEIRA VEZ: garante salvar + atualizar usuário antes de ir pra Home
        const res = await saveReq;
        if (!res.ok) {
          const text = await res.text();
          console.warn(`Failed to save preferences (${res.status}). ${text}`);
        } else {
          await refreshUser?.();
        }
        router.replace("/home");
      } else {
        // Próximas vezes: navega já e salva em background
        router.replace("/home");
        saveReq
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text();
              console.warn(`Failed to save preferences (${res.status}). ${text}`);
            } else {
              await refreshUser?.();
            }
          })
          .catch((e) => console.warn("Save preferences error:", e?.message || e));
      }
    } catch (e: any) {
      console.warn("Unexpected error on save:", e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: (typeof quickSearchOptions)[number] }) => {
    const isSelected = selected.includes(item.title);
    return (
      <Pressable
        onPress={() => toggleSelect(item.title)}
        style={[
          styles.card,
          { width: ITEM_WIDTH, height: CARD_HEIGHT },
          isSelected && styles.cardSelected,
        ]}
      >
        <Image source={getImageSource(item.imageUrl)} style={styles.cardImage} />
        <View style={styles.overlayDark} />
        {isSelected && <View style={styles.overlaySelected} />}
        <View style={styles.centered}>
          <Text style={styles.cardText}>{item.title}</Text>
        </View>
      </Pressable>
    );
  };

  const greeting = user
    ? (t("greeting_named") || "Olá, {name}!").replace("{name}", firstName || "Usuário")
    : t("greeting_guest") || "Olá, bem-vindo!";

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.padding}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>
            {t("welcome_sub") ||
              "Para melhorar sua experiência, selecione os estilos de eventos que você mais gosta:"}
          </Text>

          <FlatList
            contentContainerStyle={[
              styles.grid,
              { paddingBottom: Math.max(insets.bottom, 8) },
            ]}
            data={quickSearchOptions}
            key={numColumns}
            numColumns={numColumns}
            keyExtractor={(o) => o.title}
            renderItem={renderItem}
            columnWrapperStyle={
              numColumns > 1
                ? { columnGap: GAP, justifyContent: "space-between" }
                : undefined
            }
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <SafeAreaView edges={["bottom"]} style={{ paddingTop: 8, paddingBottom: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleContinue}
                  disabled={loading}
                  style={[styles.button, loading && { opacity: 0.7 }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{t("continue_btn") || "Continuar"}</Text>
                  )}
                </TouchableOpacity>
              </SafeAreaView>
            }
          />
        </View>
      </View>

      {/* Sidebar */}
      {isOpen && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <AnimatedRN.View entering={SlideInRight} exiting={SlideOutRight} style={styles.sidebar}>
            <SidebarSheet />
          </AnimatedRN.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  padding: { padding: 16 },

  greeting: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 4, color: "#333" },

  grid: { paddingVertical: 16, rowGap: GAP },

  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "rgba(34,197,94,0.8)",
  },
  cardImage: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlayDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  overlaySelected: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34,197,94,0.22)",
  },
  centered: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  button: {
    marginTop: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // Sidebar overlay
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
    elevation: 5,
  },
});
