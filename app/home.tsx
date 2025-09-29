import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Banner from "@/components/Banner";
import BarbershopCarousel from "@/components/barbershop-carousel";
import Calendar from "@/components/Calendar";
import EventosGrid from "@/components/EventosGrid";
import Footer from "@/components/footer";
import Header from "@/components/Header";
import MapRJ from "@/components/MapRJ";
import Search from "@/components/search";
import { quickSearchOptions } from "@/constants/search";
import { useAuth } from "@/context/AuthContext";
import { useBanners } from "@/hooks/useBanners";
import { ApiEvent, apiHelpers } from "@/lib/api";
import { useRouter } from "expo-router";

import EventFixCarousel from "@/components/EventFixCarousel";
import MusicEventsCarousel from "@/components/MusicEventsCarousel";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type EventMapItem = {
  id: string;
  name: string;
  address: string | null;
  imageUrl: string | null;
  lat: number;
  lng: number;
};

/* === Mesmas categorias musicais do web === */
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
const MUSIC_CATEGORIES_SET = new Set<string>(MUSIC_CATEGORIES as readonly string[]);

/* Ícones locais (atenção aos caminhos) */
const ICONS: Record<string, any> = {
  "/musica(1).png": require("../assets/icons/musica(1).png"),
  "/show.png": require("../assets/icons/show.png"),
  "/ano-novo.png": require("../assets/icons/ano-novo.png"),
  "/bar.png": require("../assets/icons/bar.png"),
  "/restaurante.png": require("../assets/icons/restaurante.png"),
  "/religion.png": require("../assets/icons/religion.png"),
  "/teatro.png": require("../assets/icons/teatro.png"),
  "/esporte.png": require("../assets/icons/esporte.png"),
  "/chefe-de-cozinha.png": require("../assets/icons/chefe-de-cozinha.png"),
  "/barraca-de-comida.png": require("../assets/icons/barraca-de-comida.png"),
  "/seminario.png": require("../assets/icons/seminario.png"),
  "/simposio.png": require("../assets/icons/simposio.png"),
};
const DEFAULT_ICON = ICONS["/show.png"];
const resolveIcon = (imageUrl?: string) => {
  if (!imageUrl) return DEFAULT_ICON;
  const local = ICONS[imageUrl];
  if (local) return local;
  if (imageUrl.startsWith?.("http")) return { uri: imageUrl };
  return DEFAULT_ICON;
};

/* helpers de coordenada */
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(",", ".").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const inBounds = (lat: number, lng: number) =>
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

export default function Home() {
  const { user, isHydrated } = useAuth();
  const isLoggedIn = !!user;
  const router = useRouter();

  const firstName = useMemo(() => (user?.name || "").trim().split(" ")[0], [user?.name]);

  const [listScrollEnabled, setListScrollEnabled] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);

  const [mapRect, setMapRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: SCREEN_WIDTH,
    height: 0,
  });
  const onMapContainerLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setMapRect({ x, y, width, height });
  };

  /* =========================
     Estados por agrupamento
     ========================= */
  const [eventsForYou, setEventsForYou] = useState<ApiEvent[]>([]);
  const [eventsMusicDated, setEventsMusicDated] = useState<ApiEvent[]>([]);
  const [eventsNonMusicDated, setEventsNonMusicDated] = useState<ApiEvent[]>([]);
  const [eventsFixed, setEventsFixed] = useState<ApiEvent[]>([]);
  const [mapData, setMapData] = useState<EventMapItem[]>([]);

  const { banners, loading: loadingBanners } = useBanners();

  const prefsKey = useMemo(() => {
    if (!user?.preferencesSet || !Array.isArray(user?.preferences)) return "";
    return [...user.preferences].sort().join("|");
  }, [user?.preferencesSet, user?.preferences]);

  const loadingRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || loadingRef.current) return;
    loadingRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const data: ApiEvent[] = await apiHelpers.events();

        const normalized: ApiEvent[] = data.map((e) => ({
          ...e,
          likesCount: typeof e.likesCount === "number" ? e.likesCount : 0,
          likedByUser: typeof e.likedByUser === "boolean" ? e.likedByUser : false,
          categories: Array.isArray(e.categories) ? e.categories : [],
        }));

        /* ordena: sem data vão para o fim (como no web) */
        normalized.sort((a, b) => eTime(a.startDate) - eTime(b.startDate));

        const approved = normalized.filter((e) => e.aprovado === true);

        /* separa fixos (sem datas) e datados */
        const fixed = approved.filter((e) => !e.startDate && !e.endDate);
        const dated = approved.filter((e) => e.startDate || e.endDate);

        /* datados musicais e não-musicais */
        const musicDated = dated.filter((e) =>
          (e.categories ?? []).some((c) => MUSIC_CATEGORIES_SET.has(c))
        );
        const nonMusicDated = dated.filter(
          (e) => !(e.categories ?? []).some((c) => MUSIC_CATEGORIES_SET.has(c))
        );

        /* “para você” somente se houver prefs */
        let forYou: ApiEvent[] = [];
        if (prefsKey) {
          const prefs = prefsKey.split("|");
          forYou = dated.filter((evento) => (evento.categories ?? []).some((c) => prefs.includes(c)));
        }

        /* mapa: aprovados com coordenadas válidas */
        const mapItems: EventMapItem[] = approved
          .map((e) => {
            const lat = toNum(e.latitude);
            const lng = toNum(e.longitude);
            return {
              id: String(e.id),
              name: e.name,
              address: e.address ?? null,
              imageUrl: e.imageUrl ?? null,
              lat: lat ?? 0,
              lng: lng ?? 0,
            } as EventMapItem;
          })
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
          .filter((p) => inBounds(p.lat, p.lng));

        if (!cancelled) {
          setEventsFixed(fixed);
          setEventsMusicDated(musicDated);
          setEventsNonMusicDated(nonMusicDated);
          setEventsForYou(forYou);
          setMapData(mapItems);
        }
      } catch (err) {
        console.error("Erro ao carregar eventos:", err);
      } finally {
        loadingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, prefsKey]);

  const onLoginPress = () => {
    Alert.alert("Login necessário", "Abra o menu e entre com o Google.");
  };

  const greeting = isLoggedIn ? `Olá, ${firstName || "Usuário"}!` : "Olá, bem-vindo!";

  const userPrefs = useMemo(
    () =>
      user?.preferencesSet && Array.isArray(user?.preferences) && user.preferences.length > 0
        ? user.preferences
        : null,
    [user?.preferencesSet, user?.preferences]
  );

  const fixedIds = useMemo(() => eventsFixed.map((e) => e.id), [eventsFixed]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[{ key: "header" }]}
        scrollEnabled={listScrollEnabled}
        renderItem={() => null}
        keyExtractor={(item) => (typeof item === "string" ? item : item.key)}
        ListHeaderComponent={
          <View style={styles.container}>
            <Header />

            <View style={styles.padding}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.subtitle}>O que você gostaria de fazer hoje?</Text>

              <View style={{ marginTop: 10 }}>
                <Search
                  onSubmit={(title) => {
                    if (title?.trim()) {
                      router.push(`/barbershops?title=${encodeURIComponent(title.trim())}`);
                    }
                  }}
                />
              </View>

              {/* Busca Rápida */}
              <View style={styles.quickSearchHeader}>
                <Text style={styles.quickSearchTitle}>Busca Rápida</Text>
                <TouchableOpacity style={styles.seeAllRow} onPress={() => router.push("/colecoes" as any)}>
                  <Text style={styles.seeAll}>Ver todas</Text>
                  <Feather name="chevron-right" size={16} color="#f97316" />
                </TouchableOpacity>
              </View>

              <View style={styles.quickSearchContainerRow}>
                <FlatList
                  data={quickSearchOptions}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.title}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.quickOption}
                      onPress={() => router.push(`/barbershops?service=${encodeURIComponent(item.title)}` as any)}
                    >
                      <Image source={resolveIcon(item.imageUrl)} style={styles.quickImage} />
                      <Text style={styles.quickText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Banner */}
              {!loadingBanners && banners.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Banner
                    data={banners.map((b) => ({
                      id: String(b.id),
                      imageUrl: b.imageUrl,
                      title: b.title,
                      displaySeconds: b.displaySeconds ?? 3,
                    }))}
                    autoPlay
                    showAdBadge
                    adText="Anuncie aqui"
                  />
                </View>
              )}

              {/* Para você (só aparece se houver prefs / usuário logado com prefs) */}
              {eventsForYou.length > 0 && (
                <View style={{ marginTop: 32 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Eventos para você</Text>
                    <TouchableOpacity style={styles.seeAllRow} onPress={() => router.push("/paraVoce")}>
                      <Text style={styles.seeAll}>Ver todas</Text>
                      <Feather name="chevron-right" size={16} color="#f97316" />
                    </TouchableOpacity>
                  </View>

                  <EventosGrid
                    barbershops={eventsForYou.map((e) => ({ ...e, imageUrl: e.imageUrl ?? "" }))}
                    isLoggedIn={isLoggedIn}
                    onLoginPress={onLoginPress}
                  />
                </View>
              )}

              {/* Música (somente com datas) */}
              {eventsMusicDated.length > 0 && (
                <View style={{ marginTop: 32 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Eventos de Música</Text>
                    <TouchableOpacity style={styles.seeAllRow} onPress={() => router.push("/musica" as any)}>
                      <Text style={styles.seeAll}>Ver todas</Text>
                      <Feather name="chevron-right" size={16} color="#f97316" />
                    </TouchableOpacity>
                  </View>

                  <MusicEventsCarousel
                    barbershops={eventsMusicDated.map((e) => ({
                      ...e,
                      imageUrl: e.imageUrl ?? "",
                      categories: Array.isArray(e.categories) ? e.categories : [],
                    }))}
                    isLoggedIn={isLoggedIn}
                    onLoginPress={onLoginPress}
                    userPrefs={userPrefs}
                  />
                </View>
              )}

              {/* Mais Eventos (somente datados não-musicais) */}
              {eventsNonMusicDated.length > 0 && (
                <View style={{ marginTop: 32 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mais Eventos</Text>
                    <TouchableOpacity style={styles.seeAllRow} onPress={() => router.push("/maisVisitados" as any)}>
                      <Text style={styles.seeAll}>Ver todas</Text>
                      <Feather name="chevron-right" size={16} color="#f97316" />
                    </TouchableOpacity>
                  </View>

                  <BarbershopCarousel
                    barbershops={eventsNonMusicDated.map((e) => ({ ...e, imageUrl: e.imageUrl ?? "" }))}
                    isLoggedIn={isLoggedIn}
                    onLoginPress={onLoginPress}
                    excludeIds={fixedIds}
                  />
                </View>
              )}

              {/* Fixos (sem data) */}
              {eventsFixed.length > 0 && (
                <View style={{ marginTop: 32 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Eventos do Dia a Dia</Text>
                    <TouchableOpacity style={styles.seeAllRow} onPress={() => router.push("/fixos" as any)}>
                      <Text style={styles.seeAll}>Ver todas</Text>
                      <Feather name="chevron-right" size={16} color="#f97316" />
                    </TouchableOpacity>
                  </View>

                  <EventFixCarousel
                    title={undefined}
                    events={eventsFixed.map((e) => ({
                      ...e,
                      imageUrl: e.imageUrl ?? "",
                      categories: Array.isArray(e.categories) ? e.categories : [],
                    }))}
                    isLoggedIn={isLoggedIn}
                    onLoginPress={onLoginPress}
                  />
                </View>
              )}

              {/* Mapa (aprovados com coords) */}
              {mapData.length > 0 && (
                <View style={{ marginTop: 32 }}>
                  <Text style={styles.sectionTitle}>Mapa de Eventos</Text>

                  <View onLayout={onMapContainerLayout} style={{ marginTop: 12 }}>
                    <MapRJ
                      events={mapData}
                      onPressItem={(id) => router.push(`/barbershop/${id}`)}
                      isInteractive={mapInteractive}
                      onInteractionChange={(enabled: boolean) => {
                        setMapInteractive(enabled);
                        setListScrollEnabled(!enabled);
                      }}
                    />
                  </View>
                </View>
              )}

              {/* Calendário */}
              <View style={{ marginTop: 32 }}>
                <Text style={styles.sectionTitle}>Calendário</Text>
                <View style={{ marginTop: 16 }}>
                  <Calendar />
                </View>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={<Footer />}
      />

      {/* Backdrop do mapa quando interativo */}
      {mapInteractive && mapRect.height > 0 && (
        <>
          <Pressable
            style={[styles.abs, { left: 0, right: 0, top: 0, height: mapRect.y }]}
            onPress={() => {
              setMapInteractive(false);
              setListScrollEnabled(true);
            }}
          />
          <Pressable
            style={[styles.abs, { left: 0, right: 0, top: mapRect.y + mapRect.height, bottom: 0 }]}
            onPress={() => {
              setMapInteractive(false);
              setListScrollEnabled(true);
            }}
          />
          <Pressable
            style={[
              styles.abs,
              { top: mapRect.y, bottom: SCREEN_HEIGHT - (mapRect.y + mapRect.height), left: 0, width: mapRect.x },
            ]}
            onPress={() => {
              setMapInteractive(false);
              setListScrollEnabled(true);
            }}
          />
          <Pressable
            style={[
              styles.abs,
              {
                top: mapRect.y,
                bottom: SCREEN_HEIGHT - (mapRect.y + mapRect.height),
                left: mapRect.x + mapRect.width,
                right: 0,
              },
            ]}
            onPress={() => {
              setMapInteractive(false);
              setListScrollEnabled(true);
            }}
          />
        </>
      )}
    </View>
  );
}

function eTime(d?: string | null) {
  return d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  padding: { padding: 16 },
  greeting: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 4 },

  quickSearchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 12,
  },
  quickSearchTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  seeAll: { fontSize: 14, color: "#f97316" },
  seeAllRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  quickSearchContainerRow: { paddingRight: 16, marginBottom: 8 },
  quickOption: {
    minWidth: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickImage: { width: 32, height: 32, marginBottom: 8, resizeMode: "contain" },
  quickText: { fontSize: 14, color: "#444", textAlign: "center" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },

  abs: { position: "absolute", backgroundColor: "transparent", zIndex: 10 },
});
