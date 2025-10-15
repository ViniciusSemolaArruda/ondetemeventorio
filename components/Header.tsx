import { ROUTES } from "@/constants/route";
import { useI18n } from "@/context/I18nContext";
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
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

export default function Header() {
  const { user } = useAuth();
  const { openMenu } = useMenu();
  const router = useRouter();
  const { t } = useI18n();

  const handleCreateEvent = () => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: t("header_login_required"), // "Você precisa estar logado para criar um evento."
        text2: t("login_desc"),            // "Entre com sua conta Google para continuar"
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }
    router.push(ROUTES.CREATE_EVENT);
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity accessibilityRole="imagebutton" accessibilityLabel="Logo">
          <Image
            source={require("../assets/images/logo01.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Botões */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.buttonGhost}
            onPress={handleCreateEvent}
            accessibilityRole="button"
            accessibilityLabel={t("header_create_event")}
          >
            <Plus size={18} color="#555" />
            <Text style={styles.buttonText}>{t("header_create_event")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, !user && styles.attentionPing]}
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel={t("header_menu_aria")}
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
    width: 235,
    height: 135,
    marginLeft: -28,
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
