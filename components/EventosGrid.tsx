import EventBadge from "@/components/EventBadge"; // versão RN
import { apiHelpers } from "@/lib/api";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const screenWidth = Dimensions.get("window").width;
const PADDING_H = 16;
const GAP = 8;
const CARD_WIDTH = Math.min(screenWidth - PADDING_H * 2 - GAP, 420);

// Tipagem do evento
interface Barbershop {
  id: string;
  name: string;
  address: string | null;
  imageUrl: string | null;
  aprovado: boolean;
  likedByUser?: boolean;
  likesCount?: number;
  categories?: string[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}

type HighlightsPayload = {
  mostLikedId: string | null;
  mostAccessedId: string | null;
};

interface Props {
  barbershops: Barbershop[];
  isLoggedIn: boolean;
  onLoginPress: () => void;
  onToggleLike?: (id: string) => void;
}

/* ===================== Helpers ===================== */
function toDate(v?: string | Date | null): Date | null {
  if (!v) return null;
  if (v instanceof Date) return isNaN(+v) ? null : v;
  const d = new Date(v);
  return isNaN(+d) ? null : d;
}

function daysUntil(dateLike?: string | Date | null): number | null {
  const d = toDate(dateLike);
  if (!d) return null;
  const ms = d.getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function isHappeningNow(start?: string | Date | null, end?: string | Date | null) {
  const s = toDate(start);
  if (!s) return false;
  const now = new Date();
  const e = toDate(end);
  if (e) return s.getTime() <= now.getTime() && now.getTime() <= e.getTime();
  return s.toDateString() === now.toDateString() && s.getTime() <= now.getTime();
}

function toSafeUri(raw?: string | null) {
  if (!raw) return "https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento";
  if (/^https?:\/\//i.test(raw) || /^data:image\//i.test(raw)) return raw;
  return "https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento";
}

export default function EventosGrid({
  barbershops,
  isLoggedIn,
  onLoginPress,
  onToggleLike,
}: Props) {
  const router = useRouter();

  const [likesMap, setLikesMap] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [mostLikedId, setMostLikedId] = useState<string | null>(null);
  const [mostAccessedId, setMostAccessedId] = useState<string | null>(null);

  // apenas aprovados
  const aprovados = useMemo(() => barbershops.filter((b) => b.aprovado), [barbershops]);

  useEffect(() => {
    const map: Record<string, { liked: boolean; count: number }> = {};
    aprovados.forEach((e) => {
      map[e.id] = { liked: e.likedByUser ?? false, count: e.likesCount ?? 0 };
    });
    setLikesMap(map);
  }, [aprovados]);

  // highlights (mais curtido / mais acessado)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res: HighlightsPayload = await apiHelpers.getHighlights();
        if (!mounted) return;
        setMostLikedId(res.mostLikedId ?? null);
        setMostAccessedId(res.mostAccessedId ?? null);
      } catch {
        // silencioso
      }
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

  const handlePressLike = (id: string) => {
    if (!isLoggedIn) {
      Toast.show({
        type: "info",
        text1: "Você precisa estar logado",
        text2: "Entre na sua conta.",
        position: "bottom",
        visibilityTime: 3000,
      });
      setShowLoginModal(true);
      return;
    }
    if (onToggleLike) return onToggleLike(id);
    toggleLikeApi(id);
  };

  const shareEvent = async (e: Barbershop) => {
    try {
      await Share.share({
        title: e.name,
        message: `Confira ${e.name}${e.address ? ` em ${e.address}` : ""}\nhttps://ondetemeventorio.vercel.app/eventos/${e.id}`,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  if (aprovados.length === 0) {
    return <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={aprovados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const { liked, count } = likesMap[item.id] || { liked: false, count: 0 };

          // flags dos selos igual ao web
          const dias = daysUntil(item.startDate);
          const showEstaChegando = dias !== null && dias >= 0 && dias <= 5;
          const showAcontecendo = isHappeningNow(item.startDate, item.endDate);
          const showMaisEsperado = mostLikedId === item.id;
          const showMaisAcessado = mostAccessedId === item.id;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() =>
                router.push({ pathname: "/barbershop/[id]", params: { id: item.id } })
              }
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: toSafeUri(item.imageUrl) }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {(showAcontecendo || showMaisEsperado || showEstaChegando || showMaisAcessado) && (
                  <View style={styles.badgeStack}>
                    {showAcontecendo && <EventBadge type="acontecendo" />}
                    {showEstaChegando && <EventBadge type="estaChegando" />}
                    {showMaisEsperado && <EventBadge type="maisEsperado" />}
                    {showMaisAcessado && <EventBadge type="maisAcessado" />}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.likeButton, !isLoggedIn && { opacity: 0.9 }]}
                  onPress={() => handlePressLike(item.id)}
                >
                  <AntDesign name={liked ? "heart" : "hearto"} size={16} color={liked ? "red" : "#9CA3AF"} />
                  <Text style={styles.likeText}>{count}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <Text numberOfLines={2} style={styles.name}>
                  {item.name}
                </Text>
                {!!item.address && (
                  <Text numberOfLines={2} style={styles.address}>
                    {item.address}
                  </Text>
                )}

                {/* Footer: "Saiba Mais" + Compartilhar na MESMA LINHA */}
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

const styles = StyleSheet.create({
  container: { paddingHorizontal: PADDING_H, paddingTop: 20 },
  card: {
    width: CARD_WIDTH,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    // borda + sombra leve (mais “web”)
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    position: "relative",
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    // sem fundo acinzentado
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

  emptyText: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 14 },

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
