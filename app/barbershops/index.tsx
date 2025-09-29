// app/barbershops/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heart, Search as SearchIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import Header3 from "@/components/Header3";
import SidebarSheet from "@/components/SidebarSheet";
import Footer from "@/components/footer";
import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { apiHelpers, setAuthToken } from "@/lib/api";

type EventItem = {
  id: string;
  name: string;
  address?: string | null;
  imageUrl?: string | null;
  likes?: { userId: string }[];
  likesCount?: number;
  likedByUser?: boolean;
};

const SCREEN = Dimensions.get("window");
const H_PADDING = 16;
const COL_GAP = 16;
const NUM_COLS = 2;
const RADIUS = 16;

// card width baseado no grid
const CARD_WIDTH = (SCREEN.width - H_PADDING * 2 - COL_GAP * (NUM_COLS - 1)) / NUM_COLS;
// alturas estimadas para calcular o “spacer”
const IMAGE_H = (CARD_WIDTH * 9) / 16; // aspect 16:9
const CARD_TEXT_BLOCK = 36; // título + addr + paddings
const CARD_VERTICAL_GAP = 8; // gap abaixo da imagem
const ROW_GAP = 16;
const CARD_ROW_H = IMAGE_H + CARD_VERTICAL_GAP + CARD_TEXT_BLOCK;

export default function BarbershopsScreen() {
  const { user } = useAuth();
  const { isOpen, closeMenu } = useMenu();
  const router = useRouter();

  const { title: titleFromParams, service: serviceFromParams } =
    useLocalSearchParams<{ title?: string; service?: string }>();

  const [loading, setLoading] = useState(true);
  const [barbershops, setBarbershops] = useState<EventItem[]>([]);
  const [title, setTitle] = useState<string>("");
  const [service, setService] = useState<string>("");

  // medidas p/ sticky footer correto
  const [outerHeaderH, setOuterHeaderH] = useState(0); // altura do Header (fora da lista)
  const [listHeaderH, setListHeaderH] = useState(0);   // altura do cabeçalho da lista (search + labels)

  const likeScale = useRef(new Animated.Value(1)).current;
  const pop = () => {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.2, useNativeDriver: true, speed: 20, bounciness: 10 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
  };

 const fetchEvents = useCallback(
  async (opts: { title?: string; service?: string }) => {
    setLoading(true);
    try {
      // Pega o termo de pesquisa: service tem prioridade; se não tiver, usa title
      const q = (opts.service?.trim() || opts.title?.trim() || "");

      // Envia SEM prefixo "service:" — a sua API filtra por name/address/categories com o termo cru
      const resp = await apiHelpers.events({ title: q });

      const mapped: EventItem[] = resp.map((evento: any) => {
        const likesCount = Array.isArray(evento.likes)
          ? evento.likes.length
          : evento.likesCount ?? 0;

        const likedByUser = user?.id
          ? evento.likes?.some((l: { userId: string }) => l.userId === user.id)
          : false;

        return { ...evento, likesCount, likedByUser };
      });

      setBarbershops(mapped);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    } finally {
      setLoading(false);
    }
  },
  [user?.id]
);


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

  const handleSearchByTitle = useCallback(() => {
    setService("");
    fetchEvents({ title });
  }, [title, fetchEvents]);

  const toggleLike = async (item: EventItem) => {
    if (!user?.id) {
      Alert.alert("Login necessário", "Entre com sua conta para curtir.");
      return;
    }
    try {
      // garante Bearer no axios (se seu AuthContext já injeta, manter é seguro)
      // @ts-ignore
      if (user?.accessToken) setAuthToken(user.accessToken as string);

      pop();

      // UI otimista
      setBarbershops((prev) =>
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

      // chamada real com axios (usa Authorization)
      const data = await apiHelpers.likeEvent(item.id); // { liked, count }

      // sincroniza com backend
      setBarbershops((prev) =>
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
      // reverte UI otimista
      setBarbershops((prev) =>
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

  const resultLabel = service?.trim()
    ? `Resultados para “${service.trim()}”`
    : title?.trim()
    ? `Resultados para “${title.trim()}”`
    : "Resultados";

  // mede altura do Header (fora da lista)
  const onOuterHeaderLayout = (e: LayoutChangeEvent) => {
    setOuterHeaderH(e.nativeEvent.layout.height);
  };

  // mede altura do cabeçalho da lista (search + labels/spinners)
  const onListHeaderLayout = (e: LayoutChangeEvent) => {
    setListHeaderH(e.nativeEvent.layout.height);
  };

  // calcula espaço restante p/ empurrar Footer
  const rows = Math.ceil(Math.max(barbershops.length, 0) / NUM_COLS);
  const rowsHeight = rows > 0 ? rows * CARD_ROW_H + Math.max(0, rows - 1) * ROW_GAP : 0;
  const visibleListHeight = SCREEN.height - outerHeaderH; // viewport da FlatList
  const remaining = Math.max(0, visibleListHeight - listHeaderH - rowsHeight);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header fora da lista (não corta) e medido */}
      <View onLayout={onOuterHeaderLayout}>
        <Header3 />
      </View>

      <FlatList
        data={barbershops}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        columnWrapperStyle={{ gap: COL_GAP, marginBottom: 16 }}
        contentContainerStyle={[styles.grid, { paddingHorizontal: H_PADDING }]}
        ListHeaderComponent={
          <View style={styles.container} onLayout={onListHeaderLayout}>
            {/* Busca por título */}
            <View style={styles.searchContainer}>
              <View style={styles.searchWrapper}>
                <SearchIcon color="#9ca3af" size={18} style={styles.searchIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Pesquisar evento..."
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                  returnKeyType="search"
                  onSubmitEditing={handleSearchByTitle}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={handleSearchByTitle}>
                <Text style={styles.buttonText}>Buscar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.resultTitle}>{resultLabel}</Text>

            {loading && (
              <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 8 }} />
            )}

            {!loading && barbershops.length === 0 && (
              <Text style={styles.noResults}>Nenhum evento encontrado.</Text>
            )}
          </View>
        }
        renderItem={renderCard}
        ListFooterComponent={
          <>
            {/* spacer só quando faltar espaço para “grudar” o footer no fim da tela */}
            {remaining > 0 ? <View style={{ height: remaining }} /> : null}
            <Footer />
          </>
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
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    paddingVertical: 4,
    backgroundColor: "#fff",
  },
  searchIcon: { marginRight: 6 },
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
  resultTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9ca3af",
    marginBottom: 12,
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
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    overflow: "hidden",
    backgroundColor: "#fff", // fundo branco atrás da imagem
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
    marginTop: 40,
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
