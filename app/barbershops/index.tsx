// app/barbershops/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import Header3 from "@/components/Header3";
import SidebarSheet from "@/components/SidebarSheet";
import Footer from "@/components/footer";
import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { apiHelpers, setAuthToken } from "@/lib/api";

import FilterBarRN from "@/components/FilterBarRN";
import QuickSearchSectionRN from "@/components/QuickSearchSectionRN";
import { mapCityToRegion } from "@/lib/rjRegions";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// “nudge” para empurrar o QuickSearch mais à esquerda
const QUICKSEARCH_LEFT_NUDGE = 12; // ajuste se quiser mais/menos

// Grid responsivo: 1 coluna em phones, 2 colunas em telas largas
const PHONE_BREAKPOINT = 768;
const NUM_COLS = SCREEN.width >= PHONE_BREAKPOINT ? 2 : 1;

const CARD_WIDTH = (SCREEN.width - H_PADDING * 2 - COL_GAP * (NUM_COLS - 1)) / NUM_COLS;
const IMAGE_H = (CARD_WIDTH * 9) / 16;
const CARD_VERTICAL_GAP = 8;
const CARD_TEXT_BLOCK = 40;
const ROW_GAP = 16;
const CARD_ROW_H = IMAGE_H + CARD_VERTICAL_GAP + CARD_TEXT_BLOCK;

const STORAGE_KEY = "@ote:selectedRegion";
const BG = "#f2f2f2"; // fundo acinzentado solicitado

const isFutureOrOngoing = (ev: EventItem) => {
  const now = Date.now();
  const sd = ev.startDate ? new Date(ev.startDate).getTime() : null;
  const ed = ev.endDate ? new Date(ev.endDate).getTime() : null;
  if (ed != null) return ed >= now;
  if (sd != null) return sd >= now;
  return true; // eventos fixos (sem datas)
};

export default function BarbershopsScreen() {
  const { user } = useAuth();
  const { isOpen, closeMenu } = useMenu();
  const router = useRouter();

  const { title: titleFromParams, service: serviceFromParams, region: regionFromParams } =
    useLocalSearchParams<{ title?: string; service?: string; region?: string }>();

  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [region, setRegion] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [service, setService] = useState<string>("");

  // medir header e header interno para “grudar” footer
  const [outerHeaderH, setOuterHeaderH] = useState(0);
  const [listHeaderH, setListHeaderH] = useState(0);

  const likeScale = useRef(new Animated.Value(1)).current;
  const pop = () => {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.2, useNativeDriver: true, speed: 20, bounciness: 10 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
  };

  // hidrata região (URL tem prioridade; se não houver, AsyncStorage)
  useEffect(() => {
    (async () => {
      const urlRegion = (regionFromParams ?? "").toString().trim();
      if (urlRegion) {
        setRegion(urlRegion);
        await AsyncStorage.setItem(STORAGE_KEY, urlRegion);
      } else {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (typeof saved === "string") setRegion(saved);
      }
    })();
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
          const likesCount = Array.isArray(evento.likes) ? evento.likes.length : evento.likesCount ?? 0;
          const likedByUser = user?.id ? evento.likes?.some((l: { userId: string }) => l.userId === user.id) : false;

          return {
            ...evento,
            likesCount,
            likedByUser,
            categories: Array.isArray(evento.categories) ? evento.categories : [],
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

    fetchEvents(initialService.trim() ? { service: initialService } : { title: initialTitle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFromParams, serviceFromParams]);

  // aplica “região” ao clicar nos cards de regiões
  const handleApplyRegion = useCallback(
    async (q: Record<string, string>) => {
      const next = q.region ?? "";
      setRegion(next);
      if (next) await AsyncStorage.setItem(STORAGE_KEY, next);
      else await AsyncStorage.removeItem(STORAGE_KEY);
    },
    []
  );

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

      setAllEvents((prev) =>
        prev.map((e) =>
          e.id === item.id
            ? {
                ...e,
                likedByUser: !!data.liked,
                likesCount: typeof data.count === "number" ? data.count : e.likesCount,
              }
            : e
        )
      );
    } catch (e) {
      console.error("Erro ao curtir/descurtir:", e);
      setAllEvents((prev) =>
        prev.map((ev) =>
          ev.id === item.id
            ? {
                ...ev,
                likedByUser: !ev.likedByUser,
                likesCount: (ev.likesCount ?? 0) + (ev.likedByUser ? -1 : 1),
              }
            : ev
        )
      );
      Alert.alert("Erro", "Não foi possível curtir agora. Tente novamente.");
    }
  };

  const renderCard = ({ item }: { item: EventItem }) => {
    const imgUri = item.imageUrl || "";
    return (
      <Pressable
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
            <Image source={{ uri: imgUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>Sem imagem</Text>
            </View>
          )}

          <Animated.View style={[styles.likeBadge, { transform: [{ scale: likeScale }] }]}>
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
                  fill={item.likedByUser ? "#ef4444" : "transparent"}
                />
                <Text style={styles.likeCount}>{item.likesCount ?? 0}</Text>
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

  const onOuterHeaderLayout = (e: LayoutChangeEvent) => {
    setOuterHeaderH(e.nativeEvent.layout.height);
  };
  const onListHeaderLayout = (e: LayoutChangeEvent) => {
    setListHeaderH(e.nativeEvent.layout.height);
  };

  const rows = Math.ceil(Math.max(filteredEvents.length, 0) / NUM_COLS);
  const rowsHeight = rows > 0 ? rows * CARD_ROW_H + Math.max(0, rows - 1) * ROW_GAP : 0;
  const visibleListHeight = SCREEN.height - outerHeaderH;
  const remaining = Math.max(0, visibleListHeight - listHeaderH - rowsHeight);

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header (não fixo) */}
      <View onLayout={onOuterHeaderLayout} style={{ backgroundColor: BG }}>
        <Header3 />
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        columnWrapperStyle={NUM_COLS > 1 ? { gap: COL_GAP, marginBottom: ROW_GAP } : undefined}
        contentContainerStyle={[styles.grid, { paddingHorizontal: H_PADDING, backgroundColor: BG }]}
        style={{ backgroundColor: BG }}
        ListHeaderComponent={
          <View style={[styles.headerBlock, { backgroundColor: BG }]} onLayout={onListHeaderLayout}>
            {/* Quick Search — empurrado levemente para a esquerda */}
            <View style={{ marginLeft: -QUICKSEARCH_LEFT_NUDGE }}>
              <QuickSearchSectionRN
                key={`qs-${service || "none"}`}
                onPressSeeAll={() => router.push("/colecoes" as any)}
              />
            </View>

            {/* Regiões — alinhado com o grid */}
            <View style={{ marginTop: 30 }}>
              <FilterBarRN selectedRegion={region} onApply={handleApplyRegion} />
            </View>

            {/* Result header */}
            {(resultHeader || loading) && (
              <View style={{ marginTop: 10 }}>
                {resultHeader ? (
                  <Text style={styles.resultTitle}>{resultHeader.toUpperCase()}</Text>
                ) : null}
                {loading ? <ActivityIndicator size="small" color="#f97316" style={{ marginTop: 6 }} /> : null}
                {!loading && filteredEvents.length === 0 ? (
                  <Text style={styles.noResults}>Nenhum evento encontrado.</Text>
                ) : null}
              </View>
            )}
          </View>
        }
        renderItem={renderCard}
        ListFooterComponent={
          <>
            {remaining > 0 ? <View style={{ height: remaining, backgroundColor: BG }} /> : null}
            <View style={{ backgroundColor: BG }}>
              <Footer />
            </View>
          </>
        }
      />

      {/* Sidebar (menu) */}
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
  headerBlock: {
    paddingTop: 8,
  },

  resultTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9ca3af",
    marginTop: 10,
    marginLeft: 4,
  },

  grid: {
    paddingBottom: 32,
    paddingTop: 8,
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
    marginBottom: ROW_GAP,
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

  noResults: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 20,
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
