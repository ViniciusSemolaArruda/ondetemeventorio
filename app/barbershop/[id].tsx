// app/(events)/[id]/EventDetailsScreen.tsx
// Expo Router screen that mirrors your Next.js event details page

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Calendar, ChevronLeft, Clock, MapPin, Menu } from "lucide-react-native"
import React, { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native"
import Animated, { SlideInRight, SlideOutRight } from "react-native-reanimated"
import RenderHTML from "react-native-render-html"

import Banner from "@/components/Banner"
import Footer from "@/components/footer"
import MapLocation from "@/components/MapLocation"
import SidebarSheet from "@/components/SidebarSheet"
import { useMenu } from "@/context/MenuContext"
import { useBanners } from "@/hooks/useBanners"

/* =====================
   Types
   ===================== */
export type Event = {
  id: string
  name: string
  address: string
  imageUrl: string
  description: string
  startDate: string
  endDate: string
  ticketsUrl?: string
  websiteUrl?: string
  producer?: string
  producerDescription?: string
  // optional location shapes that may come from the API
  lat?: number | string
  lng?: number | string
  latitude?: number | string
  longitude?: number | string
  location?: {
    lat?: number | string
    lng?: number | string
    lon?: number | string
  }
}

/* =====================
   Helpers
   ===================== */
function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

function extractCoords(e: Event | null): { lat: number; lng: number } | null {
  if (!e) return null
  const lat = [toNum(e.lat), toNum(e.latitude), toNum(e.location?.lat)].find(
    (v): v is number => v !== null,
  )
  const lng = [
    toNum(e.lng),
    toNum(e.longitude),
    toNum(e.location?.lng),
    toNum(e.location?.lon),
  ].find((v): v is number => v !== null)
  if (lat != null && lng != null) return { lat, lng }
  return null
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address,
    )}&limit=1&countrycodes=br`
    const r = await fetch(url, {
      headers: {
        "User-Agent": "OndeTemEventoRio/1.0 (contato@ondetemeventorio.com.br)",
        "Accept-Language": "pt-BR",
      },
    })
    if (!r.ok) return null
    const arr: { lat: string; lon: string }[] = await r.json()
    if (!Array.isArray(arr) || arr.length === 0) return null
    const lat = Number(arr[0].lat)
    const lng = Number(arr[0].lon)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
    return null
  } catch {
    return null
  }
}

/* =====================
   Screen
   ===================== */
export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { openMenu, closeMenu, isOpen } = useMenu()
  const { width: SCREEN_WIDTH } = Dimensions.get("window")
  const { width } = useWindowDimensions()

  const [event, setEvent] = useState<Event | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const { banners, loading: loadingBanners } = useBanners()

  useEffect(() => {
    if (!id) return
    void fetchEvent(String(id))
  }, [id])

  const fetchEvent = async (eventId: string) => {
    try {
      setLoading(true)
      const res = await fetch(
        `https://ondetemeventorio.vercel.app/api/events/${eventId}`,
      )
      if (!res.ok) throw new Error("Falha ao carregar o evento")
      const data: Event = await res.json()
      setEvent(data)

      const direct = extractCoords(data)
      if (direct) {
        setCoords(direct)
      } else if (data.address) {
        const viaGeo = await geocodeAddress(data.address)
        if (viaGeo) setCoords(viaGeo)
      }
    } catch (e) {
      console.error("Erro ao buscar evento:", e)
      setEvent(null)
    } finally {
      setLoading(false)
    }
  }

  const startText = useMemo(() => {
    if (!event?.startDate) return null
    try {
      return format(new Date(event.startDate), "dd 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
      })
    } catch {
      return null
    }
  }, [event?.startDate])

  const endText = useMemo(() => {
    if (!event?.endDate) return null
    try {
      return format(new Date(event.endDate), "dd 'de' MMMM 'às' HH:mm", {
        locale: ptBR,
      })
    } catch {
      return null
    }
  }, [event?.endDate])

  /* ===== Guards ===== */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c9a261" />
      </View>
    )
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Evento não encontrado.</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={[{ key: "content" }]}
        keyExtractor={(item) => item.key}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header Banner */}
            <View style={styles.bannerContainer}>
              {!!event.imageUrl && (
                <Image
                  source={{ uri: event.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ChevronLeft size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Menu"
                style={styles.menuButton}
                onPress={openMenu}
              >
                <Menu size={20} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{event.name}</Text>

              <View style={styles.infoRow}>
                <MapPin size={18} color="#FF7400" />
                <Text style={styles.infoText}>{event.address}</Text>
              </View>

              {!loadingBanners && banners.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Banner
                    data={banners.map((b) => ({
                      id: String(b.id),
                      imageUrl: b.imageUrl,
                      title: b.title,
                      displaySeconds: b.displaySeconds ?? 3,
                    }))}
                    autoPlay
                    showAdBadge
                    adText="Anuncie aqui"
                  />
                </View>
              )}

              <Text style={styles.sectionTitle}>Sobre o evento</Text>
              <RenderHTML
                contentWidth={width}
                source={{ html: event.description || "" }}
                baseStyle={{
                  fontSize: 14,
                  color: "#444",
                  lineHeight: 20,
                  textAlign: "justify",
                }}
              />

              {startText && (
                <View style={styles.infoRow}>
                  <Calendar size={18} color="#FF7400" />
                  <Text style={styles.infoText}>Início: {startText}</Text>
                </View>
              )}

              {endText && (
                <View style={styles.infoRow}>
                  <Clock size={18} color="#FF7400" />
                  <Text style={styles.infoText}>Fim: {endText}</Text>
                </View>
              )}

              {/* Map */}
              {coords && (
                <View style={{ marginTop: 0, paddingHorizontal: 16 }}>
                  <MapLocation lat={coords.lat} lon={coords.lng} name={event.name} />
                </View>
              )}

              {/* Links */}
              {event.websiteUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(event.websiteUrl!)}>
                  <Text style={styles.link}>Site oficial</Text>
                </TouchableOpacity>
              )}

              {(event.producer || event.producerDescription) && (
                <>
                  <Text style={styles.sectionTitle}>Produtora do Evento</Text>
                  {!!event.producer && (
                    <Text style={[styles.description, { fontWeight: "600" }]}>
                      {event.producer}
                    </Text>
                  )}
                  {!!event.producerDescription && (
                    <RenderHTML
                      contentWidth={width}
                      source={{ html: event.producerDescription }}
                      baseStyle={{
                        fontSize: 14,
                        color: "#444",
                        lineHeight: 20,
                        textAlign: "justify",
                      }}
                    />
                  )}
                </>
              )}
            </View>
          </>
        }
        ListFooterComponent={
          <View style={{ marginTop: 20 }}>
            <Footer />
          </View>
        }
      />

      {/* Sidebar Overlay */}
      {isOpen && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutRight}
            style={[styles.sidebar, { width: SCREEN_WIDTH * 0.8 }]}
          >
            <SidebarSheet />
          </Animated.View>
        </Pressable>
      )}
    </View>
  )
}

/* =====================
   Styles
   ===================== */
const styles = StyleSheet.create({
  bannerContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#fff",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },
  content: { paddingHorizontal: 16, paddingTop: 20 },

  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(229,231,235,0.9)",
    padding: 10,
    borderRadius: 8,
  },
  menuButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(229,231,235,0.9)",
    padding: 10,
    borderRadius: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  infoText: { flex: 1, fontSize: 14, color: "#333" },
  sectionTitle: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#999",
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginTop: 6,
    textAlign: "justify",
    paddingHorizontal: 16,
  },
  link: {
    color: "#FF7400",
    marginTop: 10,
    fontSize: 15,
    textDecorationLine: "underline",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { color: "red", textAlign: "center" },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 999,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
})
