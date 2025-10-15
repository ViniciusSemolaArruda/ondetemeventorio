// app/colecoes/index.tsx
import Footer from "@/components/footer";
import Header2 from "@/components/Header2";
import {
  labelFor,
  quickSearchOptions,
  serviceFor,
  type QuickSearchOption,
} from "@/constants/search2"; // ✅ usa o search2.ts correto
import { useI18n } from "@/context/I18nContext";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 8;
const SCREEN_WIDTH = Dimensions.get("window").width;
const AVAILABLE_WIDTH = SCREEN_WIDTH - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1);
const ITEM_SIZE = Math.floor(AVAILABLE_WIDTH / NUM_COLUMNS);

/** ======================
 *  MAPA DE IMAGENS (cards)
 *  ======================
 *  Usa os mesmos nomes que você colocou em /app/_constants/search2.ts
 *  Observações:
 *   - imageUrl vem como "/arquivo.png" → removemos a "/" e tentamos o mapa.
 *   - cobrimos o alias "chorinhi-gpt.png" → "chorinho-gpt.png".
 */
const CARD_FILES: Record<string, any> = {
  "SAPUCAI1.png": require("../../assets/icons/SAPUCAI1.png"),
  "roda-gpt.png": require("../../assets/icons/roda-gpt.png"),
  "bossa-gpt.png": require("../../assets/icons/bossa-gpt.png"),
  "passinho-gpt.png": require("../../assets/icons/passinho-gpt.png"),
  "funk-gpt.png": require("../../assets/icons/funk-gpt.png"),
  "eletronica-gpt.png": require("../../assets/icons/eletronica-gpt.png"),
  "forro-gpt.png": require("../../assets/icons/forro-gpt.png"),
  "mpb-gpt.png": require("../../assets/icons/mpb-gpt.png"),
  "rock-gpt.png": require("../../assets/icons/rock-gpt.png"),
  "blues-gpt.png": require("../../assets/icons/blues-gpt.png"),
  "jazz-gpt.png": require("../../assets/icons/jazz-gpt.png"),
  // ✅ alias correto para chorinho
  "chorinho-gpt.png": require("../../assets/icons/chorinho-gpt.png"),
  "festivais-gpt.png": require("../../assets/icons/festivais-gpt.png"),
  "festas-gpt.png": require("../../assets/icons/festas-gpt.png"),
  "boate-gpt.png": require("../../assets/icons/boate-gpt.png"),
  "parques-gpt.png": require("../../assets/icons/parques-gpt.png"),
  "bar-gpt.png": require("../../assets/icons/bar-gpt.png"),
  "restaurantes-gpt.png": require("../../assets/icons/restaurantes-gpt.png"),
  "cristo_redentor_card_size.png": require("../../assets/icons/cristo_redentor_card_size.png"),
  "cinema-gpt.png": require("../../assets/icons/cinema-gpt.png"),
  "teatro-gpt.png": require("../../assets/icons/teatro-gpt.png"),
  "standup-gpt.png": require("../../assets/icons/standup-gpt.png"),
  "familia-gpt.png": require("../../assets/icons/familia-gpt.png"),
  "esporte3-gpt.png": require("../../assets/icons/esporte3-gpt.png"),
  "gastronomia-gpt.png": require("../../assets/icons/gastronomia-gpt.png"),
  "feiras-gpt.png": require("../../assets/icons/feiras-gpt.png"),
  "seminario-gpt.png": require("../../assets/icons/seminario-gpt.png"),
  "simposio-gpt.png": require("../../assets/icons/simposio-gpt.png"),
  "ambiente-gpt.png": require("../../assets/icons/ambiente-gpt.png"),
  "agro-gpt.png": require("../../assets/icons/agro-gpt.png"),
};
// também deixo as chaves em lowercase para tolerar diferenças de caixa
const CARD_FILES_LC: Record<string, any> = Object.fromEntries(
  Object.keys(CARD_FILES).map((k) => [k.toLowerCase(), CARD_FILES[k]])
);

// fallback genérico
const FALLBACK = require("../../assets/icons/show.png");

// corrige nomes errados que possam vir no imageUrl
const NAME_ALIASES: Record<string, string> = {
  "chorinho-gpt.png": "chorinho-gpt.png",
};

function resolveImageSource(imageUrl: string): ImageSourcePropType {
  if (!imageUrl) return FALLBACK;
  // remove barras iniciais
  const raw = imageUrl.replace(/^\/+/, "");
  const alias = NAME_ALIASES[raw] ?? raw;

  // 1) tenta exact match (case-sensitive)
  if (CARD_FILES[alias]) return CARD_FILES[alias];

  // 2) tenta case-insensitive
  const lc = alias.toLowerCase();
  if (CARD_FILES_LC[lc]) return CARD_FILES_LC[lc];

  // 3) se vier http(s), usa remoto
  if (/^https?:\/\//i.test(imageUrl)) return { uri: imageUrl };

  // 4) fallback
  return FALLBACK;
}

export default function ColecoesScreen() {
  const router = useRouter();
  const { t } = useI18n();

  // 🔎 busca por NOME (igual ao web quando digita na barra) — mantido caso queira reativar
  const [searchText, setSearchText] = useState("");

  const goSearchByTitle = () => {
    const q = searchText.trim();
    if (!q) return;
    router.push(`/barbershops?title=${encodeURIComponent(q)}` as Href);
  };

  const data = useMemo<QuickSearchOption[]>(() => quickSearchOptions, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={data}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{
          paddingBottom: 32,
          rowGap: GAP,
        }}
        columnWrapperStyle={{
          columnGap: GAP,
          paddingHorizontal: H_PADDING,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Header2 />
            <View style={{ paddingHorizontal: H_PADDING, paddingTop: 16 }}>
              <Text style={styles.title}>{t("colecoes_title")}</Text>
            </View>
          </>
        }
        ListFooterComponent={<Footer />}
        renderItem={({ item }) => {
          const label = labelFor(item, t);               // traduz (fallback -> title)
          const serviceValue = serviceFor(item);         // valor exato do DB
          const source = resolveImageSource(item.imageUrl);

          return (
            <TouchableOpacity
              style={[styles.item, { width: ITEM_SIZE, height: ITEM_SIZE }]}
              activeOpacity={0.85}
              onPress={() =>
                router.push(
                  `/barbershops?service=${encodeURIComponent(serviceValue)}` as Href
                )
              }
            >
              <Image source={source} style={styles.image} resizeMode="cover" />
              <View style={styles.cardOverlay} />
              <View style={styles.textContainer}>
                <Text style={styles.text}>{label}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 16,
    color: "#111",
  },
  item: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
