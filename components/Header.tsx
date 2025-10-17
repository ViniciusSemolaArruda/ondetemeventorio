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
  useWindowDimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

export default function Header() {
  const { user } = useAuth();
  const { openMenu } = useMenu();
  const router = useRouter();
  const { t } = useI18n();
  const { width } = useWindowDimensions();

  // Telas pequenas: botão só com ícone (logo permanece intacta)
  const compact = width < 360;
  // Telas muito estreitas: evitamos deslocar a logo para a esquerda
  const ultraNarrow = width < 330;

  const handleCreateEvent = () => {
    if (!user) {
      Toast.show({
        type: "info",
        text1: t("header_login_required"),
        text2: t("login_desc"),
        position: "bottom",
        visibilityTime: 3000,
      });
      return;
    }
    router.push(ROUTES.CREATE_EVENT);
  };

  // Reserva de espaço para o bloco de botões à direita
  const HEADER_RIGHT_SAFE = 16;
  const BUTTONS_BLOCK_WIDTH = compact ? 56 + 12 + 40 : 140; // ícone criar + gap + menu OU rótulo completo
  const reservedRight = BUTTONS_BLOCK_WIDTH + HEADER_RIGHT_SAFE;

  return (
    <View style={[styles.card, ultraNarrow && { paddingHorizontal: 8 }]}>
      <View style={[styles.container, { paddingRight: reservedRight }]}>
        {/* LOGO fixa (não some e não encolhe) */}
        <TouchableOpacity
          accessibilityRole="imagebutton"
          accessibilityLabel="Logo Onde Tem Evento RIO?"
          activeOpacity={0.8}
        >
          <Image
            source={require("../assets/images/logo01.png")}
            style={[styles.logo, ultraNarrow && { marginLeft: 0 }]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Botões absolutos à direita (não sobrepõem por causa do paddingRight do container) */}
        <View style={styles.buttonsWrap} pointerEvents="box-none">
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.buttonGhost, compact && styles.buttonGhostCompact]}
              onPress={handleCreateEvent}
              accessibilityRole="button"
              accessibilityLabel={t("header_create_event")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={18} color="#555" />
              {!compact && (
                <Text style={styles.buttonText}>{t("header_create_event")}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, !user && styles.attentionPing]}
              onPress={openMenu}
              accessibilityRole="button"
              accessibilityLabel={t("header_menu_aria")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Menu size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ================= Styles ================= */
const LOGO_EXTRA_LEFT = -28;

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
  },
  container: {
    minHeight: 135, // combina com a altura da logo
    justifyContent: "center",
    // paddingRight é definido dinamicamente no render para reservar a faixa dos botões
  },
  logo: {
    width: 235,
    height: 135,
    marginLeft: LOGO_EXTRA_LEFT, // “puxa” a marca sem cortar; será zerado em telas muito estreitas
  },
  buttonsWrap: {
    position: "absolute",
    right: 16,
    top: 12,
    bottom: 12,
    justifyContent: "center",
  },
  buttonsRow: {
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
  buttonGhostCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
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
