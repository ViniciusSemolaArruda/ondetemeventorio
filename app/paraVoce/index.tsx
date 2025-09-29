// app/paraVoce/index.tsx
import BarbershopGrid from "@/components/BarbershopGrid";
import Footer from "@/components/footer";
import Header2 from "@/components/Header2";
import SidebarSheet from "@/components/SidebarSheet";
import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { ApiEvent, apiHelpers } from "@/lib/api";
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

export default function ParaVoceScreen() {
  const { user } = useAuth();
  const { isOpen, closeMenu } = useMenu();
  const [loading, setLoading] = useState(true);
  const [barbershops, setBarbershops] = useState<GridItem[]>([]);

  const SCREEN_WIDTH = Dimensions.get("window").width;

  // Carrega “Eventos para você” (aprovados + preferências do usuário)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allEvents = await apiHelpers.events();

        const filteredEvents = allEvents.filter((evento) => {
          if (!evento.aprovado) return false;

          const hasValidPreferences =
            user?.preferencesSet &&
            Array.isArray(user.preferences) &&
            user.preferences.length > 0;

          if (hasValidPreferences) {
            return (
              Array.isArray(evento.categories) &&
              evento.categories.some((cat) => user.preferences!.includes(cat))
            );
          }

          return true;
        });

        const enriched: GridItem[] = filteredEvents.map((evento) => {
          const likesCount = Array.isArray(evento.likes)
            ? evento.likes.length
            : evento.likesCount ?? 0;

        const likedByUser = user?.id
          ? evento.likes?.some((l) => l.userId === user.id)
          : evento.likedByUser ?? false;

          return {
            ...evento,
            likesCount,
            likedByUser,
          };
        });

        // limite opcional (como estava antes)
        setBarbershops(enriched.slice(0, 10));
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.preferencesSet, (user?.preferences ?? []).join("|")]);

  // 🔁 Toggle Like com optimistic update
  const onToggleLike = useCallback(
    async (itemOrId: string | GridItem) => {
      const id = typeof itemOrId === "string" ? itemOrId : itemOrId.id;

      if (!user?.id) {
        Alert.alert("Login necessário", "Entre com sua conta para curtir.");
        return;
      }

      // estado anterior p/ rollback em caso de erro
      const prev = barbershops;

      // optimistic update
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
        const data = await apiHelpers.likeEvent(id); // { liked: boolean, count: number }
        setBarbershops((curr) =>
          curr.map((e) =>
            e.id === id
              ? {
                  ...e,
                  likedByUser: !!data.liked,
                  likesCount:
                    typeof data.count === "number" ? data.count : e.likesCount,
                }
              : e
          )
        );
      } catch (err) {
        console.error("Erro ao curtir/descurtir:", err);
        Alert.alert("Erro", "Não foi possível curtir agora. Tente novamente.");
        // rollback
        setBarbershops(prev);
      }
    },
    [barbershops, user?.id]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={[{ key: "header" }]}
        renderItem={null}
        keyExtractor={(item) => item.key}
        ListHeaderComponent={
          <View
            style={{ flexGrow: 1, minHeight: Dimensions.get("window").height }}
          >
            <View style={styles.container}>
              <Header2 />
              <View style={styles.content}>
                <Text style={styles.title}>Para Você</Text>

                {loading ? (
                  <ActivityIndicator size="large" color="#f97316" />
                ) : (
                  <BarbershopGrid
                    barbershops={barbershops}
                    // ⬇️ Passe o handler de like para o grid:
                    onToggleLike={onToggleLike}
                    // (se seu Grid também usa checagem de login, pode passar)
                    isLoggedIn={!!user}
                  />
                )}
              </View>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingTop: 32 }}>
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
    backgroundColor: "#fff",
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
