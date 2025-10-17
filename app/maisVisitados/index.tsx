// app/maisVisitados/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import Header2 from "@/components/Header2";
import SidebarSheet from "@/components/SidebarSheet";
import Footer from "@/components/footer";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useMenu } from "@/context/MenuContext";
import { ApiEvent, apiHelpers } from "@/lib/api";
import { mapCityToRegion } from "@/lib/rjRegions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN = Dimensions.get("window");
const STORAGE_KEY_REGION = "@ote:selectedRegion";
const BG = "#f2f2f2";

/** mesmas categorias musicais usadas no seu carrossel */
const MUSIC_CATEGORIES = new Set<string>([
  "Carnaval","Rodas de Samba","Bossa Nova","Passinho","Funk","Eletrônica",
  "Forró","MPB","Rock","Blues","Jazz","Chorinho",
]);

// helper p/ validar datas (evita NaN)
const toDate = (v?: string | Date | null) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(+d) ? null : d;
};

export default function MaisVisitadosScreen() {
  const router = useRouter();
  const { isOpen, closeMenu } = useMenu();
  const { user } = useAuth();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GridItem[]>([]);
  const [region, setRegion] = useState<string>("");

  const isLoggedIn = !!user?.accessToken;

  // Região: ?region tem prioridade; senão AsyncStorage
  const sp = useLocalSearchParams() as { region?: string; exclude?: string };
  useEffect(() => {
    (async () => {
      const urlRegion = (sp?.region ?? "").toString().trim();
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
  }, [sp?.region]);

  // optional: ids a excluir via ?exclude=1,2,3
  const excludeIds = useMemo(() => {
    const raw = (sp?.exclude ?? "").toString().trim();
    if (!raw) return new Set<string>();
    return new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
  }, [sp?.exclude]);

  // Carrega e aplica os filtros “que sobraram”
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all: ApiEvent[] = await apiHelpers.events();

      // 1) aprovados
      const approved = all.filter((e) => !!e.aprovado);

      // 2) por região (se houver)
      const regionTrim = (region || "").trim();
      const byRegion = regionTrim
        ? approved.filter((e) => mapCityToRegion(e.address ?? "") === regionTrim)
        : approved;

      // 3) remove categorias musicais (sobraram = não musicais)
      const nonMusical = byRegion.filter((e) => {
        const cats = Array.isArray(e.categories) ? e.categories : [];
        return !cats.some((c) => MUSIC_CATEGORIES.has(c));
      });

      // 4) EXCLUI os "allnoDate": manter só quem tem startDate OU endDate válida
      const withDateOnly = nonMusical.filter((e) => {
        const hasStart = !!toDate(e.startDate ?? null);
        const hasEnd = !!toDate(e.endDate ?? null);
        return hasStart || hasEnd;
      });

      // 5) exclui IDs passados por query (ex.: já mostrados em outro carrossel)
      const remaining = withDateOnly.filter((e) => !excludeIds.has(String(e.id)));

      // 6) normaliza para o grid
      const mapped: GridItem[] = remaining
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
              : (Array.isArray(e.likes) ? e.likes.length : 0),
        }));

      setItems(mapped);
    } catch (err) {
      console.error("Erro ao carregar eventos restantes:", err);
    } finally {
      setLoading(false);
    }
  }, [region, excludeIds]);

  useEffect(() => {
    load();
  }, [load]);

  // like com feedback (sem otimista aqui, mas atualiza o card)
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
    <View style={{ flex: 1, backgroundColor: BG }}>
      <FlatList
        data={[{ key: "header" }]}
        renderItem={null}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <View style={{ flexGrow: 1, minHeight: SCREEN.height, backgroundColor: BG }}>
            <Header2 />
            <View style={[styles.container, { backgroundColor: BG }]}>
              <Text style={styles.title}>
                {region ? `${t("more_events")} (${region})` : t("more_events")}
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
                <Text style={{ color: "#9ca3af", marginTop: 12 }}>
                  Nenhum evento restante encontrado
                  {region ? ` para a região ${region}` : ""}.
                </Text>
              ) : null}
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingTop: 32, backgroundColor: BG }}>
            <Footer />
          </View>
        }
      />

      {/* Sidebar (menu) — sobrepõe quando aberta (não fixa página) */}
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
  container: { paddingHorizontal: 16, paddingTop: 12 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
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
