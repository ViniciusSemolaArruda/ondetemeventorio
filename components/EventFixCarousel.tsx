// components/EventFixCarousel.tsx (React Native)
import { AntDesign } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

import EventBadge from "@/components/EventBadge"; // reutiliza "maisEsperado" / "maisAcessado"
import { apiHelpers } from "@/lib/api";
import { useRouter } from "expo-router";

/* ===================== Tipos ===================== */
export type FixEvent = {
  id: string;
  name: string;
  address: string | null;
  imageUrl?: string | null;
  categories: string[];
  aprovado: boolean;
  likedByUser?: boolean;
  likesCount?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

type HighlightsPayload = {
  mostLikedId: string | null;
  mostAccessedId: string | null;
};

type Props = {
  events: FixEvent[];
  title?: string;
  isLoggedIn: boolean;
  onLoginPress: () => void;
};

const SCREEN_W = Dimensions.get("window").width;
const CARD_WIDTH = 260;
const H_GAP = 16;

/* ===================== Utils ===================== */
function toSafeUri(raw?: string | null) {
  if (!raw) return "https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento";
  if (/^https?:\/\//i.test(raw) || /^data:image\//i.test(raw)) return raw;
  return "https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento";
}

/* ===================== Componente ===================== */
export default function EventFixCarousel({
  events,
  title,
  isLoggedIn,
  onLoginPress,
}: Props) {
  const router = useRouter();

  // apenas aprovados e sem datas
  const fixos = useMemo(
    () => events.filter((e) => e.aprovado === true && !e.startDate && !e.endDate),
    [events]
  );

  const [likesMap, setLikesMap] = useState<Record<string, { liked: boolean; count: number }>>({});
  useEffect(() => {
    const map: Record<string, { liked: boolean; count: number }> = {};
    for (const e of fixos) {
      map[e.id] = { liked: e.likedByUser ?? false, count: e.likesCount ?? 0 };
    }
    setLikesMap(map);
  }, [fixos]);

  // destaques
  const [mostLikedId, setMostLikedId] = useState<string | null>(null);
  const [mostAccessedId, setMostAccessedId] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: HighlightsPayload = await apiHelpers.getHighlights();
        if (!mounted) return;
        setMostLikedId(res.mostLikedId ?? null);
        setMostAccessedId(res.mostAccessedId ?? null);
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleLikeApi = useCallback(
    async (id: string) => {
      const prev = likesMap[id] ?? { liked: false, count: 0 };
      const optimistic = {
        liked: !prev.liked,
        count: prev.liked ? Math.max(0, prev.count - 1) : prev.count + 1,
      };
      setLikesMap((m) => ({ ...m, [id]: optimistic }));
      try {
        const res = await apiHelpers.likeEvent(id);
        setLikesMap((m) => ({
          ...m,
          [id]: { liked: !!res.liked, count: Number(res.count ?? 0) },
        }));
      } catch (err) {
        setLikesMap((m) => ({ ...m, [id]: prev }));
        console.error("Erro ao curtir:", err);
        Toast.show({ type: "error", text1: "Não foi possível curtir agora.", position: "bottom" });
      }
    },
    [likesMap]
  );

  const onPressLike = (id: string) => {
    if (!isLoggedIn) {
      Toast.show({
        type: "info",
        text1: "Você precisa estar logado",
        text2: "Entre na sua conta.",
        position: "bottom",
      });
      setShowLoginModal(true);
      return;
    }
    toggleLikeApi(id);
  };

  const shareEvent = async (e: FixEvent) => {
    try {
      await Share.share({
        title: e.name,
        message: `Confira ${e.name}${e.address ? ` em ${e.address}` : ""}\nhttps://ondetemeventorio.vercel.app/eventos/${e.id}`,
      });
    } catch {}
  };

  const [showLoginModal, setShowLoginModal] = useState(false);

  if (fixos.length === 0) return null;

  return (
    <View style={styles.container}>
      {!!title && <Text style={styles.title}>{title}</Text>}

      <FlatList
        data={fixos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: H_GAP }} />}
        renderItem={({ item }) => {
          const { liked, count } = likesMap[item.id] || { liked: false, count: 0 };
          const showMaisEsperado = mostLikedId === item.id;
          const showMaisAcessado = mostAccessedId === item.id;

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => router.push({ pathname: "/barbershop/[id]", params: { id: item.id } })}
            >
              {/* Imagem */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: toSafeUri(item.imageUrl) }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {(showMaisEsperado || showMaisAcessado) && (
                  <View style={styles.badgeStack}>
                    {showMaisEsperado && <EventBadge type="maisEsperado" />}
                    {showMaisAcessado && <EventBadge type="maisAcessado" />}
                  </View>
                )}

                {/* Like pill */}
                <TouchableOpacity style={styles.likeButton} onPress={() => onPressLike(item.id)}>
                  <AntDesign name={liked ? "heart" : "hearto"} size={16} color={liked ? "red" : "#9CA3AF"} />
                  <Text style={styles.likeText}>{count}</Text>
                </TouchableOpacity>
              </View>

              {/* Conteúdo */}
              <View style={styles.content}>
                <Text numberOfLines={1} style={styles.name}>
                  {item.name}
                </Text>
                {!!item.address && (
                  <Text numberOfLines={2} style={styles.address}>
                    {item.address}
                  </Text>
                )}

                {/* Footer: "Saiba Mais" + Compartilhar (mesma linha) */}
                <View style={styles.footerRow}>
                  <Text style={styles.cta}>Saiba Mais</Text>
                  <TouchableOpacity onPress={() => shareEvent(item)} style={styles.shareInlineButton}>
                    <AntDesign name="sharealt" size={16} color="#555" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Modal de login */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLoginModal(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Acesse sua conta</Text>
            <Text style={styles.modalSubtitle}>Entre com sua conta Google para continuar</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                setShowLoginModal(false);
                onLoginPress();
              }}
            >
              <Image
                source={require("../assets/images/google.png")}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text style={styles.loginButtonText}>Entrar com Google</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ===================== Estilos ===================== */
const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16 },
  title: { marginBottom: 12, fontSize: 18, fontWeight: "600", color: "#1f2937" },

  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
  },

  imageWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  image: { width: "100%", height: "100%" },

  badgeStack: { position: "absolute", left: 8, top: 8, gap: 6 },

  likeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  likeText: { fontSize: 12, color: "#374151", marginLeft: 6, fontWeight: "600" },

  content: { padding: 12, paddingBottom: 14 },
  name: { fontWeight: "800", fontSize: 16, color: "#0F172A" },
  address: { fontSize: 12, color: "#6B7280", marginTop: 4, minHeight: 32 },

  footerRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cta: { fontSize: 12, color: "#059669", fontWeight: "700" },
  shareInlineButton: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#00000099" },
  modalBox: { backgroundColor: "#fff", padding: 24, borderRadius: 12, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: "#555", marginBottom: 16 },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  loginButtonText: { color: "#333", fontWeight: "500" },
});
