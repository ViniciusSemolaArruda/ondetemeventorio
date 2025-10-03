// components/LanguageHeaderRN.tsx
import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

export type Lang = "pt" | "en" | "es";
type Option = { code: Lang; src: any; label: string; short: string };

type Props = {
  lang: Lang;
  onChange: (next: Lang) => void;
  visible?: boolean;
  style?: ViewStyle;
  options?: Option[];
  height?: number; // altura do header (compacto)
};

const DEFAULT_OPTIONS: Option[] = [
  { code: "pt", src: require("../assets/flags/brasil1.png"), label: "Português", short: "PT" },
  { code: "en", src: require("../assets/flags/estados-unidos1.png"), label: "English", short: "EN" },
  { code: "es", src: require("../assets/flags/espanha1.png"), label: "Español", short: "ES" },
];

export default function LanguageHeaderRN({
  lang,
  onChange,
  visible = true,
  style,
  options = DEFAULT_OPTIONS,
  height = 32, // bem compacto
}: Props) {
  const prog = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(prog, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: false, // animamos height
    }).start();
  }, [visible, prog]);

  const containerAnim = {
    height: prog.interpolate({ inputRange: [0, 1], outputRange: [0, height] }),
    opacity: prog,
  };

  const byCode = useMemo(() => {
    const map: Record<Lang, Option | undefined> = { pt: undefined, en: undefined, es: undefined };
    for (const o of options) map[o.code] = o;
    return map;
  }, [options]);

  const br = byCode.pt ?? options.find(o => o.code === "pt")!;
  const us = byCode.en ?? options.find(o => o.code === "en")!;
  const es = byCode.es ?? options.find(o => o.code === "es")!;

  const Flag = ({ opt }: { opt: Option }) => {
    const selected = lang === opt.code;
    return (
      <Pressable
        onPress={() => onChange(opt.code)}
        accessibilityRole="button"
        accessibilityLabel={opt.label}
        style={styles.flagBtn}
      >
        <Text style={[styles.flagText, selected && styles.flagTextSelected]}>{opt.short}</Text>
        <Image source={opt.src} style={styles.flagImg} resizeMode="cover" />
      </Pressable>
    );
  };

  return (
    <Animated.View style={[styles.root, containerAnim, style]}>
      {/* 3 colunas iguais => start / center / end, alinhadas verticalmente */}
      <View style={[styles.row, { height }]}>
        <View style={[styles.col, styles.colStart]}>
          <Flag opt={es} />
        </View>
        <View style={[styles.col, styles.colCenter]}>
          <Flag opt={br} />
        </View>
        <View style={[styles.col, styles.colEnd]}>
          <Flag opt={us} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  row: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 10,
    flexDirection: "row",
  },
  col: {
    flex: 1,
    height: "100%",
    // alinhamento vertical central pra não “dançar”
    justifyContent: "center",
  },
  colStart: { alignItems: "flex-start" },
  colCenter: { alignItems: "center" },
  colEnd: { alignItems: "flex-end" },

  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  flagText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    includeFontPadding: false, // ajuda a centralizar verticalmente no Android
    textAlignVertical: "center",
  },
  flagTextSelected: {
    color: "#FF7701",
    fontWeight: "800",
  },
  flagImg: {
    width: 18,
    height: 12,
    borderRadius: 2,
  },
});
