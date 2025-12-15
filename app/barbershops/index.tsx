// app/barbershops/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AnimatedRN, {
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

import EventsFiltersSectionRN from "@/components/EventsFiltersSectionRN";
import Header3 from "@/components/Header3";
import SidebarSheet from "@/components/SidebarSheet";
import Footer from "@/components/footer";
import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { apiHelpers, setAuthToken } from "@/lib/api";
import { mapCityToRegion } from "@/lib/rjRegions";

type EventItem = {
  id: string;
  name: string;
  address?: string | null;
  imageUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  categories?: string[];
  likes?: { userId: string }[];
  likesCount?: number;
  likedByUser?: boolean;
};

const SCREEN = Dimensions.get("window");
const H_PADDING = 16;
const COL_GAP = 16;
const RADIUS = 16;

// Grid responsivo: 1 coluna em phones, 2 colunas em telas largas
const PHONE_BREAKPOINT = 768;
const NUM_COLS = SCREEN.width >= PHONE_BREAKPOINT ? 2 : 1;

const CARD_WIDTH =
  (SCREEN.width - H_PADDING * 2 - COL_GAP * (NUM_COLS - 1)) / NUM_COLS;

const ROW_GAP = 16;
const BG = "#f2f2f2"; // fundo acinzentado

const isFutureOrOngoing = (ev: EventItem) => {
  const now = Date.now();
  const sd = ev.startDate ? new Date(ev.startDate).getTime() : null;
  const ed = ev.endDate ? new Date(ev.endDate).getTime() : null;
  if (ed != null) return ed >= now;
  if (sd != null) return sd >= now;
  return true; // eventos fixos (sem datas)
};

export default function BarbershopsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOpen, closeMenu } = useMenu();

  const {
    title: titleFromParams,
    service: serviceFromParams,
    region: regionFromParams,
  } = useLocalSearchParams<{
    title?: string;
    service?: string;
    region?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [region, setRegion] = useState<string>(""); // região atualmente aplicada
  const [title, setTitle] = useState<string>("");
  const [service, setService] = useState<string>("");

  const likeScale = useRef(new Animated.Value(1)).current;
  const pop = () => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 20,
        bounciness: 10,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }),
    ]).start();
  };

  // 🔥 região controlada SOMENTE via params (igual web, sem AsyncStorage)
  useEffect(() => {
    const urlRegion = (regionFromParams ?? "").toString().trim();
    setRegion(urlRegion); // se não tiver param, vira ""
  }, [regionFromParams]);

  // carrega eventos e aplica normalização (enviando 'service' quando existir)
  const fetchEvents = useCallback(
    async (opts: { title?: string; service?: string }) => {
      setLoading(true);
      try {
        let resp: any[] = [];

        if (opts.service?.trim()) {
          // Busca por serviço/categoria (vindo da Busca Rápida)
          resp = await apiHelpers.events({ service: opts.service.trim() });
        } else {
          // Busca textual por título
          const q = opts.title?.trim() || "";
          resp = await apiHelpers.events({ title: q });
        }

        const mapped: EventItem[] = (resp ?? []).map((evento: any) => {
          const likesCount = Array.isArray(evento.likes)
            ? evento.likes.length
            : evento.likesCount ?? 0;
          const likedByUser = user?.id
            ? evento.likes?.some(
                (l: { userId: string }) => l.userId === user.id
              )
            : false;

          return {
            ...evento,
            likesCount,
            likedByUser,
            categories: Array.isArray(evento.categories)
              ? evento.categories
              : [],
          };
        });

        setAllEvents(mapped);
      } catch (err) {
        console.error("Erro ao buscar eventos:", err);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  // inicializa com params (title/service) e busca
  useEffect(() => {
    const initialTitle = (titleFromParams ?? "").toString();
    const initialService = (serviceFromParams ?? "").toString();

    setTitle(initialTitle);
    setService(initialService);

    fetchEvents(
      initialService.trim()
        ? { service: initialService }
        : { title: initialTitle }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFromParams, serviceFromParams]);

  // filtra por região e por data (não mostrar terminados)
  const filteredEvents = useMemo(() => {
    const base = allEvents.filter(isFutureOrOngoing);
    const r = (region || "").trim();
    if (!r) return base;
    return base.filter((e) => mapCityToRegion(e.address ?? "") === r);
  }, [allEvents, region]);

  // toggle like (otimista)
  const toggleLike = async (item: EventItem) => {
    if (!user?.id) {
      Alert.alert("Login necessário", "Entre com sua conta para curtir.");
      return;
    }
    try {
      // @ts-ignore
      if (user?.accessToken) setAuthToken(user.accessToken as string);

      pop();

      // otimista
      setAllEvents((prev) =>
        prev.map((e) =>
          e.id === item.id
            ? {
                ...e,
                likedByUser: !e.likedByUser,
                likesCount: (e.likesCount ?? 0) + (e.likedByUser ? -1 : 1),
              }
            : e
        )
      );

      const data = await apiHelpers.likeEvent(item.id); // { liked, count }

      // corrige com retorno da API
      setAllEvents((prev) =>
        prev.map((e) =>
          e.id === item.id
            ? {
                ...e,
                likedByUser: !!data.liked,
                likesCount:
                  typeof data.count === "number" ? data.count : e.likesCount,
              }
            : e
        )
      );
    } catch (e) {
      console.error("Erro ao curtir/descurtir:", e);
      // reverte
      setAllEvents((prev) =>
        prev.map((ev) =>
          ev.id === item.id
            ? {
                ...ev,
                likedByUser: !ev.likedByUser,
                likesCount:
                  (ev.likesCount ?? 0) + (ev.likedByUser ? -1 : 1),
              }
            : ev
        )
      );
      Alert.alert("Erro", "Não foi possível curtir agora. Tente novamente.");
    }
  };

  const showingTerm = (service?.trim() || title?.trim() || "");
  const resultHeader =
    showingTerm || region
      ? [
          showingTerm ? `Resultados para “${showingTerm}”` : null,
          region ? `Região: ${region}` : null,
        ]
          .filter(Boolean)
          .join(" • ")
      : "";

  // cards em grid
  const renderGrid = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="large"
          color="#f97316"
          style={{ marginTop: 12 }}
        />
      );
    }

    if (!loading && filteredEvents.length === 0) {
      return (
        <Text style={styles.empty}>
          Nenhum evento encontrado
          {region ? ` para a região ${region}` : ""}.
        </Text>
      );
    }

    return (
      <View style={styles.grid}>
        {filteredEvents.map((item) => {
          const imgUri = item.imageUrl || "";
          return (
            <Pressable
              key={item.id}
              style={[styles.card, { width: CARD_WIDTH }]}
              onPress={() =>
                router.push({
                  pathname: "/barbershop/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.imageWrap}>
                {imgUri ? (
                  <Image
                    source={{ uri: imgUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderText}>Sem imagem</Text>
                  </View>
                )}

                <Animated.View
                  style={[
                    styles.likeBadge,
                    { transform: [{ scale: likeScale }] },
                  ]}
                >
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      toggleLike(item);
                    }}
                  >
                    <View style={styles.likeInner}>
                      <Heart
                        size={16}
                        color={item.likedByUser ? "#ef4444" : "#9ca3af"}
                        fill={
                          item.likedByUser ? "#ef4444" : "transparent"
                        }
                      />
                      <Text style={styles.likeCount}>
                        {item.likesCount ?? 0}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              {!!item.address && (
                <Text style={styles.cardAddress} numberOfLines={1}>
                  {item.address}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* FlatList com UM item, tudo no header (pra Header/Footer rolarem juntos) */}
      <FlatList
        data={[{ key: "content" }]}
        renderItem={null}
        keyExtractor={(it) => it.key}
        style={{ backgroundColor: BG }}
        contentContainerStyle={{ backgroundColor: BG }}
        ListHeaderComponent={
          <View
            style={{
              flexGrow: 1,
              minHeight: SCREEN.height,
              backgroundColor: BG,
            }}
          >
            {/* Header rola junto */}
            <Header3 />

            <View style={styles.container}>
              {/* filtros */}
              <EventsFiltersSectionRN selectedRegion={region} />

              {/* texto de resultados */}
              {(resultHeader || loading) && (
                <View style={{ marginTop: 10 }}>
                  {resultHeader ? (
                    <Text style={styles.resultTitle}>
                      {resultHeader.toUpperCase()}
                    </Text>
                  ) : null}
                </View>
              )}

              {/* grid de eventos */}
              {renderGrid()}
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingTop: 32, backgroundColor: BG }}>
            <Footer />
          </View>
        }
      />

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
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  resultTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9ca3af",
    marginTop: 10,
    marginLeft: 4,
  },

  empty: {
    color: "#9ca3af",
    marginTop: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: COL_GAP,
    rowGap: ROW_GAP,
    paddingTop: 8,
    paddingBottom: 32,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 8,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 12,
  },
  likeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  likeInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    paddingHorizontal: 8,
  },
  cardAddress: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    paddingHorizontal: 8,
    paddingBottom: 10,
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
