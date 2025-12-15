// app/home.tsx
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

// usa i18n keys e resolve para o valor do DB
import {
  getServiceFromKey,
  KEY_TO_DB,
  quickSearchOptions,
  type KeyI18n,
} from "@/constants/search";

import MapTeaserCard from "@/components/MapTeaserCard";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  // novas
  "cat_kids",
  "cat_pets",
  "cat_charme",
];

// Conjunto com os VALORES do DB para todas as categorias (reserva / debug)
const ALL_CATEGORIES_SET = new Set<string>(
  ALL_CAT_KEYS.map((k) => KEY_TO_DB[k]),
);

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
  "cat_sertanejo",
  "cat_charme",
];

// Conjunto com os VALORES do DB para as categorias de música
const MUSIC_CATEGORIES_SET = new Set<string>(
  MUSIC_KEYS.map((k) => KEY_TO_DB[k]),
);

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

const eTime = (d?: string | null) =>
  d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER;

const STORAGE_KEY = "@ote:selectedRegion";

export default function Home() {
  const { user, isHydrated } = useAuth();
  const isLoggedIn = !!user;
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const [langHeaderVisible, setLangHeaderVisible] = useState(true);
  const firstName = useMemo(
    () => (user?.name || "").trim().split(" ")[0],
    [user?.name],
  );

  // Scroll x Mapa (já existia, mantido)
  const [listScrollEnabled, setListScrollEnabled] = useState(true);
  const [mapInteractive, setMapInteractive] = useState(false);

  // dados
  const [eventsForYou, setEventsForYou] = useState<ApiEvent[]>([]);
  const [eventsMusicDated, setEventsMusicDated] = useState<ApiEvent[]>([]);
  const [eventsNonMusicDated, setEventsNonMusicDated] = useState<ApiEvent[]>(
    [],
  );
  const [eventsFixed, setEventsFixed] = useState<ApiEvent[]>([]);
  const [mapData, setMapData] = useState<EventMapItem[]>([]);

  // filtros (region + category)
  const [filters, setFilters] = useState<Filters>({
    region: "",
    category: "",
  });
  const [eventsLoading, setEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regionReady, setRegionReady] = useState(false); // só busca após hidratar região

  const { banners, loading: loadingBanners } = useBanners();

  const prefsKey = useMemo(() => {
    if (!user?.preferencesSet || !Array.isArray(user?.preferences)) return "";
    return [...user.preferences].sort().join("|");
  }, [user?.preferencesSet, user?.preferences]);

  const loadingRef = useRef(false);

  // hidrata região persistida antes da 1ª busca
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (typeof saved === "string") {
          setFilters((prev) =>
            (prev.region ?? "") === saved
              ? prev
              : { ...prev, region: saved, category: "" },
          );
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
        const region = (filters.region ?? "").trim();

        // ✅ MESMA LÓGICA DO MAPRJ: API já vem filtrada por região
        const data: ApiEvent[] = await apiHelpers.events(
          region ? { region } : {},
        );

        const normalized: ApiEvent[] = data.map((e) => ({
          ...e,
          likesCount: typeof e.likesCount === "number" ? e.likesCount : 0,
          likedByUser:
            typeof e.likedByUser === "boolean" ? e.likedByUser : false,
          categories: Array.isArray(e.categories) ? e.categories : [],
        }));

        normalized.sort((a, b) => eTime(a.startDate) - eTime(b.startDate));
        const approved = normalized.filter((e) => e.aprovado === true);

        console.log("====== DEBUG HOME RN ======");
        console.log("Região param enviada à API:", JSON.stringify(region));
        console.log("Total aprovados (já filtrados pela API):", approved.length);

        // filtro por categoria (valor de DB)
        const category = (filters.category ?? "").trim();
        let approvedFiltered = approved;

        if (category) {
          approvedFiltered = approvedFiltered.filter((e) =>
            (e.categories ?? []).includes(category),
          );
          console.log(
            "Após filtro de categoria",
            category,
            "→",
            approvedFiltered.length,
            "eventos",
          );
        }

        const fixed = approvedFiltered.filter(
          (e) => !e.startDate && !e.endDate,
        );
        const dated = approvedFiltered.filter(
          (e) => e.startDate || e.endDate,
        );

        console.log(
          "Split fixed:",
          fixed.length,
          "| dated:",
          dated.length,
        );

        // Música = somente categorias musicais (VALORES do DB)
        const musicDated = dated.filter((e) =>
          (e.categories ?? []).some((c) =>
            MUSIC_CATEGORIES_SET.has(c),
          ),
        );

        // Mais eventos = todos os outros (não musicais)
        const nonMusicDated = dated.filter(
          (e) =>
            !(e.categories ?? []).some((c) =>
              MUSIC_CATEGORIES_SET.has(c),
            ),
        );

        console.log(
          "musicDated:",
          musicDated.length,
          "| nonMusicDated:",
          nonMusicDated.length,
        );

        let forYou: ApiEvent[] = [];
        if (prefsKey) {
          const prefs = prefsKey.split("|");
          forYou = dated.filter((evento) =>
            (evento.categories ?? []).some((c) =>
              prefs.includes(c),
            ),
          );
        }
        console.log("Eventos para você:", forYou.length);

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

        console.log("Eventos no mapa (após filtro):", mapItems.length);

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
    ? (t("greeting_named") || "Olá, {name}!").replace(
        "{name}",
        firstName || t("greeting_guest"),
      )
    : t("greeting_guest");

  const userPrefs = useMemo(
    () =>
      user?.preferencesSet &&
      Array.isArray(user?.preferences) &&
      user.preferences.length > 0
        ? user.preferences
        : null,
    [user?.preferencesSet, user?.preferences],
  );

  // evitar repetição entre seções
  const forYouIds = useMemo(
    () => new Set(eventsForYou.map((e) => String(e.id))),
    [eventsForYou],
  );
  const fixedIds = useMemo(
    () => eventsFixed.map((e) => e.id),
    [eventsFixed],
  );

  const musicDatedRender = useMemo(
    () =>
      eventsMusicDated.filter((e) => !forYouIds.has(String(e.id))),
    [eventsMusicDated, forYouIds],
  );
  const nonMusicDatedRender = useMemo(
    () =>
      eventsNonMusicDated.filter((e) => !forYouIds.has(String(e.id))),
    [eventsNonMusicDated, forYouIds],
  );
  const fixedRender = useMemo(
    () => eventsFixed.filter((e) => !forYouIds.has(String(e.id))),
    [eventsFixed, forYouIds],
  );

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setLangHeaderVisible(y <= 0);
  };

  // aplica região (FilterBarRN) — zera categoria junto
  const handleApply = (q: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      region: q.region ?? "",
      category: "", // troca de região limpa categoria
    }));
  };

  // aplica categoria (espera VALOR do DB, ex.: "Carnaval")
  const handleCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === cat ? "" : cat,
    }));
  };

  // ========= ICONES “CLÁSSICOS” PARA QUICK SEARCH =========
  const resolveIcon = (imageUrl?: string) => {
    const ICONS: Record<string, any> = {
      "/musica(1).png": require("../assets/icons/musica(1).png"),

      "/show.png": require("../assets/icons/show.png"),
      "/ano-novo.png": require("../assets/icons/ano-novo.png"),
      "/boate.png": require("../assets/icons/boate.png"),

      "/parque-tematico.png":
        require("../assets/icons/parque-tematico.png"),
      "/bar.png": require("../assets/icons/bar.png"),

      "/chefe-de-cozinha.png":
        require("../assets/icons/chefe-de-cozinha.png"),
      "/restaurante.png":
        require("../assets/icons/restaurante.png"),

      "/religion.png": require("../assets/icons/religion.png"),
      "/claquete.png": require("../assets/icons/claquete.png"),
      "/teatro.png": require("../assets/icons/teatro.png"),

      "/contorno-de-microfone-condensador-profissional.png":
        require("../assets/icons/contorno-de-microfone-condensador-profissional.png"),

      "/trabalho-em-equipe.png":
        require("../assets/icons/trabalho-em-equipe.png"),
      "/esporte.png": require("../assets/icons/esporte.png"),

      "/barraca-de-comida.png":
        require("../assets/icons/barraca-de-comida.png"),
      "/ancora.png": require("../assets/icons/ancora.png"),
      "/seminario.png": require("../assets/icons/seminario.png"),
      "/simposio.png": require("../assets/icons/simposio.png"),

      "/planeta-terra.png":
        require("../assets/icons/planeta-terra.png"),
      "/agricultura.png":
        require("../assets/icons/agricultura.png"),

      // novos ícones
      "/alfabeto.png": require("../assets/icons/alfabeto.png"),
      "/pata.png": require("../assets/icons/pata.png"),
    };

    const DEFAULT_ICON = ICONS["/show.png"];
    if (!imageUrl) return DEFAULT_ICON;
    const local = ICONS[imageUrl];
    if (local) return local;
    if (imageUrl.startsWith?.("http")) return { uri: imageUrl };
    return DEFAULT_ICON;
  };
  // ========================================================

  // ========= Eventos externos para o Calendar (evita fetch interno) =========
  type RawEvent = {
    id: string;
    name: string;
    address: string;
    startDate: string;
    endDate: string;
  };
  const externalEvents: RawEvent[] = useMemo(() => {
    const datedAll = [...eventsMusicDated, ...eventsNonMusicDated];
    return datedAll
      .map((e) => {
        const start = e.startDate || e.endDate;
        const end = e.endDate || e.startDate;
        if (!start || !end) return null;
        return {
          id: String(e.id),
          name: e.name || "",
          address: e.address || "",
          startDate: String(start),
          endDate: String(end),
        };
      })
      .filter(Boolean) as RawEvent[];
  }, [eventsMusicDated, eventsNonMusicDated]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <FlatList
        data={[{ key: "header" }]}
        scrollEnabled={listScrollEnabled}
        renderItem={() => null}
        keyExtractor={(item) =>
          typeof item === "string" ? item : item.key
        }
        style={{ backgroundColor: "#f2f2f2" }}
        contentContainerStyle={{ backgroundColor: "#f2f2f2" }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // perf
        removeClippedSubviews
        windowSize={5}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        updateCellsBatchingPeriod={50}
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
                      router.push(
                        `/barbershops?title=${encodeURIComponent(
                          title.trim(),
                        )}`,
                      );
                    }
                  }}
                />
              </View>

              {/* Busca Rápida */}
              <View style={styles.quickSearchHeader}>
                <Text style={styles.quickSearchTitle}>
                  {t("quick_title")}
                </Text>
                <TouchableOpacity
                  style={styles.seeAllRow}
                  onPress={() => router.push("/colecoes" as any)}
                >
                  <Text style={styles.seeAll}>
                    {t("quick_view_all")}
                  </Text>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color="#f97316"
                  />
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
                    const serviceValue = getServiceFromKey(
                      item.key,
                      item.value,
                    );
                    return (
                      <TouchableOpacity
                        style={styles.quickOption}
                        onPress={() =>
                          router.push(
                            `/barbershops?service=${encodeURIComponent(
                              serviceValue,
                            )}` as any,
                          )
                        }
                      >
                        <Image
                          source={resolveIcon(item.imageUrl)}
                          style={styles.quickImage}
                        />
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
                  />
                </View>
              )}

              {/* Filtro em cards (regiões) */}
              <View style={{ marginTop: 16 }}>
                <FilterBarRN
                  selectedRegion={filters.region ?? ""}
                  onApply={handleApply}
                />
              </View>

              {/* Loading x Conteúdo */}
              {eventsLoading ? (
                <View
                  style={{
                    marginTop: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color="#f97316"
                  />
                  <Text style={{ marginTop: 8, color: "#64748b" }}>
                    {t("loading")}
                  </Text>
                </View>
              ) : (
                <>
                  {/* Para você */}
                  {eventsForYou.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                          {t("events_for_you")}
                        </Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() => router.push("/paraVoce")}
                        >
                          <Text style={styles.seeAll}>
                            {t("quick_view_all")}
                          </Text>
                          <Feather
                            name="chevron-right"
                            size={16}
                            color="#f97316"
                          />
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

                  {/* Música */}
                  {musicDatedRender.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                          {t("music_events")}
                        </Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() =>
                            router.push("/allMusic" as any)
                          }
                        >
                          <Text style={styles.seeAll}>
                            {t("quick_view_all")}
                          </Text>
                          <Feather
                            name="chevron-right"
                            size={16}
                            color="#f97316"
                          />
                        </TouchableOpacity>
                      </View>

                      <MusicEventsCarousel
                        barbershops={musicDatedRender.map((e) => ({
                          ...e,
                          imageUrl: e.imageUrl ?? "",
                          categories: Array.isArray(e.categories)
                            ? e.categories
                            : [],
                        }))}
                        isLoggedIn={isLoggedIn}
                        onLoginPress={onLoginPress}
                        userPrefs={userPrefs}
                      />
                    </View>
                  )}

                  {/* Mais Eventos */}
                  {nonMusicDatedRender.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                          {t("more_events")}
                        </Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() =>
                            router.push("/maisVisitados" as any)
                          }
                        >
                          <Text style={styles.seeAll}>
                            {t("quick_view_all")}
                          </Text>
                          <Feather
                            name="chevron-right"
                            size={16}
                            color="#f97316"
                          />
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

                  {/* Eventos do dia a dia */}
                  {fixedRender.length > 0 && (
                    <View style={{ marginTop: 24 }}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                          {t("day_events") || "Eventos do dia a dia"}
                        </Text>
                        <TouchableOpacity
                          style={styles.seeAllRow}
                          onPress={() =>
                            router.push("/allnoDate" as any)
                          }
                        >
                          <Text style={styles.seeAll}>
                            {t("quick_view_all")}
                          </Text>
                          <Feather
                            name="chevron-right"
                            size={16}
                            color="#f97316"
                          />
                        </TouchableOpacity>
                      </View>

                      <EventFixCarousel
                        title={undefined}
                        events={fixedRender.map((e) => ({
                          ...e,
                          imageUrl: e.imageUrl ?? "",
                          categories: Array.isArray(e.categories)
                            ? e.categories
                            : [],
                        }))}
                        isLoggedIn={isLoggedIn}
                        onLoginPress={onLoginPress}
                      />
                    </View>
                  )}

                  {/* Mapa (full-bleed) */}
                  <View
                    style={{
                      marginTop: 24,
                      marginHorizontal: -16,
                    }}
                  >
                    <MapTeaserCard
                      title={
                        t("view_map_title") || "Ver mapa de eventos"
                      }
                      subtitle={
                        t("view_map_sub") ||
                        "Descubra eventos por região e bairro"
                      }
                      onPress={() =>
                        router.push(
                          `/MapRJ?region=${encodeURIComponent(
                            filters.region ?? "",
                          )}`,
                        )
                      }
                      height={100}
                    />
                  </View>

                  {/* Calendário */}
                  <View style={{ marginTop: 24 }}>
                    <Text style={styles.sectionTitle}>
                      {t("events_calendar")}
                    </Text>
                    <View style={{ marginTop: 16 }}>
                      <Calendar
                        region={filters.region ?? ""}
                        externalEvents={externalEvents}
                      />
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
  seeAll: { fontSize: 14, color: "#f97316", marginRight: 6 },
  seeAllRow: { flexDirection: "row", alignItems: "center" },

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
  quickImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
    resizeMode: "contain",
  },
  quickText: { fontSize: 14, color: "#444", textAlign: "center" },
});
