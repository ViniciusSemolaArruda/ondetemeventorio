// app/colecoes/index.tsx
import Footer from "@/components/footer";
import Header2 from "@/components/Header2";
import { quickSearchOptions2 } from "@/constants/search2";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Search as SearchIcon } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 8;
const SCREEN_WIDTH = Dimensions.get("window").width;
const AVAILABLE_WIDTH = SCREEN_WIDTH - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1);
const ITEM_SIZE = Math.floor(AVAILABLE_WIDTH / NUM_COLUMNS);

// Mapeamento de imagens
const imageMap: Record<string, any> = {
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
  "chorinhi-gpt.png": require("../../assets/icons/chorinhi-gpt.png"),
  "festivais-gpt.png": require("../../assets/icons/festivais-gpt.png"),
  "festas-gpt.png": require("../../assets/icons/festas-gpt.png"),
  "bar-gpt.png": require("../../assets/icons/bar-gpt.png"),
  "restaurantes-gpt.png": require("../../assets/icons/restaurantes-gpt.png"),
  "cristo_redentor_card_size.png": require("../../assets/icons/cristo_redentor_card_size.png"),
  "cultural-png.png": require("../../assets/icons/cultural-png.png"),
  "esporte3-gpt.png": require("../../assets/icons/esporte3-gpt.png"),
  "gastronomia-gpt.png": require("../../assets/icons/gastronomia-gpt.png"),
  "feiras-gpt.png": require("../../assets/icons/feiras-gpt.png"),
  "seminario-gpt.png": require("../../assets/icons/seminario-gpt.png"),
  "simposio-gpt.png": require("../../assets/icons/simposio-gpt.png"),
};

const getImageSource = (imageName: string): ImageSourcePropType => {
  return imageMap[imageName] ?? require("../../assets/icons/show.png");
};

export default function ColecoesScreen() {
  const router = useRouter();

  // 🔎 busca por NOME (igual ao web quando digita na barra)
  const [searchText, setSearchText] = useState("");

  const goSearchByTitle = () => {
    const q = searchText.trim();
    if (!q) return;
    router.push(`/barbershops?title=${encodeURIComponent(q)}` as Href);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={quickSearchOptions2}
        numColumns={NUM_COLUMNS}
        keyExtractor={(item) => item.title}
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
            {/* Header fora da lista */}
            <Header2 />

            {/* Barra de busca por título */}
            <View style={{ paddingHorizontal: H_PADDING, paddingTop: 16 }}>
              <View style={styles.searchRow}>
                <View style={styles.searchWrapper}>
                  <SearchIcon color="#9ca3af" size={18} style={{ marginRight: 6 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Buscar por nome do evento..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                    returnKeyType="search"
                    onSubmitEditing={goSearchByTitle}
                  />
                </View>
                <TouchableOpacity style={styles.button} onPress={goSearchByTitle}>
                  <Text style={styles.buttonText}>Buscar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.title}>
                Experiências incríveis para todos os gostos, especialmente o seu!
              </Text>
            </View>
          </>
        }
        // ✅ Footer no final do scroll
        ListFooterComponent={<Footer />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { width: ITEM_SIZE, height: ITEM_SIZE }]}
            activeOpacity={0.85}
            // 👉 Igual ao web QuickSearch: navega com ?service=...
            onPress={() =>
              router.push(
                `/barbershops?service=${encodeURIComponent(item.title)}` as Href
              )
            }
          >
            <Image source={getImageSource(item.imageUrl)} style={styles.image} resizeMode="cover" />
            <View style={styles.cardOverlay} />
            <View style={styles.textContainer}>
              <Text style={styles.text}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* 🚫 NADA DE OVERLAY AQUI — o overlay do menu fica só no _layout.tsx */}
    </View>
  );
}

const styles = StyleSheet.create({
  // título abaixo da barra de busca
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 16,
    color: "#111",
  },

  // 🔎 estilos da busca
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: "#000",
  },
  button: {
    backgroundColor: "#FF7400",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  // grid de cards
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
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
