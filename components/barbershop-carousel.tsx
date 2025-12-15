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

const PADDING_H = 16;
const ITEM_GAP = 12;
const CARD_WIDTH = 260; // mantém o layout original
const IMAGE_ASPECT = 16 / 9;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH / IMAGE_ASPECT);

export type CarouselEvent = {
  id: string;
  name: string;
  address: string | null;
  imageUrl?: string | null;
  categories?: string[];
  aprovado: boolean;
  likedByUser?: boolean;
  likesCount?: number;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

type Props = {
  barbershops: CarouselEvent[];
  isLoggedIn: boolean;
  onLoginPress: () => void;
  excludeIds?: string[];
};

const MUSIC_CATEGORIES = new Set([
  "Carnaval","Rodas de Samba","Bossa Nova","Passinho","Funk","Eletrônica",
  "Forró","MPB","Rock","Blues","Jazz","Chorinho","Sertanejo",
]);

function toDate(v?: string | Date | null){ if(!v) return null; const d=v instanceof Date?v:new Date(v); return isNaN(+d)?null:d;}
function daysUntil(d?: string|Date|null){const x=toDate(d); if(!x) return null; return Math.ceil((x.getTime()-Date.now())/(24*60*60*1000));}
function isHappeningNow(s?:string|Date|null,e?:string|Date|null){const S=toDate(s); if(!S) return false; const now=new Date(); const E=toDate(e); return E? S<=now && now<=E : (S.toDateString()===now.toDateString() && S<=now);}
function toSafeUri(raw?:string|null){ if(!raw) return "https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento";
  return /^https?:\/\//i.test(raw)||/^data:image\//i.test(raw)?raw:"https://dummyimage.com/600x338/eeeeee/aaaaaa.png&text=Evento"; }

// ---------- Subcomponentes ----------
const BadgeStack = memo(function BadgeStack({
  acontecendo, chegando, esperado, acessado,
}: {
  acontecendo: boolean; chegando: boolean; esperado: boolean; acessado: boolean;
}) {
  if (!(acontecendo || chegando || esperado || acessado)) return null;
  return (
    <View style={styles.badgeStack}>
      {acontecendo && <View style={styles.badgeItem}><EventBadge type="acontecendo" /></View>}
      {chegando && <View style={styles.badgeItem}><EventBadge type="estaChegando" /></View>}
      {esperado && <View style={styles.badgeItem}><EventBadge type="maisEsperado" /></View>}
      {acessado && <View style={styles.badgeItem}><EventBadge type="maisAcessado" /></View>}
    </View>
  );
});

const ShareButton = memo(function ShareButton({ item }: { item: CarouselEvent }) {
  const onShare = useCallback(async () => {
    try {
      await Share.share({
        title: item.name,
        message: `Confira ${item.name}${item.address ? ` em ${item.address}` : ""}\nhttps://ondetemeventorio.vercel.app/eventos/${item.id}`,
      });
    } catch {}
  }, [item.id, item.name, item.address]);

  return (
    <TouchableOpacity onPress={onShare} style={styles.shareInlineButton}>
      <AntDesign name="sharealt" size={16} color="#555" />
    </TouchableOpacity>
  );
});

const Slide = memo(function Slide({
  item,
  liked,
  count,
  onPressCard,
  onToggleLike,
  acontecendo,
  chegando,
  esperado,
  acessado,
}: {
  item: CarouselEvent;
  liked: boolean;
  count: number;
  onPressCard: (id: string) => void;
  onToggleLike: (id: string) => void;
  acontecendo: boolean;
  chegando: boolean;
  esperado: boolean;
  acessado: boolean;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={() => onPressCard(item.id)}>
      <View style={styles.imageWrapper}>
        <ExpoImage
  source={{ uri: toSafeUri(item.imageUrl || null) }}
  style={styles.image}
  contentFit="cover"
  cachePolicy="disk"        // ⬅ troque "immutable" por "disk" (ou "memory-disk")
  transition={100}
/>

        <BadgeStack
          acontecendo={acontecendo}
          chegando={chegando}
          esperado={esperado}
          acessado={acessado}
        />

        <TouchableOpacity style={styles.likeButton} onPress={() => onToggleLike(item.id)}>
          <AntDesign name={liked ? "heart" : "hearto"} size={16} color={liked ? "red" : "#9CA3AF"} />
          <Text style={styles.likeText}>{count}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
        {!!item.address && (<Text numberOfLines={2} style={styles.address}>{item.address}</Text>)}

        <View style={styles.footerRow}>
          <Text style={styles.cta}>Saiba Mais</Text>
          <ShareButton item={item} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ---------- Componente principal ----------
export default function BarbershopCarousel({
  barbershops,
  isLoggedIn,
  onLoginPress,
  excludeIds = [],
}: Props) {
  const router = useRouter();
  const [likesMap, setLikesMap] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mostLikedId, setMostLikedId] = useState<string | null>(null);
  const [mostAccessedId, setMostAccessedId] = useState<string | null>(null);

  const aprovados = useMemo(() => barbershops.filter((b) => b.aprovado), [barbershops]);
  const naoMusicais = useMemo(
    () => aprovados.filter((e) => !(e.categories || []).some((c) => MUSIC_CATEGORIES.has(c))),
    [aprovados]
  );

  const exclude = useMemo(() => new Set(excludeIds), [excludeIds]);
  const data = useMemo(() => naoMusicais.filter((e) => !exclude.has(e.id)), [naoMusicais, exclude]);

  useEffect(() => {
    const map: Record<string, { liked: boolean; count: number }> = {};
    data.forEach((e) => (map[e.id] = { liked: e.likedByUser ?? false, count: e.likesCount ?? 0 }));
    setLikesMap(map);
  }, [data]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiHelpers.getHighlights?.();
        if (!mounted || !res) return;
        setMostLikedId(res.mostLikedId ?? null);
        setMostAccessedId(res.mostAccessedId ?? null);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const toggleLike = useCallback(
    async (id: string) => {
      if (!isLoggedIn) {
        Toast.show({ type: "error", text1: "Você precisa estar logado.", position: "bottom" });
        setShowLoginModal(true);
        return;
      }
      let prevSnapshot: { liked: boolean; count: number } | undefined;
      setLikesMap((m) => {
        const prev = m[id] ?? { liked: false, count: 0 };
        prevSnapshot = prev;
        const optimistic = { liked: !prev.liked, count: prev.liked ? Math.max(0, prev.count - 1) : prev.count + 1 };
        return { ...m, [id]: optimistic };
      });

      try {
        const res = await apiHelpers.likeEvent(id);
        setLikesMap((m) => ({ ...m, [id]: { liked: !!res.liked, count: Number(res.count ?? 0) } }));
      } catch {
        if (prevSnapshot) setLikesMap((m) => ({ ...m, [id]: prevSnapshot! }));
        Toast.show({ type: "error", text1: "Não foi possível curtir agora.", position: "bottom" });
      }
    },
    [isLoggedIn]
  );

  const onPressCard = useCallback(
    (id: string) => { router.push({ pathname: "/barbershop/[id]", params: { id } }); },
    [router]
  );

  const keyExtractor = useCallback((i: CarouselEvent) => i.id, []);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: CARD_WIDTH + ITEM_GAP,
      offset: (CARD_WIDTH + ITEM_GAP) * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
  ({ item }: { item: CarouselEvent }) => {
    const likeInfo = likesMap[item.id] || { liked: false, count: 0 };
    const dias = daysUntil(item.startDate);
    const chegando = dias !== null && dias >= 0 && dias <= 5;

    // 🔴 desativa totalmente o "acontecendo"
    const acontecendo = false;

    const esperado = mostLikedId === item.id;
    const acessado = mostAccessedId === item.id;

    return (
      <Slide
        item={item}
        liked={likeInfo.liked}
        count={likeInfo.count}
        onPressCard={onPressCard}
        onToggleLike={toggleLike}
        acontecendo={acontecendo}
        chegando={chegando}
        esperado={esperado}
        acessado={acessado}
      />
    );
  },
  [likesMap, mostLikedId, mostAccessedId, onPressCard, toggleLike]
);


  if (data.length === 0) return null;

   return (
     <View style={styles.container}>
       <FlashList
  data={data}
  horizontal
  keyExtractor={keyExtractor}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.list}
  ItemSeparatorComponent={() => <View style={{ width: ITEM_GAP }} />}
  renderItem={renderItem}

  // Se sua versão expõe o tipo, mantenha; senão remova esta linha.
  // estimatedItemSize={CARD_WIDTH}

  // Usar cast para versões cujo tipo de layout não inclui 'size'
   
  overrideItemLayout={(layout: any /*, item: CarouselEvent, index: number*/) => {
    layout.size = CARD_WIDTH; // largura do item (sem o separador)
  }}

  snapToInterval={CARD_WIDTH + ITEM_GAP}
  decelerationRate="fast"
  snapToAlignment="start"
/>


       

      {/* Modal de login */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLoginModal(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Acesse sua conta</Text>
            <Text style={styles.modalSubtitle}>Entre com sua conta Google para continuar</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => { setShowLoginModal(false); onLoginPress(); }}
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

const styles = StyleSheet.create({
  container: { paddingHorizontal: PADDING_H, marginTop: 16 },
  list: { paddingRight: PADDING_H },

  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
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
    height: IMAGE_HEIGHT,
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
  likeText: { fontSize: 12, color: "#374151", marginLeft: 6, fontWeight: "600" },

  content: { padding: 12, paddingBottom: 12 },
  name: { fontWeight: "800", fontSize: 16, color: "#0F172A" },
  address: { fontSize: 12, color: "#6B7280", marginTop: 4, minHeight: 32 },

  footerRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
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
