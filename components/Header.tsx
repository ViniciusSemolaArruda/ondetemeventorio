import { ROUTES } from "@/constants/route";
import { useI18n } from "@/context/I18nContext";
import { useRouter } from "expo-router";
import { Menu, Plus } from "lucide-react-native";
import React, { useMemo } from "react";
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
  // Telas muito estreitas: margens menores
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

  // ===== Cálculo para caber tudo sem corte =====
  const CARD_HPADDING = ultraNarrow ? 8 : 16; // deve espelhar o paddingHorizontal do card
  const HEADER_RIGHT_SAFE = 16;

  // Bloco da direita (menu no extremo + botão “+ Criar Evento” à esquerda)
  const BUTTONS_BLOCK_WIDTH = compact
    ? 40 /* + */ + 12 + 40 /* menu */
    : 110 /* botão menor */ + 12 + 40; // limite de largura do botão aplicado no style
  const reservedRight = BUTTONS_BLOCK_WIDTH + HEADER_RIGHT_SAFE;

  // espaço visível que sobra para a logo
  const availableLogoWidth = Math.max(0, width - reservedRight - CARD_HPADDING);

  // mantém proporção original 235x135; limita para não ficar minúscula
  const LOGO_REF_W = 235;
  const LOGO_REF_H = 135;
  const LOGO_MIN_W = 180; // nunca deixar pequena
  const aspect = LOGO_REF_W / LOGO_REF_H;

  const logoWidth = Math.min(
    LOGO_REF_W,
    Math.max(Math.min(availableLogoWidth, LOGO_REF_W), Math.min(LOGO_MIN_W, availableLogoWidth))
  );
  const logoHeight = Math.round(logoWidth / aspect);

  // puxa a logo até a borda esquerda real (compensando o padding do card)
  const leftPull = Math.min(CARD_HPADDING, 16); // não precisa mais que o padding
  const containerMinHeight = Math.max(logoHeight, 100);

  const logoStyle = useMemo(
    () => [
      styles.logo,
      {
        width: logoWidth,
        height: logoHeight,
        marginLeft: -leftPull, // alinha a logo à borda esquerda da tela
      },
    ],
    [logoWidth, logoHeight, leftPull]
  );

  return (
    <View style={[styles.card, ultraNarrow && { paddingHorizontal: 8 }]}>
      <View style={[styles.container, { paddingRight: reservedRight, minHeight: containerMinHeight }]}>
        {/* LOGO (máximo à esquerda, responsiva e sem corte) */}
        <TouchableOpacity
          accessibilityRole="imagebutton"
          accessibilityLabel="Logo Onde Tem Evento RIO?"
          activeOpacity={0.8}
        >
          <Image
            source={require("../assets/images/logo01.png")}
            style={logoStyle}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Botões absolutos à direita (menu no extremo direito; + à esquerda do menu) */}
        <View style={styles.buttonsWrap} pointerEvents="box-none">
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.buttonGhost, compact && styles.buttonGhostCompact]}
              onPress={handleCreateEvent}
              accessibilityRole="button"
              accessibilityLabel={t("header_create_event")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={16} color="#555" />
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
// const LOGO_EXTRA_LEFT = -28; // não usamos fixo; a tração agora é dinâmica

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16, // ⚠️ deve casar com CARD_HPADDING
    borderBottomWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  container: {
    minHeight: 135, // base; na prática substituído por minHeight dinâmico
    justifyContent: "center",
  },
  logo: {
    // width/height/marginLeft definidos dinamicamente
  },
  buttonsWrap: {
    position: "absolute",
    right: 16, // menu no extremo direito
    top: 12,
    bottom: 12,
    justifyContent: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // mantém "+ Criar Evento" à esquerda do menu
  },

  // 🔻 Botão + Criar Evento MENOR
  buttonGhost: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,   // antes 12
    paddingVertical: 4,     // antes 6
    borderRadius: 9999,
    backgroundColor: "#f0f0f0",
    gap: 4,                 // antes 6
    maxWidth: 110,          // evita crescer e invadir a logo
  },
  buttonGhostCompact: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  buttonText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 12,           // reduzido
  },

  // Menu como estava
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
