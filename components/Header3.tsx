// components/Header2.tsx
import { useI18n } from "@/context/I18nContext";
import { useRouter } from "expo-router";
import { Menu, Undo2 } from "lucide-react-native";
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

const Header2 = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { openMenu } = useMenu();
  const { t } = useI18n();

  // Voltar para a tela anterior; se não houver histórico, vai para /home
  const handleGoBack = () => {
    try {
      // @ts-ignore - compat com versões antigas
      if (router.canGoBack && router.canGoBack()) {
        router.back();
      } else {
        router.push("/home");
      }
    } catch {
      router.push("/home");
    }
  };

  const handleLogoPress = () => {
    router.push("/home");
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity onPress={handleLogoPress}>
          <Image
            source={require("../assets/images/logo01.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.buttons}>
          {/* Botão Voltar */}
          <TouchableOpacity style={styles.buttonGhost} onPress={handleGoBack}>
            <Undo2 size={18} color="#555" />
            <Text style={styles.buttonText}>{t("header_back") || "Voltar"}</Text>
          </TouchableOpacity>

          {/* Botão Menu */}
          <TouchableOpacity
            accessibilityLabel={t("header2_menu_aria") || "Abrir menu"}
            style={[styles.iconButton, !user && styles.attentionPing]}
            onPress={openMenu}
          >
            <Menu size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
    width: "100%",           // força a largura total
    alignSelf: "center",     // centraliza se estiver dentro de ScrollView
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

export default Header2;
