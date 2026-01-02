// components/QuickSearchSectionRN.tsx
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FlatListProps } from "react-native";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getServiceFromKey,
  quickSearchOptions,
  type QuickSearchOption,
} from "@/constants/search";
import { useI18n } from "@/context/I18nContext";

const STORAGE_KEY_REGION = "@ote:selectedRegion";
const STORAGE_KEY_SELECTED = "@ote:quick_selected_key";

// layout
const ITEM_W = 132;
const ITEM_SEPARATOR = 12;
// ⚠️ H_PADDING NÃO será usado em padding da lista;
// a margem lateral vem da FlatList da tela de eventos.
const H_PADDING = 16;
const SCREEN_W = Dimensions.get("window").width;

/* ===========================
   ÍCONES
=========================== */
const ICONS: Record<string, any> = {
  "/musica(1).png": require("../assets/icons/musica(1).png"),
  "/show.png": require("../assets/icons/show.png"),
  "/ano-novo.png": require("../assets/icons/ano-novo.png"),
  "/boate.png": require("../assets/icons/boate.png"),

  "/parque-tematico.png": require("../assets/icons/parque-tematico.png"),
  "/bar.png": require("../assets/icons/bar.png"),

  "/chefe-de-cozinha.png": require("../assets/icons/chefe-de-cozinha.png"),
  "/restaurante.png": require("../assets/icons/restaurante.png"),

  "/religion.png": require("../assets/icons/religion.png"),
  "/claquete.png": require("../assets/icons/claquete.png"),
  "/teatro.png": require("../assets/icons/teatro.png"),

  "/contorno-de-microfone-condensador-profissional.png":
    require("../assets/icons/contorno-de-microfone-condensador-profissional.png"),

  "/trabalho-em-equipe.png": require("../assets/icons/trabalho-em-equipe.png"),
  "/esporte.png": require("../assets/icons/esporte.png"),

  "/barraca-de-comida.png": require("../assets/icons/barraca-de-comida.png"),
  "/ancora.png": require("../assets/icons/ancora.png"),
  "/seminario.png": require("../assets/icons/seminario.png"),
  "/simposio.png": require("../assets/icons/simposio.png"),

  "/planeta-terra.png": require("../assets/icons/planeta-terra.png"),
  "/agricultura.png": require("../assets/icons/agricultura.png"),

  // ✅ novos
  "/alfabeto.png": require("../assets/icons/alfabeto.png"),
  "/pata.png": require("../assets/icons/pata.png"),   
  
  "/hotel.png": require("../assets/icons/hotel.png"),
};


const resolveIcon = (imageUrl?: string): ImageSourcePropType => {
  if (!imageUrl) return ICONS["/show.png"];
  const local = ICONS[imageUrl];
  if (local) return local;
  if (imageUrl.startsWith?.("http")) return { uri: imageUrl };
  return ICONS["/show.png"];
};

const toSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/* ===========================
   Card
=========================== */
type CardProps = {
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;
  selected: boolean;
};

const QuickCard = memo(function QuickCard({
  label,
  icon,
  onPress,
  selected,
}: CardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={icon} style={styles.cardIcon} />
      <Text style={styles.cardText} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

/* ===========================
   Props
=========================== */
type Props = {
  onPressSeeAll?: () => void;
  showHeader?: boolean;
};

export default function QuickSearchSectionRN({
  onPressSeeAll,
  showHeader = true,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useLocalSearchParams() as { region?: string; service?: string };

  const listRef = useRef<FlatList<QuickSearchOption>>(null);
  const data = useMemo<QuickSearchOption[]>(() => quickSearchOptions, []);

  const indexByKey = useMemo(() => {
    const m = new Map<string, number>();
    data.forEach((opt, i) => m.set(opt.key, i));
    return m;
  }, [data]);

  const findKeyByService = useCallback(
    (service: string | undefined | null): string | null => {
      const s = toSlug((service || "").toString());
      if (!s) return null;
      const match = data.find(
        (opt) => toSlug(getServiceFromKey(opt.key, opt.value)) === s
      );
      return match?.key ?? null;
    },
    [data]
  );

  const initialKeyFromUrl = findKeyByService(sp?.service);
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initialKeyFromUrl
  );

  useEffect(() => {
    if (selectedKey) return;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_SELECTED);
        if (typeof saved === "string" && saved) setSelectedKey(saved);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const k = findKeyByService(sp?.service);
    if (k && k !== selectedKey) setSelectedKey(k);
  }, [sp?.service, findKeyByService, selectedKey]);

  const centerIndex = useCallback(
    (idx: number, animated = false) => {
      if (idx < 0) return;

      const startX = H_PADDING + idx * (ITEM_W + ITEM_SEPARATOR);
      const desired = startX - (SCREEN_W / 2 - ITEM_W / 2);

      const total =
        H_PADDING * 2 +
        data.length * ITEM_W +
        (data.length - 1) * ITEM_SEPARATOR;

      const maxOffset = Math.max(0, total - SCREEN_W);
      const offset = Math.max(0, Math.min(desired, maxOffset));

      listRef.current?.scrollToOffset({ offset, animated });
    },
    [data.length]
  );

  const centerByKey = useCallback(
    (key: string, animated = false) => {
      const idx = indexByKey.get(key);
      if (idx == null) return;
      centerIndex(idx, animated);
    },
    [indexByKey, centerIndex]
  );

  useEffect(() => {
    if (selectedKey) centerByKey(selectedKey, false);
  }, [selectedKey, centerByKey]);

  const handleSeeAll = useCallback(() => {
    if (onPressSeeAll) return onPressSeeAll();
    router.push("/colecoes" as any);
  }, [onPressSeeAll, router]);

  const handleQuickClick = useCallback(
    async (opt: QuickSearchOption) => {
      const serviceValue = getServiceFromKey(opt.key, opt.value);

      setSelectedKey(opt.key);
      try {
        await AsyncStorage.setItem(STORAGE_KEY_SELECTED, opt.key);
      } catch {}
      centerByKey(opt.key, true);

      const urlRegion = (sp?.region || "").toString().trim();
      let savedRegion = "";
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_REGION);
        if (typeof raw === "string" && raw.trim()) savedRegion = raw;
      } catch {}

      const regionToUse = urlRegion || savedRegion;
      const q = new URLSearchParams();
      if (serviceValue) q.set("service", serviceValue);
      if (regionToUse) q.set("region", regionToUse);

      router.push(
        q.toString()
          ? (`/barbershops?${q.toString()}` as any)
          : ("/barbershops" as any)
      );

      try {
        if (regionToUse)
          await AsyncStorage.setItem(STORAGE_KEY_REGION, regionToUse);
        else await AsyncStorage.removeItem(STORAGE_KEY_REGION);
      } catch {}
    },
    [router, sp?.region, centerByKey]
  );

  const getItemLayout: NonNullable<
    FlatListProps<QuickSearchOption>["getItemLayout"]
  > = (_data, index) => {
    const length = ITEM_W;
    const offset = H_PADDING + index * (ITEM_W + ITEM_SEPARATOR);
    return { length, offset, index };
  };

  return (
    <View style={styles.wrapper}>
      {showHeader && (
        <View style={styles.topRow}>
          <Text style={styles.title}>
            {t("quick_title") || "Busca Rápida"}
          </Text>
          <TouchableOpacity style={styles.seeAllRow} onPress={handleSeeAll}>
            <Text style={styles.seeAllText}>
              {t("quick_view_all") || "Ver todas"}
            </Text>
            <Feather name="chevron-right" size={16} color="#f97316" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        extraData={selectedKey}
        getItemLayout={getItemLayout}
        // 🔥 sem paddingHorizontal aqui – quem define é a FlatList da tela
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: ITEM_SEPARATOR }} />}
        renderItem={({ item }) => {
          const label = t(item.key) || item.title;
          const icon = resolveIcon(item.imageUrl);
          const selected = selectedKey === item.key;
          return (
            <QuickCard
              label={label}
              icon={icon}
              onPress={() => handleQuickClick(item)}
              selected={selected}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 8 },
  topRow: {
    // sem paddingHorizontal aqui: já vem da FlatList principal
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  seeAllRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAllText: { fontSize: 14, color: "#f97316", fontWeight: "600" },

  listContent: {
    paddingBottom: 2,
  },

  card: {
    width: ITEM_W,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  cardSelected: {
    borderColor: "#f97316",
    borderWidth: 2,
  },
  cardIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 8,
  },
  cardText: { fontSize: 14, color: "#374151", fontWeight: "500" },
});
