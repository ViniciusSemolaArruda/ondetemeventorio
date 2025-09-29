// app/maisVisitados/index.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
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
import { useMenu } from "@/context/MenuContext";
import { ApiEvent, apiHelpers } from "@/lib/api";

const SCREEN = Dimensions.get("window");

export default function MaisVisitadosScreen() {
  const router = useRouter();
  const { isOpen, closeMenu } = useMenu();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GridItem[]>([]);

  const isLoggedIn = !!user?.accessToken;
  const userPrefs = useMemo(
    () => (user?.preferencesSet && Array.isArray(user?.preferences) ? user?.preferences : []),
    [user?.preferencesSet, (user?.preferences ?? []).join("|")]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 1) carrega todos os eventos aprovados
      const all: ApiEvent[] = await apiHelpers.events();

      const approved = all.filter((e) => e.aprovado);

      // 2) se tiver preferências, calcula os que iriam para “Para Você”
      let paraVoceIds = new Set<string>();
      if (userPrefs.length > 0) {
        for (const e of approved) {
          const cats = Array.isArray(e.categories) ? e.categories : [];
          if (cats.some((c) => userPrefs.includes(c))) {
            paraVoceIds.add(e.id);
          }
        }
      }

      // 3) “Mais Visitados” = aprovados - paraVoce
      const maisVisitados = approved.filter((e) => !paraVoceIds.has(e.id));

      // 4) normaliza para o grid (permitindo nulls com fallbacks no Grid)
      const mapped: GridItem[] = maisVisitados
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
        .map((e) => ({
          id: String(e.id),
          name: e.name,
          address: e.address ?? "",
          imageUrl: e.imageUrl ?? null,
          likedByUser: !!e.likedByUser,
          likesCount: typeof e.likesCount === "number" ? e.likesCount : 0,
        }));

      setItems(mapped);
    } catch (err) {
      console.error("Erro ao carregar Mais Visitados:", err);
    } finally {
      setLoading(false);
    }
  }, [userPrefs]);

  useEffect(() => {
    load();
  }, [load]);

  // handler de like que atualiza o estado local
  const onToggleLike = useCallback(
    async (id: string) => {
      if (!user?.accessToken) {
        // O componente BarbershopGrid já mostra modal/toast quando não logado;
        // aqui só evitamos a chamada.
        return;
      }
      try {
        const res = await apiHelpers.likeEvent(id);
        // res: { liked: boolean, count: number }
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
    [user?.accessToken]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header fora da lista para não “cortar” */}
      <Header2 />

      <View style={styles.container}>
        <Text style={styles.title}>Todos os Eventos</Text>

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

        <Footer />
      </View>

      {/* Sidebar (menu) */}
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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
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
