// components/FilterBarRN.tsx
import { MapPin } from "lucide-react-native";
import React, { useMemo } from "react";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

// sua fonte de regiões
import { RJ_REGIONS } from "../lib/rjRegions";

type Props = {
  onApply: (query: { region: string }) => void;
  selectedRegion?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  allLabel?: string; // i18n: texto para "todas as regiões"
  title?: string;
};

const CARD_W = 150;
const CARD_H = 110;
const GAP = 12;

export default function FilterBarRN({
  onApply,
  selectedRegion = "",
  backgroundColor = "transparent", // não cria “caixa” diferente
  style,
  allLabel = "Todas as regiões",
  title = "Regiões",
}: Props) {
  // "" = todas as regiões
  const data = useMemo(() => ["", ...RJ_REGIONS], []);

  const apply = (value: string) => onApply({ region: value });

  const renderItem = ({ item }: { item: string }) => {
    const value = item; // "" | nome da região
    const label = item === "" ? allLabel : item;
    const selected = (selectedRegion ?? "") === value;

    return (
      <Pressable
        onPress={() => apply(value)}
        style={[
          styles.card,
          {
            width: CARD_W,
            height: CARD_H,
            borderColor: selected ? "#ff7a00" : "#e5e7eb",
          },
          selected && { shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
        ]}
        android_ripple={{ color: "#eee" }}
      >
        <MapPin size={26} color={selected ? "#ff7a00" : "#6b7280"} />
        <Text
          numberOfLines={2}
          style={[
            styles.cardText,
            { color: selected ? "#111827" : "#374151" },
            selected && { fontWeight: "700" },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { backgroundColor }, style]}>
      {/* título no mesmo padrão das outras seções */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* lista horizontal SEM padding lateral extra */}
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item) => (item === "" ? "all" : item)}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // sem paddingHorizontal aqui — o pai (Home) já tem padding 16
    // mantenha apenas um leve espaço vertical
    paddingTop: 4,
    paddingBottom: 4,
  },
  headerRow: {
    // sem paddingHorizontal — alinha com as demais sections
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  listContent: {
    paddingHorizontal: 0, // importantíssimo para alinhar à esquerda
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
});
