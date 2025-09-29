// components/EventBadge.tsx (React Native)
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

export type BadgeType =
  | "acontecendo"
  | "maisEsperado"
  | "estaChegando"
  | "maisAcessado";

type Props = {
  type: BadgeType;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function EventBadge({ type, style, textStyle }: Props) {
  const map: Record<
    BadgeType,
    { label: string; bg: string; color: string; Icon: React.ReactNode }
  > = {
    acontecendo: {
      label: "Acontecendo agora",
      bg: "#F59E0B", // amber-500
      color: "#111827", // gray-900
      Icon: <Ionicons name="flash" size={14} color="#111827" style={{ marginRight: 6 }} />,
    },
    maisEsperado: {
      label: "Mais esperado",
      bg: "#EC4899", // pink-500
      color: "#FFFFFF",
      Icon: <AntDesign name="heart" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />,
    },
    estaChegando: {
      label: "Está chegando",
      bg: "#3B82F6", // blue-500
      color: "#FFFFFF",
      Icon: <Ionicons name="time" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />,
    },
    maisAcessado: {
      label: "Mais acessado",
      bg: "#FB923C", // orange-400/500
      color: "#FFFFFF",
      Icon: <Ionicons name="flame" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />,
    },
  };

  const { label, bg, color, Icon } = map[type];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      {Icon}
      <Text style={[styles.text, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8, // px-2
    paddingVertical: 6,   // py-1 ~ py-1.5
    borderRadius: 9999,   // rounded-full
    // sombra leve como no web
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  text: {
    fontSize: 12,        // text-xs
    fontWeight: "700",   // font-semibold
    letterSpacing: 0.2,
  },
});
