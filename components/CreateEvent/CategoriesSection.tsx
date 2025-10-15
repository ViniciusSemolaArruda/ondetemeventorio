import React, { memo, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  selected: string[];                 // mantém compat para quem usa múltipla
  onChange: (next: string[]) => void;
  title?: string;
  single?: boolean;                   // << novo: modo seleção única
};

const BASE_CATEGORIES = [
  "Cinema","Esportes","Gastronomia","Carnaval","Rock","Religiões","MPB","Chorinho","Forró",
  "Funk","Passinho","Feiras","Simpósios","Festivais","Seminários","Rodas de Samba","Bossa Nova",
  "Blues","Jazz","Eletrônica","Festas","Bares","Restaurantes","Parques","Agronegócio",
  "Meio Ambiente","Teatro","Família","Stand Up Comedy",
];

function CategoriesSection({ selected, onChange, title = "Classifique seu evento", single = false }: Props) {
  const data = useMemo(() => [...BASE_CATEGORIES].sort(), []);

  const toggle = (cat: string) => {
    if (single) {
      // seleção única: substitui tudo por [cat] (ou [] se tocar na mesma)
      const isSelected = selected[0] === cat;
      onChange(isSelected ? [] : [cat]);
    } else {
      const isSelected = selected.includes(cat);
      const next = isSelected ? selected.filter((c) => c !== cat) : [...selected, cat];
      onChange(next);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const checked = selected.includes(item);
    return (
      <TouchableOpacity
        key={item}
        style={[styles.itemRow, checked && styles.itemRowChecked]}
        activeOpacity={0.7}
        onPress={() => toggle(item)}
        accessibilityRole={single ? "radio" : "checkbox"}
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
  wrapper: { marginBottom: 24 },
  label: { marginBottom: 8, fontSize: 14, fontWeight: "600", color: "#374151" },
  listContent: { gap: 8 },
  column: { gap: 8 },
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
  itemRowChecked: {
    borderColor: "#2563eb",
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
  itemLabel: { fontSize: 13, color: "#374151" },
});

export default memo(CategoriesSection);
