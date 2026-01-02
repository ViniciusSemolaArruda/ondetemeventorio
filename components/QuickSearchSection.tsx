// components/QuickSearchSection.tsx
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getServiceFromKey,
  KEY_TO_DB,
  type KeyI18n,
} from "@/constants/search";
import { useI18n } from "@/context/I18nContext";

/* ===========================
   Tipos
=========================== */
type Option = {
  imageUrl: string;
  key?: KeyI18n;
  title?: string;
  value?: string;
  service?: string;
};

type Props = {
  options: Option[];
  title?: string;
  seeAllLabel?: string;
  selectedService?: string;        // slug atual (ex.: "samba")
  centerSelectedOnMount?: boolean; // centralizar no mount quando selectedService vier
  onPressSeeAll?: () => void;
};

const { width: SCREEN_W } = Dimensions.get("window");
const QUICK_ITEM_W = 132; // largura "constante" do item

/* ===========================
   ÍCONES LOCAIS
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

  // ✅ novos
  "/alfabeto.png": require("../assets/icons/alfabeto.png"),
  "/pata.png": require("../assets/icons/pata.png"),

  "/esporte.png": require("../assets/icons/esporte.png"),

  "/barraca-de-comida.png": require("../assets/icons/barraca-de-comida.png"),
  "/ancora.png": require("../assets/icons/ancora.png"),
  "/seminario.png": require("../assets/icons/seminario.png"),
  "/simposio.png": require("../assets/icons/simposio.png"),

  "/planeta-terra.png": require("../assets/icons/planeta-terra.png"),
  "/agricultura.png": require("../assets/icons/agricultura.png"),
  
  "/hotel.png": require("../assets/icons/hotel.png"),
};



const resolveIcon = (u: string): ImageSourcePropType => {
  const local = ICONS[u];
  if (local) return local;
  if (u?.startsWith?.("http")) return { uri: u };
  return ICONS["/show.png"];
};

/* ===========================
   Utils
=========================== */
function toDbSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* ===========================
   Item
=========================== */
type ItemProps = {
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;
};
const QuickCard = memo(function QuickCard({ label, icon, onPress }: ItemProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.cardText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
});

/* ===========================
   Componente principal
=========================== */
export default function QuickSearchSection({
  options,
  title,
  seeAllLabel,
  selectedService,
  centerSelectedOnMount,
  onPressSeeAll,
}: Props) {
  const router = useRouter();
  const { t } = useI18n();

  const listRef = useRef<FlatList>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [contentW, setContentW] = useState(0);

  const canScrollLeft = offsetX > 10;
  const canScrollRight = contentW - offsetX - SCREEN_W > 10;

  const data = useMemo(() => options, [options]);

  const keyExtractor = useCallback((item: Option) => {
    return item.key ?? item.value ?? item.service ?? (item.title ?? Math.random().toString(36));
  }, []);

  const getItemLayout = useCallback((_: any, index: number) => {
    return { length: QUICK_ITEM_W, offset: QUICK_ITEM_W * index, index };
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffsetX(e.nativeEvent.contentOffset.x);
  }, []);

  const onContentSizeChange = useCallback((w: number) => setContentW(w), []);

  /* ==== Centralizar um índice ==== */
  const centerItem = useCallback((index: number, animated = true) => {
    const halfItem = QUICK_ITEM_W / 2;
    const target = index * QUICK_ITEM_W + halfItem - SCREEN_W / 2;
    const maxOffset = Math.max(0, contentW - SCREEN_W);
    const clamped = Math.max(0, Math.min(target, maxOffset));
    listRef.current?.scrollToOffset({ offset: clamped, animated });
  }, [contentW]);

  /* ==== Centralizar no mount com base no selectedService ==== */
  useEffect(() => {
    if (!centerSelectedOnMount || !selectedService || !options?.length) return;

    // encontra o índice cujo "service" resolve para o slug igual ao selectedService
    const index = options.findIndex((opt) => {
      const resolved = opt.key
        ? getServiceFromKey(opt.key, opt.value)
        : (opt.value ?? opt.service ?? opt.title) ?? "";
      const slug = toDbSlug(String(resolved));
      return slug === selectedService;
    });

    if (index >= 0) {
      // sem animação pra evitar "piscar" no carregamento
      centerItem(index, false);
    }
  }, [centerSelectedOnMount, selectedService, options, centerItem]);

  /* ==== Snap após fim da rolagem ==== */
  const onMomentumScrollEnd = useCallback(() => {
    // índice cujo centro está mais próximo do centro da tela
    const center = offsetX + SCREEN_W / 2;
    const index = Math.round((center - QUICK_ITEM_W / 2) / QUICK_ITEM_W);
    if (index >= 0) centerItem(index);
  }, [centerItem, offsetX]);

  /* ==== Setas ==== */
  const scrollBy = useCallback((delta: number) => {
    // move e depois faz snap pro item mais próximo
    const target = Math.max(0, offsetX + delta);
    listRef.current?.scrollToOffset({ offset: target, animated: true });
    setTimeout(() => {
      const center = target + SCREEN_W / 2;
      const index = Math.round((center - QUICK_ITEM_W / 2) / QUICK_ITEM_W);
      if (index >= 0) centerItem(index);
    }, 120);
  }, [centerItem, offsetX]);

  /* ==== Navegar + centralizar tocado ==== */
  const handlePress = useCallback(
    (opt: Option, index: number) => {
      // 1) centraliza o card tocado
      centerItem(index);

      // 2) resolve o service (slug) e navega
      let resolved: string | undefined;
      if (opt.key) {
        resolved = getServiceFromKey(opt.key, opt.value);
      } else {
        resolved = (opt.value ?? opt.service ?? opt.title)?.toString();
      }
      if (!resolved) return;

      const service = toDbSlug(resolved);

      // pequeno delay para perceber o centrado (opcional)
      setTimeout(() => {
        router.push({ pathname: "/barbershops", params: { service } } as any);
      }, 120);
    },
    [centerItem, router]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Option; index: number }) => {
      const label =
        (item.key ? t(item.key as any) : undefined) || item.title || (item.key ? KEY_TO_DB[item.key] : "");
      const icon = resolveIcon(item.imageUrl);
      return <QuickCard label={label} icon={icon} onPress={() => handlePress(item, index)} />;
    },
    [handlePress, t]
  );

  return (
    <View style={{ marginTop: 24 }}>
      {/* Header: título + Ver todas */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title ?? "Busca Rápida"}</Text>

        <TouchableOpacity
          style={styles.seeAllRow}
          onPress={onPressSeeAll ?? (() => router.push("/colecoes" as any))}
        >
          <Text style={styles.seeAll}>{seeAllLabel ?? "Ver todas"}</Text>
          <ChevronRight size={16} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Carrossel */}
      <View style={{ position: "relative" }}>
        <FlatList
          ref={listRef}
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={3}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          onScroll={onScroll}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          contentContainerStyle={{ paddingRight: 16 }}
        />

        {/* Setas */}
        {canScrollLeft && (
          <TouchableOpacity
            style={[styles.navBtn, { left: 2 }]}
            onPress={() => scrollBy(-QUICK_ITEM_W * 2)}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#f97316" />
          </TouchableOpacity>
        )}

        {canScrollRight && (
          <TouchableOpacity
            style={[styles.navBtn, { right: 2 }]}
            onPress={() => scrollBy(QUICK_ITEM_W * 2)}
            activeOpacity={0.8}
          >
            <ChevronRight size={22} color="#f97316" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ===========================
   Styles
=========================== */
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAll: {
    fontSize: 14,
    color: "#f97316",
    fontWeight: "500",
  },

  card: {
    width: QUICK_ITEM_W, // largura fixa ajuda no cálculo de centralização
    minWidth: QUICK_ITEM_W,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },

  navBtn: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -18 }],
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
});
