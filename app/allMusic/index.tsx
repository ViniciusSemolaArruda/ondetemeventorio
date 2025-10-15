// app/allMusic/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import BarbershopGrid, { Barbershop as GridItem } from "@/components/BarbershopGrid";
import Footer from "@/components/footer";
import Header2 from "@/components/Header2";
import SidebarSheet from "@/components/SidebarSheet";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useMenu } from "@/context/MenuContext";
import { ApiEvent, apiHelpers } from "@/lib/api";
import { mapCityToRegion } from "@/lib/rjRegions";

const SCREEN = Dimensions.get("window");
const STORAGE_KEY_REGION = "@ote:selectedRegion";

// mesmas categorias musicais do web
const MUSIC_CATEGORIES = [
  "Carnaval",
  "Rodas de Samba",
  "Bossa Nova",
  "Passinho",
  "Funk",
  "Eletrônica",
  "Forró",
  "MPB",
  "Rock",
  "Blues",
  "Jazz",
  "Chorinho",
] as const;
const MUSIC_SET = new Set<string>(MUSIC_CATEGORIES as readonly string[]);

const toDate = (v: string | Date | null | undefined) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(+d) ? null : d;
};

export default function AllMusicScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOpen, closeMenu } = useMenu();
const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GridItem[]>([]);
  const [region, setRegion] = useState<string>("");

  const isLoggedIn = !!user?.accessToken;

  // região: ?region tem prioridade; senão AsyncStorage
  const { region: regionFromParams } = useLocalSearchParams<{ region?: string }>();
  useEffect(() => {
    (async () => {
      const urlRegion = (regionFromParams ?? "").toString().trim();
      if (urlRegion) {
        setRegion(urlRegion);
        try { await AsyncStorage.setItem(STORAGE_KEY_REGION, urlRegion); } catch {}
        return;
      }
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_REGION);
        if (typeof saved === "string") setRegion(saved);
      } catch {}
    })();
  }, [regionFromParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 1) busca todos
      const data: ApiEvent[] = await apiHelpers.events();

      // 2) ❌ descarta sem startDate (ou data inválida)
      const onlyDated = data.filter((e) => !!e.startDate && toDate(e.startDate));

      // 3) aprovados + ao menos 1 categoria musical
      const musicaisApproved = onlyDated.filter(
        (e) => e.aprovado === true && (Array.isArray(e.categories) ? e.categories : []).some((c) => MUSIC_SET.has(c))
      );

      // 4) filtro por região (se houver)
      const regionTrim = (region || "").trim();
      const byRegion = regionTrim
        ? musicaisApproved.filter((e) => mapCityToRegion(e.address ?? "") === regionTrim)
        : musicaisApproved;

      // 5) normaliza para o Grid
      const mapped: GridItem[] = byRegion
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        .map((e) => ({
          id: String(e.id),
          name: e.name,
          address: e.address ?? "",
          imageUrl: e.imageUrl ?? null,
          likedByUser: !!e.likedByUser,
          likesCount:
            typeof e.likesCount === "number"
              ? e.likesCount
              : Array.isArray((e as any).likes)
              ? (e as any).likes.length
              : 0,
        }));

      setItems(mapped);
    } catch (err) {
      console.error("Erro ao carregar eventos musicais:", err);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    load();
  }, [load]);

  // like com atualização do card (sem otimista)
  const onToggleLike = useCallback(
    async (id: string) => {
      if (!isLoggedIn) {
        Alert.alert("Login necessário", "Entre com sua conta para curtir.");
        return;
      }
      try {
        const res = await apiHelpers.likeEvent(id); // { liked, count }
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  likedByUser: !!res.liked,
                  likesCount: typeof res.count === "number" ? res.count : it.likesCount,
                }
              : it
          )
        );
      } catch (e) {
        console.error("Erro ao curtir/descurtir:", e);
      }
    },
    [isLoggedIn]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={[{ key: "header" }]}
        renderItem={null}
        keyExtractor={(it) => it.key}
        ListHeaderComponent={
          <View style={{ flexGrow: 1, minHeight: SCREEN.height }}>
            <Header2 />
            <View style={styles.container}>
              <Text style={styles.title}>
  {region ? `${t("music_events")} — ${region}` : t("music_events")}
</Text>

              {loading ? (
                <ActivityIndicator size="large" color="#f97316" />
              ) : (
                <BarbershopGrid
                  barbershops={items}
                  onToggleLike={onToggleLike}
                  isLoggedIn={isLoggedIn}
                  onPressItem={(id) =>
                    router.push({ pathname: "/barbershop/[id]", params: { id } })
                  }
                />
              )}

              {!loading && items.length === 0 ? (
                <Text style={styles.empty}>
                  Nenhum evento musical encontrado{region ? ` para a região ${region}` : ""}.
                </Text>
              ) : null}
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingTop: 32 }}>
            <Footer />
          </View>
        }
      />

      {/* Sidebar (menu) — sobrepõe ao abrir */}
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
  container: { paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "#111", marginBottom: 12 },
  empty: { color: "#9ca3af", marginTop: 12 },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: SCREEN.width * 0.8,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
