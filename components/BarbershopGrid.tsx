// components/BarbershopGrid.tsx
import { api } from "@/lib/api";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import { useGoogleAuth } from "../hooks/useGoogleLogin";

export interface Barbershop {
  id: string;
  name: string;
  address?: string | null;   // ✅ agora pode ser null/undefined
  imageUrl?: string | null;  // ✅ agora pode ser null/undefined
  likedByUser?: boolean;
  likesCount?: number;
}

interface Props {
  barbershops: Barbershop[];
  onPressItem?: (id: string) => void;
  onToggleLike?: (id: string) => Promise<void> | void; // ✅ handler opcional vindo do pai
  isLoggedIn?: boolean;
}

export default function BarbershopGrid({
  barbershops,
  onPressItem,
  onToggleLike,
  isLoggedIn,
}: Props) {
  const { user } = useAuth();
  const { signInWithGoogle } = useGoogleAuth();
  const [shops, setShops] = useState(barbershops);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // 🔄 mantém o estado interno sincronizado com a prop
  useEffect(() => {
    setShops(barbershops);
  }, [barbershops]);

  const toggleLikeInternal = async (id: string) => {
    if (!user?.accessToken) {
      Toast.show({
        type: "error",
        text1: "Você precisa estar logado para curtir.",
        position: "bottom",
      });
      setShowModal(true);
      return;
    }

    try {
      const res = await api.post(
        `/api/events/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      const data = res.data as { liked: boolean; count: number };

      setShops((prev) =>
        prev.map((shop) =>
          shop.id === id
            ? {
                ...shop,
                likedByUser: !!data.liked,
                likesCount:
                  typeof data.count === "number" ? data.count : (shop.likesCount ?? 0),
              }
            : shop
        )
      );
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err);
      Toast.show({
        type: "error",
        text1: "Erro ao curtir. Tente novamente.",
        position: "bottom",
      });
    }
  };

  const handleToggleLike = async (id: string) => {
    if (onToggleLike) {
      // usa handler do pai, se fornecido
      await onToggleLike(id);
      return;
    }
    // fallback: curte por aqui
    await toggleLikeInternal(id);
  };

  const renderItem = ({ item }: { item: Barbershop }) => {
    const img = item.imageUrl || ""; // ✅ pode vir null -> vira string vazia
    const addr = item.address ?? "";  // ✅ fallback p/ string

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          if (onPressItem) onPressItem(item.id);
          else
            router.push({
              pathname: "/barbershop/[id]",
              params: { id: item.id },
            });
        }}
      >
        <View style={styles.imageContainer}>
          {img ? (
            <Image source={{ uri: img }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>Sem imagem</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleToggleLike(item.id)}
            activeOpacity={0.8}
          >
            <Heart
              size={16}
              color={item.likedByUser ? "red" : "gray"}
              fill={item.likedByUser ? "red" : "none"}
            />
            <Text style={styles.likeText}>{item.likesCount ?? 0}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>
          {!!addr && (
            <Text numberOfLines={1} style={styles.address}>
              {addr}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de login */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View className="modalBox" style={styles.modalBox}>
            <Text style={styles.modalTitle}>Acesse sua conta</Text>
            <Text style={styles.modalText}>
              Entre com sua conta Google para continuar
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                signInWithGoogle();
              }}
              style={styles.googleBtn}
              activeOpacity={0.9}
            >
              <Image
                source={require("../assets/images/google.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>Entrar com Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  row: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    flex: 0.48,
    overflow: "hidden",
    elevation: 4,
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    width: "100%",
    position: "relative",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  placeholderText: { color: "#999", fontSize: 12 },
  likeButton: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ffffffcc",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
  },
  likeText: { marginLeft: 4, fontSize: 12, color: "#111", fontWeight: "600" },
  info: { padding: 10 },
  name: { fontSize: 14, fontWeight: "600", color: "#111" },
  address: { fontSize: 12, color: "#888" },

  modalContainer: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  modalText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  googleBtn: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  googleIcon: { width: 20, height: 20 },
  googleText: { fontSize: 14, color: "#333" },
});
