// components/EventosGrid.tsx
import EventBadge from "@/components/EventBadge";
import { apiHelpers } from "@/lib/api";
import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Image as RNImage,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

/* ===================== Tipos ===================== */
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
  return Math.ceil((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

function toSafeUri(raw?: string | null) {
  if (!raw) return "https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento";
  if (/^https?:\/\//i.test(raw) || /^data:image\//i.test(raw)) return raw;
  return "https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento";
}

/* ===================== Layout ===================== */
const H_GAP = 16;
const CARD_WIDTH = 260; // mesmo do seu carrossel
const IMAGE_ASPECT = 16 / 9;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH / IMAGE_ASPECT);
const CONTAINER_PAD_H = 16;

/* ===================== Subcomponentes ===================== */
const BadgeStack = memo(function BadgeStack({
  chegando,
  esperado,
  acessado,
}: {
  chegando: boolean;
  esperado: boolean;
  acessado: boolean;
}) {
  if (!(chegando || esperado || acessado)) return null;
  return (
    <View style={styles.badgeStack}>
      {chegando && (
        <View style={styles.badgeItem}>
          <EventBadge type="estaChegando" />
        </View>
      )}
      {esperado && (
        <View style={styles.badgeItem}>
          <EventBadge type="maisEsperado" />
        </View>
      )}
      {acessado && (
        <View style={styles.badgeItem}>
          <EventBadge type="maisAcessado" />
        </View>
      )}
    </View>
  );
});

const ShareBtn = memo(function ShareBtn({ item }: { item: Barbershop }) {
  const onShare = useCallback(async () => {
    try {
      await Share.share({
        title: item.name,
        message: `Confira ${item.name}${
          item.address ? ` em ${item.address}` : ""
        }\nhttps://ondetemeventorio.vercel.app/eventos/${item.id}`,
      });
    } catch {}
  }, [item.id, item.name, item.address]);

  return (
    <TouchableOpacity onPress={onShare} style={styles.shareInlineButton}>
      <AntDesign name="sharealt" size={16} color="#555" />
    </TouchableOpacity>
  );
});

const GridCard = memo(function GridCard({
  item,
  liked,
  count,
  onPressCard,
  onPressLike,
  chegando,
  esperado,
  acessado,
}: {
  item: Barbershop;
  liked: boolean;
  count: number;
  onPressCard: (id: string) => void;
  onPressLike: (id: string) => void;
  chegando: boolean;
  esperado: boolean;
  acessado: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPressCard(item.id)}
    >
      <View style={styles.imageWrapper}>
        <ExpoImage
          source={{ uri: toSafeUri(item.imageUrl) }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="disk"
          transition={100}
        />

        <BadgeStack chegando={chegando} esperado={esperado} acessado={acessado} />

        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => onPressLike(item.id)}
        >
          <AntDesign
            name={liked ? "heart" : "hearto"}
            size={16}
            color={liked ? "red" : "#9CA3AF"}
          />
          <Text style={styles.likeText}>{count}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
        {!!item.address && (
          <Text numberOfLines={2} style={styles.address}>
            {item.address}
          </Text>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.cta}>Saiba Mais</Text>
          <ShareBtn item={item} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* ===================== Principal ===================== */
export default function EventosGrid({
  barbershops,
  isLoggedIn,
  onLoginPress,
  onToggleLike,
}: Props) {
  const router = useRouter();
  const aprovados = useMemo(
    () => barbershops.filter((b) => b.aprovado),
    [barbershops]
  );

  const [likesMap, setLikesMap] = useState<
    Record<string, { liked: boolean; count: number }>
  >({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mostLikedId, setMostLikedId] = useState<string | null>(null);
  const [mostAccessedId, setMostAccessedId] = useState<string | null>(null);

  useEffect(() => {
    const map: Record<string, { liked: boolean; count: number }> = {};
    aprovados.forEach(
      (e) =>
        (map[e.id] = {
          liked: e.likedByUser ?? false,
          count: e.likesCount ?? 0,
        })
    );
    setLikesMap(map);
  }, [aprovados]);

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
          [id]: {
            liked: !!res.liked,
            count: Number(res.count ?? 0),
          },
        }));
      } catch {
        setLikesMap((m) => ({ ...m, [id]: prev }));
        Toast.show({
          type: "error",
          text1: "Não foi possível curtir agora.",
          position: "bottom",
        });
      }
    },
    [likesMap]
  );

  const handlePressLike = useCallback(
    (id: string) => {
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
    },
    [isLoggedIn, onToggleLike, toggleLikeApi]
  );

  const onPressCard = useCallback(
    (id: string) => {
      router.push({ pathname: "/barbershop/[id]", params: { id } });
    },
    [router]
  );

  const keyExtractor = useCallback((item: Barbershop) => item.id, []);

  if (aprovados.length === 0) {
    return <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>;
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={aprovados}
        horizontal
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: CONTAINER_PAD_H,
          paddingRight: CONTAINER_PAD_H,
        }}
        ItemSeparatorComponent={() => <View style={{ width: H_GAP }} />}
        renderItem={({ item }) => {
          const { liked, count } = likesMap[item.id] || {
            liked: false,
            count: 0,
          };
          const dias = daysUntil(item.startDate);
          const chegando = dias !== null && dias >= 0 && dias <= 5;
          // 🔥 NÃO TEM MAIS "acontecendo" AQUI
          const esperado = mostLikedId === item.id;
          const acessado = mostAccessedId === item.id;

          return (
            <GridCard
              item={item}
              liked={liked}
              count={count}
              onPressCard={onPressCard}
              onPressLike={handlePressLike}
              chegando={chegando}
              esperado={esperado}
              acessado={acessado}
            />
          );
        }}
        overrideItemLayout={(layout: any) => {
          layout.size = CARD_WIDTH;
        }}
        snapToInterval={CARD_WIDTH + H_GAP}
        decelerationRate="fast"
        snapToAlignment="start"
      />

      {/* Modal de login */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLoginModal(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Acesse sua conta</Text>
            <Text style={styles.modalSubtitle}>
              Entre com sua conta Google para continuar
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                setShowLoginModal(false);
                onLoginPress();
              }}
            >
              <RNImage
                source={require("@/assets/images/google.png")}
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
  container: { paddingTop: 16 },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 14,
  },

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
    height: IMAGE_HEIGHT, // evita custo do aspectRatio durante scroll
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  image: { width: "100%", height: "100%" },

  badgeStack: { position: "absolute", left: 8, top: 8 },
  badgeItem: { marginBottom: 6 },

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
  likeText: {
    fontSize: 12,
    color: "#374151",
    marginLeft: 6,
    fontWeight: "600",
  },

  content: { padding: 12, paddingBottom: 14 },
  name: { fontWeight: "800", fontSize: 16, color: "#0F172A" },
  address: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    minHeight: 32,
  },

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

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000099",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
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
