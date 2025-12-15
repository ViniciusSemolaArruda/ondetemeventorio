// components/Header2.tsx
import { useI18n } from "@/context/I18nContext";
import { useRouter } from "expo-router";
import { Menu, Undo2 } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useMenu } from "../context/MenuContext";

export default function Header2() {
  const router = useRouter();
  const { user } = useAuth();
  const { openMenu } = useMenu();
  const { t } = useI18n();
  const { width: screenW } = useWindowDimensions();

  const ultraNarrow = screenW < 330;
  const CARD_HPADDING = ultraNarrow ? 8 : 16;
  const HEADER_RIGHT_SAFE = 16;

  // mede a largura do bloco de botões (Voltar + Menu)
  const [buttonsWidth, setButtonsWidth] = useState(0);
  const reservedRight = buttonsWidth + HEADER_RIGHT_SAFE;

  // espaço restante para a logo
  const availableLogoWidth = Math.max(0, screenW - reservedRight - CARD_HPADDING);

  // parâmetros da logo (iguais ao Header)
  const LOGO_REF_W = 235;
  const LOGO_REF_H = 135;
  const LOGO_MIN_W = 180;
  const aspect = LOGO_REF_W / LOGO_REF_H;

  const logoWidth = Math.min(
    LOGO_REF_W,
    Math.max(
      Math.min(availableLogoWidth, LOGO_REF_W),
      Math.min(LOGO_MIN_W, availableLogoWidth)
    )
  );
  const logoHeight = Math.round(logoWidth / aspect);

  const leftPull = Math.min(CARD_HPADDING, 16);
  const containerMinHeight = Math.max(logoHeight, 100);

  const logoStyle = useMemo(
    () => ({
      width: logoWidth,
      height: logoHeight,
      marginLeft: -leftPull,
    }),
    [logoWidth, logoHeight, leftPull]
  );

  const handleGoBack = () => {
    try {
      // @ts-ignore compat
      if (router.canGoBack && router.canGoBack()) router.back();
      else router.push("/home");
    } catch {
      router.push("/home");
    }
  };
  const handleLogoPress = () => router.push("/home");

  return (
    <View style={[styles.card, ultraNarrow && { paddingHorizontal: 8 }]}>
      <View style={[styles.container, { paddingRight: reservedRight, minHeight: containerMinHeight }]}>
        {/* Logo no mesmo tamanho do Header */}
        <TouchableOpacity onPress={handleLogoPress} accessibilityLabel="Logo" activeOpacity={0.8}>
          <Image
            source={require("../assets/images/logo01.png")}
            style={logoStyle}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Botões absolutos à direita */}
        <View
          style={styles.buttonsWrap}
          pointerEvents="box-none"
          onLayout={(e) => setButtonsWidth(e.nativeEvent.layout.width)}
        >
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.buttonGhost}
              onPress={handleGoBack}
              accessibilityRole="button"
              accessibilityLabel={t("header_back")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Undo2 size={18} color="#555" />
              <Text style={styles.buttonText}>{t("header_back")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, !user && styles.attentionPing]}
              onPress={openMenu}
              accessibilityRole="button"
              accessibilityLabel={t("header2_menu_aria")}
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
    width: "100%",
    alignSelf: "center",
  },
  container: {
    justifyContent: "center",
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
  buttonText: {
    color: "#555",
    fontWeight: "600",
  },
  iconButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  attentionPing: {
    borderColor: "#007AFF",
  },
});
