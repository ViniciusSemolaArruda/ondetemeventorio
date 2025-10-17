// components/MapRJ.tsx
import { useI18n } from "@/context/I18nContext";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Region,
  type MapMarker,
  type MapViewProps,
} from "react-native-maps";

export type EventMapItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  imageUrl?: string | null;
};

export type BarbershopListItem = {
  id: string;
  name: string;
  address?: string | null;
  imageUrl?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type BaseProps = {
  onPressItem?: (id: string) => void;
  mapProps?: Partial<MapViewProps>;
  isInteractive?: boolean;
  onInteractionChange?: (enabled: boolean) => void;
  loading?: boolean;
  emptyMessage?: string;
  fitOnDataChange?: boolean;
  regionSelected?: string;
};

type Props =
  | (BaseProps & { events: EventMapItem[]; barbershops?: never })
  | (BaseProps & { events?: never; barbershops: BarbershopListItem[] });

const screenWidth = Dimensions.get("window").width;
const OUTSIDE_HIT = 12;

// ===== Helpers =====
function groupByCoord(items: EventMapItem[], precision = 6) {
  const map = new Map<string, EventMapItem[]>();
  for (const it of items) {
    const key = `${it.lat.toFixed(precision)}|${it.lng.toFixed(precision)}`;
    const arr = map.get(key);
    if (arr) arr.push(it);
    else map.set(key, [it]);
  }
  return Array.from(map.entries()).map(([key, list]) => {
    const [latStr, lngStr] = key.split("|");
    return { centerLat: parseFloat(latStr), centerLng: parseFloat(lngStr), items: list };
  });
}

function computeSpiderfyOffsets(count: number, centerLat: number, region: Region) {
  if (count <= 1) return [{ dLat: 0, dLng: 0 }];
  const base = region.longitudeDelta;
  const min = 0.00018;
  const max = 0.0022;
  const radius = Math.min(max, Math.max(min, base * 0.015));
  const cosLat = Math.max(0.0001, Math.cos((centerLat * Math.PI) / 180));
  const dLngUnit = radius / cosLat;
  const angles = Array.from({ length: count }).map((_, i) => (2 * Math.PI * i) / count);
  return angles.map((ang) => ({ dLat: radius * Math.sin(ang), dLng: dLngUnit * Math.cos(ang) }));
}

function shouldShowCompactCluster(region: Region, groupSize: number) {
  return groupSize > 1 && region.longitudeDelta >= 0.05;
}

function isInCapitalBounds(lat: number, lng: number) {
  const MIN_LAT = -23.1,
    MAX_LAT = -22.75,
    MIN_LNG = -43.8,
    MAX_LNG = -43.0;
  return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
}

// ===== Componente =====
export default function MapRJ({
  loading = false,
  emptyMessage,
  fitOnDataChange = true,
  regionSelected,
  ...props
}: Props) {
  const { t } = useI18n();

  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<string, MapMarker | null>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const makeGroupKey = (lat: number, lng: number) => `${lat.toFixed(6)}|${lng.toFixed(6)}`;

  const normalized = useMemo<EventMapItem[]>(() => {
    const source: (EventMapItem | BarbershopListItem)[] = props.events ?? props.barbershops ?? [];
    return source
      .map((item) => {
        if ("lat" in item && "lng" in item) {
          return {
            id: String(item.id),
            name: String(item.name ?? ""),
            address: item.address ?? null,
            imageUrl: item.imageUrl ?? null,
            lat: Number(item.lat),
            lng: Number(item.lng),
          };
        } else {
          const lat = item.latitude != null ? Number(item.latitude) : NaN;
          const lng = item.longitude != null ? Number(item.longitude) : NaN;
          return {
            id: String(item.id),
            name: String(item.name ?? ""),
            address: item.address ?? null,
            imageUrl: item.imageUrl ?? null,
            lat,
            lng,
          };
        }
      })
      .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng));
  }, [props.events, props.barbershops]);

  const filtered = useMemo(() => {
    if ((regionSelected ?? "").toLowerCase() === "capital") {
      return normalized.filter((p) => isInCapitalBounds(p.lat, p.lng));
    }
    return normalized;
  }, [normalized, regionSelected]);

  const defaultRegion: Region = {
    latitude: -22.9068,
    longitude: -43.1729,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  const [interactive, setInteractive] = useState<boolean>(!!props.isInteractive);
  const [region, setRegion] = useState<Region>(defaultRegion);

  useEffect(() => {
    if (typeof props.isInteractive === "boolean") setInteractive(props.isInteractive);
  }, [props.isInteractive]);

  const notifyInteraction = (enabled: boolean) => {
    setInteractive(enabled);
    props.onInteractionChange?.(enabled);
  };

  const setMarkerRef = (id: string) => (ref: MapMarker | null) => {
    markerRefs.current[id] = ref;
  };

  const fitMarkers = useCallback(() => {
    if (!mapRef.current) return;
    if (filtered.length > 0) {
      mapRef.current.fitToCoordinates(
        filtered.map((n) => ({ latitude: n.lat, longitude: n.lng })),
        { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
      );
    } else {
      mapRef.current.animateToRegion(defaultRegion, 250);
    }
  }, [filtered]);

  useEffect(() => {
    if (!fitOnDataChange || loading) return;
    const tmr = setTimeout(() => fitMarkers(), 50);
    return () => clearTimeout(tmr);
  }, [loading, filtered, fitOnDataChange, fitMarkers]);

  const onRegionChangeComplete = (r: Region) => setRegion(r);

  // abre sempre que selectedId mudar (Android-friendly)
  useEffect(() => {
    if (!selectedId) return;
    const ref = markerRefs.current[selectedId];
    if (!ref) return;
    setTimeout(() => ref.showCallout?.(), 110);
  }, [selectedId]);

  const groups = useMemo(() => groupByCoord(filtered, 6), [filtered]);
  const showEmpty = !loading && filtered.length === 0;
  const resolvedEmptyMessage = emptyMessage ?? t("no_events");

  const renderCallout = (
    id: string,
    name?: string | null,
    address?: string | null,
    imageUrl?: string | null
  ) => (
    <Callout tooltip={false} style={styles.callout}>
      <View>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
        {name ? <Text style={styles.name}>{name}</Text> : null}
        {address ? <Text style={styles.address}>{address}</Text> : null}
        <View style={styles.ctaBtn}>
          <Text style={styles.ctaTxt}>{t("map_view_details") || "Ver detalhes"}</Text>
        </View>
      </View>
    </Callout>
  );

  return (
    <View
      style={styles.wrapper}
      onTouchStart={() => !interactive && !loading && !showEmpty && notifyInteraction(true)}
    >
      {/* clicar fora */}
      {interactive && (
        <>
          <Pressable
            style={[styles.outsideZone, { top: 0, left: 0, right: 0, height: OUTSIDE_HIT }]}
            onPress={() => {
              notifyInteraction(false);
              setExpandedClusters(new Set());
              setSelectedId(null);
            }}
          />
          <Pressable
            style={[styles.outsideZone, { bottom: 0, left: 0, right: 0, height: OUTSIDE_HIT }]}
            onPress={() => {
              notifyInteraction(false);
              setExpandedClusters(new Set());
              setSelectedId(null);
            }}
          />
          <Pressable
            style={[styles.outsideZone, { top: OUTSIDE_HIT, bottom: OUTSIDE_HIT, left: 0, width: OUTSIDE_HIT }]}
            onPress={() => {
              notifyInteraction(false);
              setExpandedClusters(new Set());
              setSelectedId(null);
            }}
          />
          <Pressable
            style={[styles.outsideZone, { top: OUTSIDE_HIT, bottom: OUTSIDE_HIT, right: 0, width: OUTSIDE_HIT }]}
            onPress={() => {
              notifyInteraction(false);
              setExpandedClusters(new Set());
              setSelectedId(null);
            }}
          />
        </>
      )}

      {!interactive && !loading && !showEmpty && (
        <View pointerEvents="box-none" style={styles.overlayWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => notifyInteraction(true)}
            style={styles.overlayCta}
            accessibilityRole="button"
            accessibilityLabel={t("map_activate_map_aria")}
          >
            <Text style={styles.lockText}>{t("map_tap_to_activate")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {interactive && !loading && !showEmpty && (
        <TouchableOpacity
          onPress={() => {
            notifyInteraction(false);
            setExpandedClusters(new Set());
            setSelectedId(null);
          }}
          style={styles.exitBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.exitTxt}>×</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando mapa…</Text>
        </View>
      )}

      {showEmpty && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <Text style={styles.emptyText}>{resolvedEmptyMessage}</Text>
        </View>
      )}

      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={defaultRegion}
          {...props.mapProps}
          onMapReady={fitMarkers}
          onLayout={fitMarkers}
          onRegionChangeComplete={onRegionChangeComplete}
          onPanDrag={() => !interactive && notifyInteraction(true)}
          onTouchStart={() => !interactive && notifyInteraction(true)}
          scrollEnabled={interactive && !loading && !showEmpty}
          zoomEnabled={interactive && !loading && !showEmpty}
          rotateEnabled={interactive && !loading && !showEmpty}
          pitchEnabled={interactive && !loading && !showEmpty}
          zoomControlEnabled={false}
          minZoomLevel={3}
          maxZoomLevel={20}
          moveOnMarkerPress={false} // evita recenter que fecha o callout
        >
          {!loading &&
            !showEmpty &&
            groups.map((group) => {
              const { centerLat, centerLng, items } = group;
              const gkey = makeGroupKey(centerLat, centerLng);
              const isExpanded = expandedClusters.has(gkey);

              // Cluster compacto → toca para expandir
              if (items.length > 1 && !isExpanded && shouldShowCompactCluster(region, items.length)) {
                return (
                  <Marker
                    key={`cluster-${gkey}-${items.length}`}
                    coordinate={{ latitude: centerLat, longitude: centerLng }}
                    onPress={() => {
                      notifyInteraction(true);
                      setExpandedClusters((prev) => new Set(prev).add(gkey));
                      mapRef.current?.animateToRegion(
                        {
                          latitude: centerLat,
                          longitude: centerLng,
                          latitudeDelta: region.latitudeDelta * 0.6,
                          longitudeDelta: region.longitudeDelta * 0.6,
                        },
                        150
                      );
                    }}
                  >
                    <View style={styles.clusterBubble}>
                      <Text style={styles.clusterText}>{items.length}</Text>
                    </View>
                  </Marker>
                );
              }

              // Spiderfy (grupo expandido)
              if (items.length > 1) {
                const offs = computeSpiderfyOffsets(items.length, centerLat, region);
                return items.map((ev, idx) => {
                  const lat = centerLat + offs[idx].dLat;
                  const lng = centerLng + offs[idx].dLng;
                  return (
                    <Marker
                      key={ev.id}
                      ref={setMarkerRef(ev.id)}
                      coordinate={{ latitude: lat, longitude: lng }}
                      pinColor="#FF7400"
                      anchor={{ x: 0.5, y: 1 }}
                      calloutAnchor={{ x: 0.5, y: 0 }}
                      tracksViewChanges={false}
                      zIndex={9999}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        if (!interactive) notifyInteraction(true);
                        setSelectedId(ev.id);
                        setTimeout(() => markerRefs.current[ev.id]?.showCallout?.(), 100);
                      }}
                      onCalloutPress={() => props.onPressItem?.(ev.id)}
                    >
                      {renderCallout(ev.id, ev.name, ev.address, ev.imageUrl)}
                    </Marker>
                  );
                });
              }

              // Único ponto
              const ev = items[0]!;
              return (
                <Marker
                  key={ev.id}
                  ref={setMarkerRef(ev.id)}
                  coordinate={{ latitude: ev.lat, longitude: ev.lng }}
                  pinColor="#FF7400"
                  anchor={{ x: 0.5, y: 1 }}
                  calloutAnchor={{ x: 0.5, y: 0 }}
                  tracksViewChanges={false}
                  zIndex={9999}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    if (!interactive) notifyInteraction(true);
                    setSelectedId(ev.id);
                    setTimeout(() => markerRefs.current[ev.id]?.showCallout?.(), 100);
                  }}
                  onCalloutPress={() => props.onPressItem?.(ev.id)}
                >
                  {renderCallout(ev.id, ev.name, ev.address, ev.imageUrl)}
                </Marker>
              );
            })}
        </MapView>

        {/* máscara só visual (não clipa o callout) */}
        <View style={styles.roundMask} pointerEvents="none" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative", width: "100%", padding: OUTSIDE_HIT },
  outsideZone: { position: "absolute", backgroundColor: "transparent", zIndex: 20 },

  // ⚠️ sem overflow:hidden (isso clipa o Callout no Android)
  container: { width: "100%", height: 420, backgroundColor: "#fff" },
  map: { flex: 1 },

  // máscara apenas estética (não interfere nos toques)
  roundMask: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  overlayWrap: {
    position: "absolute",
    zIndex: 15,
    top: OUTSIDE_HIT,
    right: OUTSIDE_HIT,
    bottom: OUTSIDE_HIT,
    left: OUTSIDE_HIT,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayCta: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 10 },
  lockText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },

  exitBtn: {
    position: "absolute", zIndex: 16, top: OUTSIDE_HIT + 8, right: OUTSIDE_HIT + 8,
    backgroundColor: "rgba(0,0,0,0.6)", width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  exitTxt: { color: "#fff", fontWeight: "800", fontSize: 14, lineHeight: 14 },

  clusterBubble: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#FF7400",
    borderWidth: 2, borderColor: "white", alignItems: "center", justifyContent: "center", elevation: 6,
  },
  clusterText: { color: "white", fontWeight: "800" },

  // ===== Callout (Android-friendly) =====
  callout: {
    width: 280,                // largura fixa evita bug de medir 0
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  tipWrap: { alignItems: "center" },
  bubble: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  bubbleHeader: { flexDirection: "row" },
  closeX: { fontSize: 18, fontWeight: "800", color: "#999", paddingHorizontal: 2 },

  image: { width: "100%", height: 110, borderRadius: 8, marginBottom: 8 },
  name: { fontWeight: "700", fontSize: 15, marginBottom: 4, color: "#0f172a", textAlign: "left" },
  address: { fontSize: 12, color: "#475569", marginBottom: 10, textAlign: "left" },
  ctaBtn: { alignSelf: "flex-start", backgroundColor: "#FF7500", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  ctaTxt: { color: "#fff", fontWeight: "700" },

  loadingOverlay: {
    position: "absolute", zIndex: 18, top: OUTSIDE_HIT, right: OUTSIDE_HIT, bottom: OUTSIDE_HIT, left: OUTSIDE_HIT,
    alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 12,
  },
  loadingText: { fontWeight: "600", color: "#111827" },

  emptyOverlay: {
    position: "absolute", zIndex: 18, top: OUTSIDE_HIT, right: OUTSIDE_HIT, bottom: OUTSIDE_HIT, left: OUTSIDE_HIT,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 16,
  },
  emptyText: { color: "#475569", fontWeight: "600", textAlign: "center" },
});
