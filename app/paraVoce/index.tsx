// app/paraVoce/index.tsx
import BarbershopGrid from "@/components/BarbershopGrid";
import Footer from "@/components/footer";
import Header2 from "@/components/Header2";
import SidebarSheet from "@/components/SidebarSheet";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useMenu } from "@/context/MenuContext";
import { ApiEvent, apiHelpers } from "@/lib/api";
import { mapCityToRegion } from "@/lib/rjRegions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
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
type GridItem = ApiEvent & {
  likesCount?: number;
  likedByUser?: boolean;
};

const STORAGE_KEY_REGION = "@ote:selectedRegion";
const BG = "#f2f2f2";

export default function ParaVoceScreen() {
  const { user } = useAuth();
  const { isOpen, closeMenu } = useMenu();
  const [loading, setLoading] = useState(true);
  const [barbershops, setBarbershops] = useState<GridItem[]>([]);
  const [region, setRegion] = useState<string>("");
  const { t } = useI18n();
  const SCREEN_WIDTH = Dimensions.get("window").width;

  // pega região: ?region tem prioridade; senão AsyncStorage
  const { region: regionFromParams } = useLocalSearchParams<{ region?: string }>();

  useEffect(() => {
    (async () => {
      const urlRegion = (regionFromParams ?? "").toString().trim();
      if (urlRegion) {
        setRegion(urlRegion);
        try {
          await AsyncStorage.setItem(STORAGE_KEY_REGION, urlRegion);
        } catch {}
        return;
      }
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_REGION);
        if (typeof saved === "string") setRegion(saved);
      } catch {}
    })();
  }, [regionFromParams]);

  // Carrega “Eventos para você” e filtra por região selecionada
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allEvents = await apiHelpers.events();

        // 1) só aprovados
        const approved = (allEvents as ApiEvent[]).filter((e) => !!e.aprovado);

        // 2) filtro por preferências (se o usuário tiver)
        const byPrefs = approved.filter((evento) => {
          const hasValidPreferences =
            user?.preferencesSet &&
            Array.isArray(user.preferences) &&
            user.preferences.length > 0;

          if (!hasValidPreferences) return true;

          return (
            Array.isArray(evento.categories) &&
            evento.categories.some((cat) => user!.preferences!.includes(cat))
          );
        });

        // 3) filtro por região selecionada (se houver)
        const regionTrim = (region || "").trim();
        const byRegion = regionTrim
          ? byPrefs.filter((e) => mapCityToRegion(e.address ?? "") === regionTrim)
          : byPrefs;

        // 4) enriquecer like info
        const enriched: GridItem[] = byRegion.map((evento) => {
          const likesCount = Array.isArray(evento.likes)
            ? evento.likes.length
            : (evento as any).likesCount ?? 0;

          const likedByUser = user?.id
            ? !!evento.likes?.some((l: any) => l.userId === user.id)
            : (evento as any).likedByUser ?? false;

          return { ...evento, likesCount, likedByUser };
        });

        setBarbershops(enriched.slice(0, 10)); // limite opcional
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // refaz quando mudar região ou preferências
  }, [region, user?.id, user?.preferencesSet, (user?.preferences ?? []).join("|")]);

  // 🔁 Toggle Like com optimistic update
  const onToggleLike = useCallback(
    async (itemOrId: string | GridItem) => {
      const id = typeof itemOrId === "string" ? itemOrId : itemOrId.id;

      if (!user?.id) {
        Alert.alert("Login necessário", "Entre com sua conta para curtir.");
        return;
      }

      const prev = barbershops;

      setBarbershops((curr) =>
        curr.map((e) =>
          e.id === id
            ? {
                ...e,
                likedByUser: !e.likedByUser,
                likesCount: (e.likesCount ?? 0) + (e.likedByUser ? -1 : 1),
              }
            : e
        )
      );

      try {
        const data = await apiHelpers.likeEvent(id); // { liked, count }
        setBarbershops((curr) =>
          curr.map((e) =>
            e.id === id
              ? {
                  ...e,
                  likedByUser: !!data.liked,
                  likesCount: typeof data.count === "number" ? data.count : e.likesCount,
                }
              : e
          )
        );
      } catch (err) {
        console.error("Erro ao curtir/descurtir:", err);
        Alert.alert("Erro", "Não foi possível curtir agora. Tente novamente.");
        setBarbershops(prev); // rollback
      }
    },
    [barbershops, user?.id]
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <FlatList
        data={[{ key: "header" }]}
        renderItem={null}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <View style={{ flexGrow: 1, minHeight: Dimensions.get("window").height, backgroundColor: BG }}>
            <View style={[styles.container, { backgroundColor: BG }]}>
              <Header2 />
              <View style={[styles.content, { backgroundColor: BG }]}>
                <Text style={styles.title}>
                  {region ? `${t("events_for_you")} — ${region}` : t("events_for_you")}
                </Text>

                {loading ? (
                  <ActivityIndicator size="large" color="#f97316" />
                ) : (
                  <BarbershopGrid
                    barbershops={barbershops}
                    onToggleLike={onToggleLike}
                    isLoggedIn={!!user}
                  />
                )}

                {!loading && barbershops.length === 0 ? (
                  <Text style={{ color: "#9ca3af", marginTop: 12 }}>
                    Nenhum evento encontrado{region ? ` para a região ${region}` : ""}.
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingTop: 32, backgroundColor: BG }}>
            <Footer />
          </View>
        }
      />

      {/* Sidebar */}
      {isOpen && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <AnimatedRN.View
            entering={SlideInRight}
            exiting={SlideOutRight}
            style={[styles.sidebar, { width: SCREEN_WIDTH * 0.8 }]}
          >
            <SidebarSheet />
          </AnimatedRN.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
});
