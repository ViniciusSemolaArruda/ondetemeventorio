import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Barbershop {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  aprovado: boolean;
  likedByUser?: boolean;
  likesCount?: number;
}

interface Props {
  barbershops: Barbershop[];
  isLoggedIn: boolean;
  onLoginPress: () => void;
}

export default function BarbershopCarousel({
  barbershops,
  isLoggedIn,
  onLoginPress,
}: Props) {
  const [likesMap, setLikesMap] = useState<
    Record<string, { liked: boolean; count: number }>
  >({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  const eventosAprovados = isLoggedIn
    ? barbershops.filter((b) => b.aprovado)
    : barbershops;

  useEffect(() => {
    const map: Record<string, { liked: boolean; count: number }> = {};
    barbershops.forEach((event) => {
      map[event.id] = {
        liked: event.likedByUser ?? false,
        count: event.likesCount ?? 0,
      };
    });
    setLikesMap(map);
  }, [barbershops]);

  const toggleLike = async (id: string) => {
    if (!isLoggedIn) {
      Toast.show({
        type: "error",
        text1: "Você precisa estar logado para curtir.",
      });
      setShowLoginModal(true);
      return;
    }

    try {
      const res = await fetch(`https://ondetemeventorio.vercel.app/api/events/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Erro");

      const data = await res.json();

      setLikesMap((prev) => ({
        ...prev,
        [id]: { liked: data.liked, count: data.count },
      }));
    } catch (e) {
      console.error("Erro ao curtir:", e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={eventosAprovados}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const { liked, count } = likesMap[item.id] || {
            liked: false,
            count: 0,
          };

          return (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => toggleLike(item.id)}
              >
                <AntDesign
                  name={liked ? "heart" : "hearto"}
                  size={16}
                  color={liked ? "red" : "gray"}
                />
                <Text style={styles.likeText}>{count}</Text>
              </TouchableOpacity>
              <View style={styles.content}>
                <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
                <Text numberOfLines={2} style={styles.address}>{item.address}</Text>
                <Text style={styles.ticket}>Garanta seu ingresso</Text>
              </View>
            </View>
          );
        }}
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
            <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
              <Image
                source={require("../assets/images/google.png")}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text style={styles.loginButtonText}>Entrar com Google</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      <Toast />
    </View>
  );
}

const CARD_WIDTH = SCREEN_WIDTH * 0.7;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 16 },
  list: { gap: 16 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  image: { width: "100%", height: 140 },
  likeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  likeText: { fontSize: 12, color: "#555", marginLeft: 4 },
  content: { padding: 12 },
  name: { fontWeight: "bold", fontSize: 16, color: "#222" },
  address: { fontSize: 12, color: "#666", marginTop: 4 },
  ticket: { fontSize: 12, color: "#0a7", marginTop: 8 },
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
