import { ROUTES } from "@/constants/route";
import { useRouter } from "expo-router";
import { Menu, Plus } from "lucide-react-native";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

export default function Header() {
  const { user } = useAuth();
  const { openMenu } = useMenu();
  const router = useRouter();

  const handleCreateEvent = () => {
    // Se quiser exigir login, descomente:
    // if (!user) {
    //   alert("Você precisa estar logado para criar um evento.");
    //   return;
    // }
    router.push(ROUTES.CREATE_EVENT);
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        {/* Logo que leva para a página de criação */}
        
          <TouchableOpacity>
            <Image
              source={require("../assets/images/logo01.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        

        {/* Botões */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.buttonGhost} onPress={handleCreateEvent}>
            <Plus size={18} color="#555" />
            <Text style={styles.buttonText}>Criar Evento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, !user && styles.attentionPing]}
            onPress={openMenu}
          >
            <Menu size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 0,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 100,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonGhost: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: "#f0f0f0",
    gap: 6,
  },
  buttonText: {
    color: "#555",
    fontWeight: "600",
  },
  iconButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
  attentionPing: {
    borderColor: "#007AFF",
  },
});
