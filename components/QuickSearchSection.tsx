// components/QuickSearchSection.tsx
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Tipos
type Option = {
  title: string;
  imageUrl: string;   // caminho do ícone local, ex: "/musica(1).png"
  service?: string;   // slug opcional; se não vier, uso title
};

type Props = {
  options: Option[];
};

const SCREEN_W = Dimensions.get("window").width;

// mapeia seus ícones locais (mesmo conjunto usado no seu app)
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
const getIcon = (u: string) => ICONS[u];

export default function QuickSearchSection({ options }: Props) {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);

  const [offsetX, setOffsetX] = useState(0);
  const [contentW, setContentW] = useState(0);

  const canScrollLeft = offsetX > 10;
  const canScrollRight = contentW - offsetX - SCREEN_W > 10;

  const data = useMemo(() => options, [options]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOffsetX(e.nativeEvent.contentOffset.x);
  };

  const onContentSizeChange = (w: number) => {
    setContentW(w);
  };

  const scrollBy = (delta: number) => {
    const next = Math.max(0, offsetX + delta);
    listRef.current?.scrollToOffset({ offset: next, animated: true });
  };

  const handlePress = (opt: Option) => {
    const service = (opt.service ?? opt.title).toString();
    router.push(`/barbershops?service=${encodeURIComponent(service)}` as any);
  };

  return (
    <View style={{ marginTop: 24 }}>
      {/* Header: título + Ver todas */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Busca Rápida</Text>
        <TouchableOpacity
          style={styles.seeAllRow}
          onPress={() => router.push("/colecoes" as any)}
        >
          <Text style={styles.seeAll}>Ver todas</Text>
          <ChevronRight size={16} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Carrossel horizontal */}
      <View style={{ position: "relative" }}>
        <FlatList
          ref={listRef}
          data={data}
          keyExtractor={(item) => (item.service ?? item.title)}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onContentSizeChange={onContentSizeChange}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingRight: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => handlePress(item)}>
              <Image source={getIcon(item.imageUrl)} style={styles.icon} />
              <Text style={styles.cardText} numberOfLines={1}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />

        {/* Setas de navegação (mostram/ somem conforme scroll) */}
        {canScrollLeft && (
          <TouchableOpacity
            style={[styles.navBtn, { left: 2 }]}
            onPress={() => scrollBy(-200)}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color="#f97316" />
          </TouchableOpacity>
        )}

        {canScrollRight && (
          <TouchableOpacity
            style={[styles.navBtn, { right: 2 }]}
            onPress={() => scrollBy(200)}
            activeOpacity={0.8}
          >
            <ChevronRight size={22} color="#f97316" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
    minWidth: 120,
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
