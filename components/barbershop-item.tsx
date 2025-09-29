import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Barbershop {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  likedByUser?: boolean;
  likesCount?: number;
}

interface Props {
  barbershop: Barbershop;
  isLoggedIn: boolean;
  onPressIngresso: (id: string) => void;
}

export default function BarbershopItem({
  barbershop,
  isLoggedIn,
  onPressIngresso,
}: Props) {
  const [isLiked, setIsLiked] = useState(barbershop.likedByUser ?? false);
  const [likesCount, setLikesCount] = useState(barbershop.likesCount ?? 0);

  const toggleLike = async () => {
    if (!isLoggedIn) {
      alert("Você precisa estar logado.");
      return;
    }

    try {
      const res = await fetch(
        `https://ondetemeventorio.vercel.app/api/events/${barbershop.id}/like`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error("Erro");

      const data = await res.json();

      setIsLiked(data.liked);
      setLikesCount(data.count);
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  return (
    <View style={styles.card}>
      {/* Imagem */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: barbershop.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={16}
            color={isLiked ? "red" : "gray"}
          />
          <Text style={styles.likeCount}>{likesCount}</Text>
        </TouchableOpacity>
      </View>

      {/* Informações */}
      <View style={styles.info}>
        <Text style={styles.name}>{barbershop.name}</Text>
        <Text style={styles.address}>{barbershop.address}</Text>

        <TouchableOpacity
          onPress={() => onPressIngresso(barbershop.id)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Ingresso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    width: 170,
    marginBottom: 16,
    marginRight: 12,
    elevation: 3,
  },
  imageContainer: {
    height: 160,
    width: "100%",
    position: "relative",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  likeButton: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likeCount: {
    fontSize: 12,
    marginLeft: 4,
    color: "#333",
  },
  info: {
    padding: 12,
  },
  name: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    backgroundColor: "#222",
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
});
