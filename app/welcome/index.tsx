// app/welcome/index.tsx
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { quickSearchOptions2 } from "@/constants/search2";
import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  "chorinhi-gpt.png": require("../../assets/icons/chorinhi-gpt.png"),
  "festivais-gpt.png": require("../../assets/icons/festivais-gpt.png"),
  "festas-gpt.png": require("../../assets/icons/festas-gpt.png"),
  "bar-gpt.png": require("../../assets/icons/bar-gpt.png"),
  "restaurantes-gpt.png": require("../../assets/icons/restaurantes-gpt.png"),
  "cristo_redentor_card_size.png": require("../../assets/icons/cristo_redentor_card_size.png"),
  "cultural-png.png": require("../../assets/icons/cultural-png.png"),
  "esporte3-gpt.png": require("../../assets/icons/esporte3-gpt.png"),
  "gastronomia-gpt.png": require("../../assets/icons/gastronomia-gpt.png"),
  "feiras-gpt.png": require("../../assets/icons/feiras-gpt.png"),
  "seminario-gpt.png": require("../../assets/icons/seminario-gpt.png"),
  "simposio-gpt.png": require("../../assets/icons/simposio-gpt.png"),
};

const fallbackImg = require("../../assets/icons/simposio-gpt.png");

const normalizeKey = (s?: string) => (s || "").replace(/^\/+/, "").toLowerCase();

export const getImageSource = (name: string): ImageSourcePropType => {
  const key = normalizeKey(name);
  const src = imageMap[key];
  if (!src) {
    console.warn(`[Welcome] Imagem não encontrada para "${key}". Usando fallback.`);
    return fallbackImg;
  }
  return src;
};

// API base
const API_BASE = "https://ondetemeventorio.vercel.app";

// Layout
const H_PADDING = 16; // usado só no container de texto
const GAP = 12;
const CARD_HEIGHT = 128;

export default function WelcomeScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshUser } = useAuth() as any;
  const { isOpen, closeMenu } = useMenu();

  const firstName = useMemo(
    () => (user?.name || "").trim().split(" ")[0],
    [user?.name]
  );

  const numColumns = useMemo(() => {
    const { width } = Dimensions.get("window");
    if (width >= 900) return 4;
    if (width >= 680) return 3;
    return 2;
  }, []);

  // largura fixa por item (evita “vazar” na direita)
  const ITEM_WIDTH = useMemo(() => {
    const { width } = Dimensions.get("window");
    const available = width - H_PADDING * 2 - GAP * (numColumns - 1);
    return Math.round(available / numColumns);
  }, [numColumns]);

  const toggleSelect = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

const handleContinue = async () => {
  // precisa ter pelo menos 1 preferência
  if (selected.length === 0) {
    Alert.alert("Atenção", "Selecione pelo menos um estilo de evento.");
    return;
  }

  const token = user?.accessToken;
  if (!token) {
    Alert.alert("Sessão expirada", "Faça login novamente para salvar suas preferências.");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(`${API_BASE}/api/users/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences: selected }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao salvar preferências (${res.status}). ${text}`);
    }

    await refreshUser?.();
    router.replace("/home" as any); // ✅ vai para /home
  } catch (e: any) {
    console.error(e);
    Alert.alert("Erro", e?.message ?? "Não foi possível salvar as preferências.");
  } finally {
    setLoading(false);
  }
};


  const renderItem = ({ item }: { item: (typeof quickSearchOptions2)[number] }) => {
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

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.padding}>
          <Text style={styles.greeting}>
            {user ? `Olá, ${firstName || "Usuário"}!` : "Olá, bem-vindo!"}
          </Text>
          <Text style={styles.subtitle}>
            Para melhorar sua experiência, selecione os estilos de eventos que você mais gosta:
          </Text>

          <FlatList
            contentContainerStyle={[
              styles.grid,
              {
                // respiro leve: o footer SafeAreaView cuida do bottom real
                paddingBottom: Math.max(insets.bottom, 8),
              },
            ]}
            data={quickSearchOptions2}
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
              // 🔒 garante que o botão nunca encoste no home indicator
              <SafeAreaView edges={["bottom"]} style={{ paddingTop: 8, paddingBottom: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleContinue}
                  disabled={loading || selected.length === 0}
                  style={[
                    styles.button,
                    (loading || selected.length === 0) && { opacity: 0.7 },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Continuar</Text>
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
          <AnimatedRN.View
            entering={SlideInRight}
            exiting={SlideOutRight}
            style={styles.sidebar}
          >
            <SidebarSheet />
          </AnimatedRN.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  padding: { padding: 16 }, // H_PADDING aplicado só aqui

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
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

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
