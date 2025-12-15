// app/maprj/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft, X as CloseIcon, Menu } from "lucide-react-native"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

import MapView from "react-native-map-clustering"
import {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  UrlTile,
} from "react-native-maps"

import FilterBarRN from "@/components/FilterBarRN"
import { useI18n } from "@/context/I18nContext"
import { useMenu } from "@/context/MenuContext"
import { apiHelpers, type ApiEvent } from "@/lib/api"
import type { RjRegion } from "@/lib/rjRegions"

/* ===========================
   Tipos / utils
=========================== */
type EventMapItem = {
  id: string
  name: string
  lat: number
  lng: number
  address?: string | null
  imageUrl?: string | null
}

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null
  const s = String(v).replace(",", ".").trim()
  if (s === "") return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

const inBounds = (lat: number, lng: number) =>
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180

// 👉 Região padrão (TurisRio) — mesma da web
const DEFAULT_REGION_KEY: RjRegion = "Região Metropolitana"

// Centros aproximados das regiões (TurisRio) adaptados para Region do RN
const REGION_DEFAULTS: Record<RjRegion, Region> = {
  "Região Metropolitana": {
    latitude: -22.9068,
    longitude: -43.1729,
    latitudeDelta: 0.4,
    longitudeDelta: 0.4,
  },
  "Serra Verde Imperial": {
    latitude: -22.42,
    longitude: -42.97,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
  },
  "Agulhas Negras": {
    latitude: -22.45,
    longitude: -44.45,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
  },
  "Vale do Café": {
    latitude: -22.35,
    longitude: -43.7,
    latitudeDelta: 0.8,
    longitudeDelta: 0.8,
  },
  "Caminhos Coloniais": {
    latitude: -22.8,
    longitude: -42.9,
    latitudeDelta: 0.9,
    longitudeDelta: 0.9,
  },
  "Caminhos da Serra": {
    latitude: -22.1,
    longitude: -42.5,
    latitudeDelta: 0.9,
    longitudeDelta: 0.9,
  },
  "Caminhos da Mata": {
    latitude: -21.7,
    longitude: -42.1,
    latitudeDelta: 1.0,
    longitudeDelta: 1.0,
  },
  "Costa do Sol": {
    latitude: -22.83,
    longitude: -42.03,
    latitudeDelta: 0.7,
    longitudeDelta: 0.7,
  },
  "Baixada Verde": {
    latitude: -22.7,
    longitude: -43.55,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6,
  },
  "Costa Verde": {
    latitude: -22.97,
    longitude: -44.3,
    latitudeDelta: 0.7,
    longitudeDelta: 0.7,
  },
  "Águas do Noroeste": {
    latitude: -21.5,
    longitude: -41.8,
    latitudeDelta: 1.0,
    longitudeDelta: 1.0,
  },
  "Costa Doce": {
    latitude: -21.9,
    longitude: -41.1,
    latitudeDelta: 1.0,
    longitudeDelta: 1.0,
  },
  Outras: {
    latitude: -22.7,
    longitude: -43.5,
    latitudeDelta: 1.2,
    longitudeDelta: 1.2,
  },
}

// Region padrão pro MapView
const DEFAULT_REGION: Region = REGION_DEFAULTS[DEFAULT_REGION_KEY]

const pinIcon = require("../../assets/icons/pin-32x32.png")

// Padding usado no fitToCoordinates
const MAP_EDGE_PADDING = {
  top: 100,
  right: 60,
  bottom: 120,
  left: 60,
}

// tamanhos fixos (seguro em todos devices)
const PIN_CONTAINER_SIZE = 32
const PIN_WIDTH = 24
const PIN_HEIGHT = 28

const CLUSTER_CONTAINER_SIZE = 48 // view que o Maps “fotografa”
const CLUSTER_SIZE = 36 // círculo laranja dentro da view

// tolerância para comparar coordenadas de eventos / cluster
const COORD_TOLERANCE = 0.0002 // ~20m

function isClose(a: number, b: number, tol = COORD_TOLERANCE) {
  return Math.abs(a - b) <= tol
}

/* ===========================
   Componente principal
=========================== */
export default function MapRJPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { openMenu } = useMenu()
  const { region: regionParam } = useLocalSearchParams<{ region?: string }>()

  const initialRegion = (regionParam as string) || ""

  const [selectedRegion, setSelectedRegion] = useState<RjRegion | "">(
    (initialRegion as RjRegion) ?? "",
  )
  const [loading, setLoading] = useState(true)
  const [eventsAll, setEventsAll] = useState<EventMapItem[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventMapItem | null>(null)
  const [clusterEvents, setClusterEvents] = useState<EventMapItem[] | null>(
    null,
  )

  const [mapReady, setMapReady] = useState(false)

  // ref como any pra poder usar animateToRegion / fitToCoordinates
  const mapRef = useRef<any>(null)

  useEffect(() => {
    setSelectedRegion(((regionParam as string) as RjRegion) ?? "")
    setSelectedEvent(null)
    setClusterEvents(null)
  }, [regionParam])

  /* ===========================
     Buscar eventos da API (só aprovados),
     JÁ FILTRADOS POR REGIÃO (igual web)
  =========================== */
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)

        const regionSel = (selectedRegion || "").trim()
        const data: ApiEvent[] = await apiHelpers.events(
          regionSel ? { region: regionSel } : {},
        )

        const normalized = data
          .filter((e) => e.aprovado === true)
          .map<EventMapItem>((e) => {
            const lat = toNum(e.latitude) ?? NaN
            const lng = toNum(e.longitude) ?? NaN
            return {
              id: String(e.id),
              name: e.name ?? "",
              address: e.address ?? null,
              imageUrl: e.imageUrl ?? null,
              lat,
              lng,
            }
          })
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
          .filter((p) => inBounds(p.lat, p.lng))

        if (!cancelled) setEventsAll(normalized)
      } catch (err) {
        console.error("Erro ao carregar eventos do mapa:", err)
        if (!cancelled) setEventsAll([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [selectedRegion])

  // Agora os eventos já vêm filtrados da API
  const events = eventsAll

  // Centralização / zoom
  useEffect(() => {
    if (!mapRef.current) return
    if (!mapReady) return
    if (loading) return

    const map = mapRef.current

    if (events.length > 0) {
      const coords = events.map((n) => ({
        latitude: n.lat,
        longitude: n.lng,
      }))

      const t = setTimeout(() => {
        try {
          map.fitToCoordinates(coords, {
            edgePadding: MAP_EDGE_PADDING,
            animated: true,
          })
        } catch (e) {
          console.warn("fitToCoordinates falhou, usando região padrão:", e)
          const key: RjRegion =
            (selectedRegion as RjRegion) || DEFAULT_REGION_KEY
          const fallback = REGION_DEFAULTS[key] ?? DEFAULT_REGION
          map.animateToRegion(fallback, 250)
        }
      }, 120)

      return () => clearTimeout(t)
    } else {
      const key: RjRegion =
        (selectedRegion as RjRegion) || DEFAULT_REGION_KEY
      const fallbackRegion = REGION_DEFAULTS[key] ?? DEFAULT_REGION
      map.animateToRegion(fallbackRegion, 250)
    }
  }, [events, loading, selectedRegion, mapReady])

  const providerProp =
    Platform.OS === "android" || Platform.OS === "ios"
      ? PROVIDER_GOOGLE
      : undefined

  // Quando clica no cluster: abre lista de eventos daquele ponto
  const handleClusterPress = (cluster: any) => {
    try {
      const [lng, lat] = cluster?.geometry?.coordinates ?? []
      if (typeof lat !== "number" || typeof lng !== "number") {
        return
      }

      const items = events.filter(
        (ev) => isClose(ev.lat, lat) && isClose(ev.lng, lng),
      )

      if (items.length === 0) {
        cluster?.onPress?.()
        return
      }

      if (items.length === 1) {
        const ev = items[0]!
        router.push({
          pathname: "/barbershop/[id]",
          params: { id: ev.id },
        })
        return
      }

      setSelectedEvent(null)
      setClusterEvents(items)
    } catch (e) {
      console.warn("Erro ao tratar clique no cluster", e)
      cluster?.onPress?.()
    }
  }

  // Cluster render (círculo laranja com número)
  const renderCluster = (cluster: any) => {
    const { id, geometry, properties } = cluster
    const [lng, lat] = geometry.coordinates
    const coordinate = { latitude: lat, longitude: lng }
    const pointCount = properties.point_count as number

    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={coordinate}
        onPress={() => handleClusterPress(cluster)}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View
          style={styles.clusterWrapper}
          renderToHardwareTextureAndroid
          collapsable={false}
        >
          <View style={styles.clusterBubble}>
            <Text style={styles.clusterText}>{pointCount}</Text>
          </View>
        </View>
      </Marker>
    )
  }

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          accessibilityLabel={t("back") || "Voltar"}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>
          {t("events_map") || "Mapa de Eventos"}
        </Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            try {
              openMenu()
            } catch {
              router.push("/menu")
            }
          }}
          accessibilityLabel={t("menu") || "Menu"}
        >
          <Menu size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* BOX CINZA + FilterBar */}
      <View style={styles.filterWrap}>
        <View style={styles.filterBox}>
          <FilterBarRN
            selectedRegion={selectedRegion}
            onApply={(q) => {
              setSelectedRegion((q.region as RjRegion) ?? "")
              setSelectedEvent(null)
              setClusterEvents(null)
            }}
          />
        </View>
      </View>

      {/* MAPA COM CLUSTERS */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={providerProp}
          initialRegion={DEFAULT_REGION}
          mapType="none"
          minZoomLevel={3}
          maxZoomLevel={19}
          showsCompass
          toolbarEnabled={false}
          animationEnabled
          clusteringEnabled
          spiralEnabled
          renderCluster={renderCluster}
          paddingAdjustmentBehavior="always"
          mapPadding={{ top: 80, right: 50, bottom: 100, left: 50 }}
          onMapReady={() => setMapReady(true)}
        >
          {/* Tiles tipo Leaflet (Carto Voyager) */}
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            zIndex={-1}
          />

          {/* PINS / EVENTOS */}
          {events.map((ev) => (
            <Marker
              key={ev.id}
              coordinate={{ latitude: ev.lat, longitude: ev.lng }}
              onPress={() => {
                setClusterEvents(null)
                setSelectedEvent(ev)
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View
                style={styles.pinWrapper}
                renderToHardwareTextureAndroid
                collapsable={false}
              >
                <Image
                  source={pinIcon}
                  style={styles.pinImage}
                  resizeMode="contain"
                />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* MODAL DE UM ÚNICO EVENTO (pin) */}
        {selectedEvent && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedEvent(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseIcon size={20} color="#0f172a" />
              </TouchableOpacity>

              {!!selectedEvent.imageUrl && (
                <Image
                  source={{ uri: selectedEvent.imageUrl }}
                  style={styles.modalImage}
                />
              )}

              <View style={styles.modalContent}>
                {!!selectedEvent.name && (
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selectedEvent.name}
                  </Text>
                )}

                {!!selectedEvent.address && (
                  <Text style={styles.modalAddress} numberOfLines={4}>
                    {selectedEvent.address}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() =>
                    router.push({
                      pathname: "/barbershop/[id]",
                      params: { id: selectedEvent.id },
                    })
                  }
                >
                  <Text style={styles.modalButtonText}>
                    {t("map_view_details") || "Ver detalhes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* MODAL DE LISTA DE EVENTOS DO CLUSTER */}
        {clusterEvents && (
          <View style={styles.modalOverlay}>
            <View style={styles.clusterModalCard}>
              {/* header alinhando título + X */}
              <View style={styles.clusterHeader}>
                <Text style={styles.clusterModalTitle}>
                  {t("map_cluster_events") || "Eventos neste local"}
                </Text>

                <TouchableOpacity
                  style={styles.clusterCloseBtn}
                  onPress={() => setClusterEvents(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <CloseIcon size={20} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.clusterList}>
                {clusterEvents.map((ev) => (
                  <TouchableOpacity
                    key={ev.id}
                    style={styles.clusterItem}
                    onPress={() => {
                      setClusterEvents(null)
                      router.push({
                        pathname: "/barbershop/[id]",
                        params: { id: ev.id },
                      })
                    }}
                  >
                    {!!ev.imageUrl && (
                      <Image
                        source={{ uri: ev.imageUrl }}
                        style={styles.clusterItemImage}
                      />
                    )}
                    <View style={styles.clusterItemTextBox}>
                      <Text style={styles.clusterItemTitle} numberOfLines={2}>
                        {ev.name}
                      </Text>
                      {!!ev.address && (
                        <Text
                          style={styles.clusterItemAddress}
                          numberOfLines={2}
                        >
                          {ev.address}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Loader */}
        {loading && (
          <View style={styles.blockingLoader}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        )}

        {/* Vazio */}
        {!loading && events.length === 0 && (
          <View style={styles.emptyOverlay} pointerEvents="none">
            <Text style={styles.emptyText}>
              {t("no_events") || "Sem eventos para exibir."}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

/* ===========================
   Estilos
=========================== */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    height: 56,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  filterWrap: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: "#f5f5f5",
  },
  filterBox: {
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  mapWrap: { flex: 1 },

  // PIN
  pinWrapper: {
    width: PIN_CONTAINER_SIZE,
    height: PIN_CONTAINER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  pinImage: {
    width: PIN_WIDTH,
    height: PIN_HEIGHT,
  },

  // Cluster bubble
  clusterWrapper: {
    width: CLUSTER_CONTAINER_SIZE,
    height: CLUSTER_CONTAINER_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterBubble: {
    width: CLUSTER_SIZE,
    height: CLUSTER_SIZE,
    borderRadius: CLUSTER_SIZE / 2,
    backgroundColor: "#FF7500",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  clusterText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },

  // MODAIS
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  modalContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  modalAddress: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 12,
  },
  modalButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FF7500",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },

  // Modal lista de eventos do cluster
  clusterModalCard: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 8,
  },
  clusterModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  clusterCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.04)",
  },
  clusterList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  clusterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  clusterItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 10,
  },
  clusterItemTextBox: {
    flex: 1,
  },
  clusterItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  clusterItemAddress: {
    fontSize: 12,
    color: "#475569",
  },

  blockingLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    color: "#475569",
    fontWeight: "600",
    textAlign: "center",
  },
})
