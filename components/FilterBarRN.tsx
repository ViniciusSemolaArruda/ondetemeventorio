// components/FilterBarRN.tsx
import { useI18n } from "@/context/I18nContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MapPin } from "lucide-react-native"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native"
import { RJ_REGIONS } from "../lib/rjRegions"

type Props = {
  onApply: (query: { region: string }) => void
  selectedRegion?: string
  persistKey?: string
  backgroundColor?: string
  style?: ViewStyle
  /** Pode ser chave i18n (ex.: "all_regions") ou texto literal. */
  allLabel?: string
  /** Pode ser chave i18n (ex.: "filter_regions") ou texto literal. */
  title?: string

  /** ✅ região padrão quando não houver nada salvo (default: Região Metropolitana) */
  defaultRegion?: string
}

const CARD_W = 150
const CARD_H = 110
const GAP = 12

const DEFAULT_STORAGE_KEY = "@ote:selectedRegion"
const DEFAULT_REGION_FALLBACK = "Região Metropolitana" // ✅ padrão

export default function FilterBarRN({
  onApply,
  selectedRegion = "",
  persistKey = DEFAULT_STORAGE_KEY,
  backgroundColor = "transparent",
  style,
  allLabel = "filter_all_regions",
  title = "filter_regions",
  defaultRegion = DEFAULT_REGION_FALLBACK,
}: Props) {
  const { t } = useI18n()
  const [currentRegion, setCurrentRegion] = useState<string>(selectedRegion ?? "")

  const data = useMemo(() => ["", ...RJ_REGIONS], [])

  const tr = useCallback(
    (maybeKeyOrText: string) => {
      const translated = t(maybeKeyOrText)
      if (!translated || translated === maybeKeyOrText) return maybeKeyOrText
      return translated
    },
    [t],
  )

  const titleText = useMemo(() => tr(title).trim(), [title, tr])
  const allLabelText = useMemo(() => tr(allLabel), [allLabel, tr])

  const isValidRegion = useCallback((value: string) => {
    if (value === "") return true // permite "Todas as regiões"
    return RJ_REGIONS.includes(value as any)
  }, [])

  const applyRegion = useCallback(
    async (value: string) => {
      setCurrentRegion(value)
      try {
        await AsyncStorage.setItem(persistKey, value)
      } catch {}
      onApply({ region: value })
    },
    [onApply, persistKey],
  )

  // ✅ Inicialização: se não veio selectedRegion do pai, tenta AsyncStorage.
  // Se não tiver/for inválido, cai na Região Metropolitana.
  useEffect(() => {
    let alive = true

    ;(async () => {
      // Se o pai já mandou uma região, respeita
      const fromParent = (selectedRegion ?? "").trim()
      if (fromParent && isValidRegion(fromParent)) {
        if (!alive) return
        setCurrentRegion(fromParent)
        return
      }

      // tenta do storage
      let stored = ""
      try {
        stored = (await AsyncStorage.getItem(persistKey)) ?? ""
      } catch {}

      const candidate = (stored ?? "").trim()
      const finalValue =
        candidate && isValidRegion(candidate)
          ? candidate
          : (defaultRegion ?? DEFAULT_REGION_FALLBACK)

      if (!alive) return

      setCurrentRegion(finalValue)

      // garante que salva e aplica (pra não começar vazio)
      try {
        await AsyncStorage.setItem(persistKey, finalValue)
      } catch {}

      onApply({ region: finalValue })
    })()

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // reflete mudanças do pai depois (ex: veio via query param)
  useEffect(() => {
    const v = (selectedRegion ?? "").trim()
    if (!v) return
    if (!isValidRegion(v)) return
    setCurrentRegion(v)
  }, [selectedRegion, isValidRegion])

  const handleSelect = useCallback(
    async (value: string) => {
      await applyRegion(value)
    },
    [applyRegion],
  )

  const renderItem = ({ item }: { item: string }) => {
    const value = item
    const label = item === "" ? allLabelText : item
    const selected = (currentRegion ?? "") === value

    return (
      <Pressable
        onPress={() => handleSelect(value)}
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
    )
  }

  return (
    <View style={[styles.wrap, { backgroundColor }, style]}>
      {titleText.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={styles.title}>{titleText}</Text>
        </View>
      )}

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
  )
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 0, paddingBottom: 0 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  listContent: { paddingHorizontal: 0, paddingVertical: 0 },
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
  cardText: { marginTop: 8, textAlign: "center", fontSize: 13, fontWeight: "600" },
})
