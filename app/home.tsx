// app/home.tsx
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { useAuth } from "@/context/AuthContext";
import { useBanners } from "@/hooks/useBanners";
import { ApiEvent, apiHelpers } from "@/lib/api";
import { useRouter } from "expo-router";

import EventFixCarousel from "@/components/EventFixCarousel";
import MusicEventsCarousel from "@/components/MusicEventsCarousel";

import FilterBarRN from "@/components/FilterBarRN";
import LanguageHeaderRN, { Lang } from "@/components/LanguageHeaderRN";

import { useI18n } from "@/context/I18nContext";
import { mapCityToRegion } from "@/lib/rjRegions";

// ✅ usa i18n keys e resolve para o valor do DB
import {
  getServiceFromKey,
  KEY_TO_DB,
  quickSearchOptions,
  type KeyI18n,
} from "@/constants/search";

import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type EventMapItem = {
  id: string;
  name: string;
  address: string | null;
  imageUrl: string | null;
  lat: number;
  lng: number;
};

// =======================
// TODAS AS CATEGORIAS (i18n KEYS)
// =======================
const ALL_CAT_KEYS: KeyI18n[] = [
  "cat_carnaval",
  "cat_samba",
  "cat_bossa",
  "cat_passinho",
  "cat_funk",
  "cat_eletronica",
  "cat_forro",
  "cat_mpb",
  "cat_rock",
  "cat_blues",
  "cat_jazz",
  "cat_chorinho",
  "cat_festivais",
  "cat_festas",
  "cat_parques",
  "cat_bares",
  "cat_restaurantes",
  "cat_religiao",
  "cat_cultural",
  "cat_esportes",
  "cat_gastronomia",
  "cat_feiras",
  "cat_seminarios",
  "cat_simposios",
  "cat_ambiente",
  "cat_agro",
  "cat_teatro",
  "cat_standup",
  "cat_familia",
  "cat_boate",
];

// Conjunto com os VALORES do DB para todas as categorias
const ALL_CATEGORIES_SET = new Set<string>(ALL_CAT_KEYS.map((k) => KEY_TO_DB[k]));

// =======================
// CATEGORIAS DE MÚSICA (subset)
// =======================
const MUSIC_KEYS: KeyI18n[] = [
  "cat_carnaval",
  "cat_samba",
  "cat_bossa",
  "cat_passinho",
  "cat_funk",
  "cat_eletronica",
  "cat_forro",
  "cat_mpb",
  "cat_rock",
  "cat_blues",
  "cat_jazz",
  "cat_chorinho",
];

// Conjunto com os VALORES do DB para as categorias de música
const MUSIC_CATEGORIES_SET = new Set<string>(MUSIC_KEYS.map((k) => KEY_TO_DB[k]));

type Filters = { region?: string; category?: string };

// utils locais
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(",", ".").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
const inBounds = (lat: number, lng: number) =>
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
const eTime = (d?: string | null) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);

const STORAGE_KEY = "@ote:selectedRegion";

export default function Home() {
  const { user, isHydrated } = useAuth();
  const isLoggedIn = !!user;
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const [langHeaderVisible, setLangHeaderVisible] = useState(true);
  const firstName = useMemo(() => (user?.name || "").trim().split(" ")[0], [user?.name]);

  const [listScrollEnabled, setListScrollEnabled] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);
  const [mapRect, setMapRect] = useState<{ x: number; y: number; width: number; height: number }>(
    { x: 0, y: 0, width: SCREEN_WIDTH, height: 0 },
  );

  // dados
  const [eventsForYou, setEventsForYou] = useState<ApiEvent[]>([]);
  const [eventsMusicDated, setEventsMusicDated] = useState<ApiEvent[]>([]);
  const [eventsNonMusicDated, setEventsNonMusicDated] = useState<ApiEvent[]>([]);
  const [eventsFixed, setEventsFixed] = useState<ApiEvent[]>([]);
  const [mapData, setMapData] = useState<EventMapItem[]>([]);

  // filtros
  const [filters, setFilters] = useState<Filters>({});
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regionReady, setRegionReady] = useState(false); // ✅ só busca após hidratar região

  const { banners, loading: loadingBanners } = useBanners();

  const prefsKey = useMemo(() => {
    if (!user?.preferencesSet || !Array.isArray(user?.preferences)) return "";
    return [...user.preferences].sort().join("|");
  }, [user?.preferencesSet, user?.preferences]);

  const loadingRef = useRef(false);

  const onMapContainerLayout = (e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setMapRect({ x, y, width, height });
  };

  // ✅ hidrata região persistida antes da 1ª busca
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (typeof saved === "string") {
          setFilters((prev) => ((prev.region ?? "") === saved ? prev : { ...prev, region: saved }));
        }
      } finally {
        setRegionReady(true);
      }
    })();
  }, []);

  // busca eventos; só roda quando auth + região estiverem prontos
  useEffect(() => {
    if (!isHydrated || !regionReady || loadingRef.current) return;
    loadingRef.current = true;

    setEventsLoading(true);
    setError(null);
    setEventsForYou([]);
    setEventsMusicDated([]);
    setEventsNonMusicDated([]);
    setEventsFixed([]);
    setMapData([]);

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

        normalized.sort((a, b) => eTime(a.startDate) - eTime(b.startDate));
        const approved = normalized.filter((e) => e.aprovado === true);

        // filtro por região
        const region = (filters.region ?? "").trim();
        let approvedFiltered =
          region === "" ? approved : approved.filter((e) => mapCityToRegion(e.address ?? "") === region);

        // filtro por categoria (usa VALOR do DB)
        const category = (filters.category ?? "").trim();
        if (category) {
          approvedFiltered = approvedFiltered.filter((e) => (e.categories ?? []).includes(category));
        }

        const fixed = approvedFiltered.filter((e) => !e.startDate && !e.endDate);
        const dated = approvedFiltered.filter((e) => e.startDate || e.endDate);

        // ✅ “Música” = somente categorias musicais (VALORES do DB)
        const musicDated = dated.filter((e) =>
          (e.categories ?? []).some((c) => MUSIC_CATEGORIES_SET.has(c)),
        );

        // ✅ “Mais Eventos” = todos os outros (não-musicais)
        const nonMusicDated = dated.filter(
          (e) => !(e.categories ?? []).some((c) => MUSIC_CATEGORIES_SET.has(c)),
        );

        let forYou: ApiEvent[] = [];
        if (prefsKey) {
          const prefs = prefsKey.split("|");
          forYou = dated.filter((evento) => (evento.categories ?? []).some((c) => prefs.includes(c)));
        }

        const mapItems: EventMapItem[] = approvedFiltered
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
      } catch (err: any) {
        console.error("Erro ao carregar eventos:", err);
        if (!cancelled) setError(err?.message ?? "Erro inesperado");
      } finally {
        loadingRef.current = false;
        if (!cancelled) setEventsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, regionReady, prefsKey, filters.region, filters.category]);

  const onLoginPress = () => {
    Alert.alert(t("header_login_required"), t("login_desc"));
  };

  const greeting = isLoggedIn
    ? (t("greeting_named") || "Olá, {name}!").replace("{name}", firstName || t("greeting_guest"))
    : t("greeting_guest");

  const userPrefs = useMemo(
    () =>
      user?.preferencesSet && Array.isArray(user?.preferences) && user.preferences.length > 0
        ? user.preferences
        : null,
    [user?.preferencesSet, user?.preferences],
  );

  // =========================
  // ✅ EVITAR REPETIÇÃO ENTRE SEÇÕES
  // =========================
  const forYouIds = useMemo(() => new Set(eventsForYou.map((e) => String(e.id))), [eventsForYou]); // ✅
  const fixedIds = useMemo(() => eventsFixed.map((e) => e.id), [eventsFixed]);

  // arrays finais para render (excluem os que já foram mostrados em "Para você")
  const musicDatedRender = useMemo(
    () => eventsMusicDated.filter((e) => !forYouIds.has(String(e.id))), // ✅
    [eventsMusicDated, forYouIds],
  );
  const nonMusicDatedRender = useMemo(
    () => eventsNonMusicDated.filter((e) => !forYouIds.has(String(e.id))), // ✅
    [eventsNonMusicDated, forYouIds],
  );
  const fixedRender = useMemo(
    () => eventsFixed.filter((e) => !forYouIds.has(String(e.id))), // ✅
    [eventsFixed, forYouIds],
  );

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setLangHeaderVisible(y <= 0);
  };

  // aplica região (FilterBarRN)
  const handleApply = (q: Record<string, string>) => {
    setFilters((prev) => ({ ...prev, region: q.region ?? "" }));
  };

  // aplica categoria (se usar chips) — espera o VALOR de DB (ex.: "Carnaval")
  const handleCategory = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: prev.category === cat ? "" : cat }));
  };

  // ========= ICONES “CLÁSSICOS” PARA QUICK SEARCH =========
  const resolveIcon = (imageUrl?: string) => {
    const ICONS: Record<string, any> = {
      "/musica(1).png": require("../assets/icons/musica(1).png"),
      "/show.png": require("../assets/icons/show.png"),
      "/ano-novo.png": require("../assets/icons/ano-novo.png"),
      "/boate.png": require("../assets/icons/boate.png"),
      "/parque-tematico.png": require("../assets/icons/parque-tematico.png"),
      "/bar.png": require("../assets/icons/bar.png"),
      "/restaurante.png": require("../assets/icons/restaurante.png"),
      "/religion.png": require("../assets/icons/religion.png"),
      "/claquete.png": require("../assets/icons/claquete.png"),
      "/teatro.png": require("../assets/icons/teatro.png"),
      "/contorno-de-microfone-condensador-profissional.png":
        require("../assets/icons/contorno-de-microfone-condensador-profissional.png"),
      "/trabalho-em-equipe.png": require("../assets/icons/trabalho-em-equipe.png"),
      "/esporte.png": require("../assets/icons/esporte.png"),
      "/chefe-de-cozinha.png": require("../assets/icons/chefe-de-cozinha.png"),
      "/barraca-de-comida.png": require("../assets/icons/barraca-de-comida.png"),
      "/seminario.png": require("../assets/icons/seminario.png"),
      "/simposio.png": require("../assets/icons/simposio.png"),
      "/planeta-terra.png": require("../assets/icons/planeta-terra.png"),
      "/agricultura.png": require("../assets/icons/agricultura.png"),
    };
    const DEFAULT_ICON = ICONS["/show.png"];
    if (!imageUrl) return DEFAULT_ICON;
    const local = ICONS[imageUrl];
    if (local) return local;
    if (imageUrl.startsWith?.("http")) return { uri: imageUrl };
    return DEFAULT_ICON;
  };
  // ========================================================

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <FlatList
        data={[{ key: "header" }]}
        scrollEnabled={listScrollEnabled}
        renderItem={() => null}
        keyExtractor={(item) => (typeof item === "string" ? item : item.key)}
        style={{ backgroundColor: "#f2f2f2" }}
        contentContainerStyle={{ backgroundColor: "#f2f2f2" }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View style={styles.container}>
            {/* topo: idiomas */}
            <LanguageHeaderRN
              lang={lang as Lang}
              onChange={(next) => setLang(next)}
              visible={langHeaderVisible}
            />

            <Header />

            <View style={styles.padding}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.subtitle}>{t("ask_today")}</Text>

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
                <Text style={styles.quickSearchTitle}>{t("quick_title")}</Text>
                <TouchableOpacity
                  style={styles.seeAllRow}
                  onPress={() => router.push("/colecoes" as any)}
                >
                  <Text style={styles.seeAll}>{t("quick_view_all")}</Text>
                  <Feather name="chevron-right" size={16} color="#f97316" />
                </TouchableOpacity>
              </View>

              <View style={styles.quickSearchContainerRow}>
                <FlatList
                  data={quickSearchOptions}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.key}
                  renderItem={({ item }) => {
                    const label = t(item.key) || item.title;
                    const serviceValue = getServiceFromKey(item.key, item.value);
                    return (
                      <TouchableOpacity
                        style={styles.quickOption}
                        onPress={() =>
                          router.push(
                            `/barbershops?service=${encodeURIComponent(serviceValue)}` as any,
                          )
                        }
                      >
                        <Image source={resolveIcon(item.imageUrl)} style={styles.quickImage} />
                        <Text style={styles.quickText}>{label}</Text>
                      </TouchableOpacity>
                    );
                  }}
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
                    adText={t("ad_here")}
                  />
                </View>
              )}

              {/* Filtro em cards (regiões) — sempre visível */}
              <View style={{ marginTop: 16 }}>
                <FilterBarRN selectedRegion={filters.region ?? ""} onApply={handleApply} />
              </View>

              {/* Loading x Conteúdo */}
              {eventsLoading ? (
                <View style={{ marginTop: 24, alignItems: "center", justifyContent: "center" }}>
                  <ActivityIndicator size="small" color="#f97316" />
                  <Text style={{ marginTop: 8, color: "#64748b" }}>{t("loading")}</Text>
                </View>
              ) : (
                <>
                  {/* Para você */}
                  {eventsForYou.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View className="row" style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t("events_for_you")}</Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() => router.push("/paraVoce")}
                        >
                          <Text style={styles.seeAll}>{t("quick_view_all")}</Text>
                          <Feather name="chevron-right" size={16} color="#f97316" />
                        </TouchableOpacity>
                      </View>

                      <EventosGrid
                        barbershops={eventsForYou.map((e) => ({
                          ...e,
                          imageUrl: e.imageUrl ?? "",
                        }))}
                        isLoggedIn={isLoggedIn}
                        onLoginPress={onLoginPress}
                      />
                    </View>
                  )}

                  {/* Música (exclui Para você) */}
                  {musicDatedRender.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t("music_events")}</Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() => router.push("/allMusic" as any)}
                        >
                          <Text style={styles.seeAll}>{t("quick_view_all")}</Text>
                          <Feather name="chevron-right" size={16} color="#f97316" />
                        </TouchableOpacity>
                      </View>

                      <MusicEventsCarousel
                        barbershops={musicDatedRender.map((e) => ({
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

                  {/* Mais Eventos (exclui Para você) */}
                  {nonMusicDatedRender.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t("more_events")}</Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() => router.push("/maisVisitados" as any)}
                        >
                          <Text style={styles.seeAll}>{t("quick_view_all")}</Text>
                          <Feather name="chevron-right" size={16} color="#f97316" />
                        </TouchableOpacity>
                      </View>

                      <BarbershopCarousel
                        barbershops={nonMusicDatedRender.map((e) => ({
                          ...e,
                          imageUrl: e.imageUrl ?? "",
                        }))}
                        isLoggedIn={isLoggedIn}
                        onLoginPress={onLoginPress}
                        excludeIds={fixedIds}
                      />
                    </View>
                  )}

                  {/* Eventos do dia a dia (exclui Para você) */}
                  {fixedRender.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        {/* ✅ título ajustado */}
                        <Text style={styles.sectionTitle}>
                          {t("day_events") || "Eventos do dia a dia"}
                        </Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() => router.push("/allnoDate" as any)} // mantém rota atual
                        >
                          <Text style={styles.seeAll}>{t("quick_view_all")}</Text>
                          <Feather name="chevron-right" size={16} color="#f97316" />
                        </TouchableOpacity>
                      </View>

                      <EventFixCarousel
                        title={undefined}
                        events={fixedRender.map((e) => ({
                          ...e,
                          imageUrl: e.imageUrl ?? "",
                          categories: Array.isArray(e.categories) ? e.categories : [],
                        }))}
                        isLoggedIn={isLoggedIn}
                        onLoginPress={onLoginPress}
                      />
                    </View>
                  )}

                  {/* Mapa */}
                  <View style={{ marginTop: 24 }}>
                    <Text style={styles.sectionTitle}>{t("events_map")}</Text>
                    <View onLayout={onMapContainerLayout} style={{ marginTop: 12 }}>
                      <MapRJ
                        events={mapData}
                        onPressItem={(id) => router.push(`/barbershop/${id}`)}
                        isInteractive={mapInteractive}
                        onInteractionChange={(enabled) => {
                          setMapInteractive(enabled);
                          setListScrollEnabled(!enabled);
                        }}
                        loading={eventsLoading}
                        emptyMessage={t("no_events")}
                        fitOnDataChange
                        regionSelected={filters.region ?? ""}
                      />
                    </View>
                  </View>

                  {/* Calendário */}
                  <View style={{ marginTop: 24 }}>
                    <Text style={styles.sectionTitle}>{t("events_calendar")}</Text>
                    <View style={{ marginTop: 16 }}>
                      <Calendar region={filters.region ?? ""} />
                    </View>
                  </View>
                </>
              )}

              {!!error && !eventsLoading && (
                <Text style={styles.inlineError}>
                  {(t("error_prefix") ?? "Erro:")} {error}
                </Text>
              )}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  padding: { padding: 16 },

  greeting: { fontSize: 20, fontWeight: "bold", color: "#0F172A" },
  subtitle: { fontSize: 16, marginTop: 4, color: "#334155" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },

  inlineInfo: { marginTop: 8, color: "#64748b" },
  inlineError: { marginTop: 8, color: "#dc2626" },

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

  abs: { position: "absolute", backgroundColor: "transparent", zIndex: 10 },
});
