import React, { memo, useMemo } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  selected: string[];
  onChange: (next: string[]) => void;
  title?: string;
};

// Lista padrão (ordenada depois via useMemo)
const BASE_CATEGORIES = [
  "Cultural",
  "Esportes",
  "Gastronomia",
  "Carnaval",
  "Rock",
  "Religião",
  "MPB",
  "Chorinho",
  "Forró",
  "Funk",
  "Passinho",
  "Feiras",
  "Simpósios",
  "Festivais",
  "Seminários",
  "Rodas de Samba",
  "Bossa Nova",
  "Blues",
  "Jazz",
  "Eletrônica",
  "Festas",
  "Bares",
  "Restaurantes",
];

function CategoriesSection({ selected, onChange, title = "Classifique seu evento" }: Props) {
  const data = useMemo(() => [...BASE_CATEGORIES].sort(), []);

  const toggle = (cat: string) => {
    const isSelected = selected.includes(cat);
    const next = isSelected ? selected.filter((c) => c !== cat) : [...selected, cat];
    onChange(next);
  };

  const renderItem = ({ item }: { item: string }) => {
    const checked = selected.includes(item);
    return (
      <TouchableOpacity
        key={item}
        style={styles.itemRow}
        activeOpacity={0.7}
        onPress={() => toggle(item)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={item}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
        <Text style={styles.itemLabel}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{title}</Text>

      {/* Grid responsivo em 2 colunas (padrão). Ajuste para 3/4 se quiser. */}
      <FlatList
        data={data}
        keyExtractor={(c) => c}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  listContent: {
    gap: 8,
  },
  column: {
    gap: 8,
  },
  itemRow: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  itemLabel: {
    fontSize: 13,
    color: "#374151",
  },
});

export default memo(CategoriesSection);
