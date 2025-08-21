import { AntDesign } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
const horizontalPadding = 16;
const gap = 8;
const cardWidth = screenWidth - horizontalPadding * 2 - gap;


interface Barbershop {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  aprovado: boolean;
  likedByUser?: boolean;
  likesCount?: number;
  categories: string[];
}

interface Props {
  barbershops: Barbershop[];
  session: any; // tipar melhor se possível
  onLoginPress: () => void;
}

export default function EventosGrid({ barbershops, session, onLoginPress }: Props) {
  const [likesMap, setLikesMap] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    if (!session?.user) {
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
      const data = await res.json();
      setLikesMap((prev) => ({
        ...prev,
        [id]: { liked: data.liked, count: data.count },
      }));
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  const shareEvent = async (event: Barbershop) => {
    try {
      await Share.share({
        title: event.name,
        message: `Confira ${event.name} em ${event.address}\nhttps://ondetemeventorio.vercel.app/eventos/${event.id}`,
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const eventosAprovados = barbershops.filter((b) => b.aprovado);
  const eventosFiltrados = barbershops;

  return (
    <View style={styles.container}>
      <FlatList
        data={eventosFiltrados.length > 0 ? eventosFiltrados : eventosAprovados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const { liked, count } = likesMap[item.id] || { liked: false, count: 0 };
          return (
            <View style={styles.card}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />

              {/* Botão de curtir */}
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

              {/* Conteúdo */}
              <View style={styles.content}>
                <Text numberOfLines={1} style={styles.name}>
                  {item.name}
                </Text>
                <Text numberOfLines={2} style={styles.address}>
                  {item.address}
                </Text>
                <Text style={styles.ticket}>Garanta seu ingresso</Text>
              </View>

              {/* Compartilhar */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => shareEvent(item)}
              >
                <AntDesign name="sharealt" size={16} color="#555" />
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
        }
      />

      {/* Modal de login */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowLoginModal(false)}>
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

      <Toast position="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    width: cardWidth,
    alignSelf: "center", // CENTRALIZA
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: "relative",
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  likeText: {
    fontSize: 12,
    color: "#555",
    marginLeft: 4,
  },
  content: {
    padding: 12,
    paddingBottom: 30,
  },
  name: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#222",
  },
  address: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  ticket: {
    fontSize: 12,
    color: "#16a34a",
    marginTop: 8,
    fontWeight: "600",
  },
  shareButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 6,
    borderRadius: 999,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 14,
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
