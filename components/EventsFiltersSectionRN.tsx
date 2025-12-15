// app/_components/EventsFiltersSectionRN.tsx
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import BarbershopsFilterRN from "./BarbershopsFilterRN";
import QuickSearchSectionRN from "./QuickSearchSectionRN";

type EventsFiltersSectionProps = {
  selectedRegion?: string;
};

export default function EventsFiltersSectionRN({
  selectedRegion,
}: EventsFiltersSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Barra com botão para abrir/fechar */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Filtros de eventos</Text>

        <TouchableOpacity
          onPress={() => setOpen((prev) => !prev)}
          style={styles.toggleButton}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleButtonText}>
            {open ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
          <Text style={[styles.chevron, open && styles.chevronOpen]}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Área que abre/fecha */}
      <View
        style={[
          styles.animatedContainer,
          open ? styles.animatedOpen : styles.animatedClosed,
        ]}
      >
        {open && (
          <>
            {/* Busca rápida (categorias) */}
            <View style={styles.section}>
              <QuickSearchSectionRN />
            </View>

            {/* Filtro de regiões */}
            <View style={[styles.section, styles.sectionBorderTop]}>
              <BarbershopsFilterRN selectedRegion={selectedRegion} />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

/* ===========================
   Estilos
=========================== */
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  headerRow: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937", // text-gray-800
  },

  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db", // border-gray-300
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151", // text-gray-700
  },
  chevron: {
    fontSize: 10,
    color: "#374151",
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },

  animatedContainer: {
    overflow: "hidden",
  },
  animatedOpen: {
    maxHeight: 900,
    opacity: 1,
  },
  animatedClosed: {
    maxHeight: 0,
    opacity: 0,
  },

  section: {
    paddingBottom: 12,
  },
  sectionBorderTop: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
});

