// MapRJ.tsx
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
  MapMarker,
  MapViewProps,
  Marker,
  PROVIDER_GOOGLE,
  Region,
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
const OUTSIDE_HIT = 12; // px de faixa clicável em volta do mapa para "sair"

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
    return {
      centerLat: parseFloat(latStr),
      centerLng: parseFloat(lngStr),
      items: list,
    };
  });
}

function computeSpiderfyOffsets(
  count: number,
  centerLat: number,
  region: Region
): { dLat: number; dLng: number }[] {
  if (count <= 1) return [{ dLat: 0, dLng: 0 }];
  const base = region.longitudeDelta;
  const min = 0.00018;
  const max = 0.0022;
  const radius = Math.min(max, Math.max(min, base * 0.015));
  const cosLat = Math.max(0.0001, Math.cos((centerLat * Math.PI) / 180));
  const dLngUnit = radius / cosLat;
  const angles = Array.from({ length: count }).map((_, i) => (2 * Math.PI * i) / count);
  return angles.map((ang) => ({
    dLat: radius * Math.sin(ang),
    dLng: dLngUnit * Math.cos(ang),
  }));
}

function shouldShowCompactCluster(region: Region, groupSize: number) {
  return groupSize > 1 && region.longitudeDelta >= 0.05;
}

/** bounding box aproximado da CAPITAL (município do Rio de Janeiro) */
function isInCapitalBounds(lat: number, lng: number) {
  const MIN_LAT = -23.1;
  const MAX_LAT = -22.75;
  const MIN_LNG = -43.8;
  const MAX_LNG = -43.0;
  return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
}

export default function MapRJ({
  loading = false,
  emptyMessage = undefined, // se não vier, usa t("no_events")
  fitOnDataChange = true,
  regionSelected,
  ...props
}: Props) {
  const { t } = useI18n();

  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<string, MapMarker | null>>({});

  const normalized = useMemo<EventMapItem[]>(() => {
    const source: (EventMapItem | BarbershopListItem)[] =
      props.events ?? props.barbershops ?? [];
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
    if (typeof props.isInteractive === "boolean") {
      setInteractive(props.isInteractive);
    }
  }, [props.isInteractive]);

  const notifyInteraction = (enabled: boolean) => {
    setInteractive(enabled);
    props.onInteractionChange?.(enabled);
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
    if (!fitOnDataChange) return;
    if (loading) return;
    const tmr = setTimeout(() => fitMarkers(), 50);
    return () => clearTimeout(tmr);
  }, [loading, filtered, fitOnDataChange, fitMarkers]);

  const onRegionChangeComplete = (r: Region) => setRegion(r);

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));
  const zoom = (factor: number) => {
    const next: Region = {
      ...region,
      latitudeDelta: clamp(region.latitudeDelta * factor, 0.002, 40),
      longitudeDelta: clamp(region.longitudeDelta * factor, 0.002, 40),
    };
    mapRef.current?.animateToRegion(next, 200);
  };

  const setMarkerRef = (id: string) => (ref: MapMarker | null): void => {
    markerRefs.current[id] = ref;
  };

  const groups = useMemo(() => groupByCoord(filtered, 6), [filtered]);
  const showEmpty = !loading && filtered.length === 0;
  const resolvedEmptyMessage = emptyMessage ?? t("no_events");

  return (
    <View style={styles.wrapper}>
      {/* ZONAS DE “CLIQUE FORA” — só aparecem quando interativo */}
      {interactive && (
        <>
          <Pressable
            style={[styles.outsideZone, { top: 0, left: 0, right: 0, height: OUTSIDE_HIT }]}
            onPress={() => notifyInteraction(false)}
            accessibilityRole="button"
            accessibilityLabel="Exit map by tapping outside"
          />
          <Pressable
            style={[styles.outsideZone, { bottom: 0, left: 0, right: 0, height: OUTSIDE_HIT }]}
            onPress={() => notifyInteraction(false)}
            accessibilityRole="button"
            accessibilityLabel="Exit map by tapping outside"
          />
          <Pressable
            style={[styles.outsideZone, { top: OUTSIDE_HIT, bottom: OUTSIDE_HIT, left: 0, width: OUTSIDE_HIT }]}
            onPress={() => notifyInteraction(false)}
            accessibilityRole="button"
            accessibilityLabel="Exit map by tapping outside"
          />
          <Pressable
            style={[styles.outsideZone, { top: OUTSIDE_HIT, bottom: OUTSIDE_HIT, right: 0, width: OUTSIDE_HIT }]}
            onPress={() => notifyInteraction(false)}
            accessibilityRole="button"
            accessibilityLabel="Exit map by tapping outside"
          />
        </>
      )}

      {/* OVERLAY: tocar para ativar */}
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

      {/* BOTÃO SAIR (opcional, mantém UX explícita) */}
      {interactive && !loading && !showEmpty && (
        <TouchableOpacity
          onPress={() => notifyInteraction(false)}
          style={styles.exitBtn}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Exit map"
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
          scrollEnabled={interactive && !loading && !showEmpty}
          zoomEnabled={interactive && !loading && !showEmpty}
          rotateEnabled={interactive && !loading && !showEmpty}
          pitchEnabled={interactive && !loading && !showEmpty}
          zoomControlEnabled={false}
          minZoomLevel={3}
          maxZoomLevel={20}
          onPress={() => !interactive && !loading && !showEmpty && notifyInteraction(true)}
        >
          {!loading &&
            !showEmpty &&
            groups.map((group) => {
              const { centerLat, centerLng, items } = group;

              if (shouldShowCompactCluster(region, items.length)) {
                const key = `cluster-${centerLat}-${centerLng}-${items.length}`;
                return (
                  <Marker
                    key={key}
                    coordinate={{ latitude: centerLat, longitude: centerLng }}
                    onPress={() => {
                      mapRef.current?.animateToRegion(
                        {
                          latitude: centerLat,
                          longitude: centerLng,
                          latitudeDelta: region.latitudeDelta * 0.5,
                          longitudeDelta: region.longitudeDelta * 0.5,
                        },
                        200
                      );
                    }}
                  >
                    <View style={styles.clusterBubble}>
                      <Text style={styles.clusterText}>{items.length}</Text>
                    </View>
                  </Marker>
                );
              }

              if (items.length > 1) {
                const offsets = computeSpiderfyOffsets(items.length, centerLat, region);
                return items.map((ev, idx) => {
                  const off = offsets[idx];
                  const lat = centerLat + off.dLat;
                  const lng = centerLng + off.dLng;

                  return (
                    <Marker
                      key={ev.id}
                      ref={setMarkerRef(ev.id)}
                      coordinate={{ latitude: lat, longitude: lng }}
                      pinColor="#FF7400"
                      anchor={{ x: 0.5, y: 1 }}
                      calloutAnchor={{ x: 0.5, y: 0 }}
                      onPress={() => {
                        if (!interactive) {
                          notifyInteraction(true);
                          setTimeout(() => markerRefs.current[ev.id]?.showCallout(), 120);
                        } else {
                          markerRefs.current[ev.id]?.showCallout();
                        }
                      }}
                      onCalloutPress={() => props.onPressItem?.(ev.id)}
                    >
                      <Callout tooltip onPress={() => props.onPressItem?.(ev.id)}>
                        <View style={styles.popup}>
                          {ev.imageUrl ? (
                            <Image source={{ uri: ev.imageUrl }} style={styles.image} />
                          ) : null}
                          <Text style={styles.name}>{ev.name}</Text>
                          {ev.address ? (
                            <Text style={styles.address}>{ev.address}</Text>
                          ) : null}
                          <View style={styles.button}>
                            <Text style={styles.buttonText}>{t("map_view_details")}</Text>
                          </View>
                        </View>
                      </Callout>
                    </Marker>
                  );
                });
              }

              const ev = items[0]!;
              return (
                <Marker
                  key={ev.id}
                  ref={setMarkerRef(ev.id)}
                  coordinate={{ latitude: ev.lat, longitude: ev.lng }}
                  pinColor="#FF7400"
                  anchor={{ x: 0.5, y: 1 }}
                  calloutAnchor={{ x: 0.5, y: 0 }}
                  onPress={() => {
                    if (!interactive) {
                      notifyInteraction(true);
                      setTimeout(() => markerRefs.current[ev.id]?.showCallout(), 120);
                    } else {
                      markerRefs.current[ev.id]?.showCallout();
                    }
                  }}
                  onCalloutPress={() => props.onPressItem?.(ev.id)}
                >
                  <Callout tooltip onPress={() => props.onPressItem?.(ev.id)}>
                    <View style={styles.popup}>
                      {ev.imageUrl ? (
                        <Image source={{ uri: ev.imageUrl }} style={styles.image} />
                      ) : null}
                      <Text style={styles.name}>{ev.name}</Text>
                      {ev.address ? (
                        <Text style={styles.address}>{ev.address}</Text>
                      ) : null}
                      <View style={styles.button}>
                        <Text style={styles.buttonText}>{t("map_view_details")}</Text>
                      </View>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    width: "100%",
    // criamos um "acolchoado" para ter área clicável fora do mapa
    padding: OUTSIDE_HIT,
  },

  // faixas invisíveis para “clicar fora e sair”
  outsideZone: {
    position: "absolute",
    backgroundColor: "transparent",
    zIndex: 20,
  },

  container: {
    width: "100%",
    height: 420,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  map: { flex: 1 },

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
  overlayCta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
  },
  lockText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },

  exitBtn: {
    position: "absolute",
    zIndex: 16,
    top: OUTSIDE_HIT + 8,
    right: OUTSIDE_HIT + 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  exitTxt: { color: "#fff", fontWeight: "800", fontSize: 14, lineHeight: 14 },

  clusterBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF7400",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  clusterText: { color: "white", fontWeight: "800" },

  popup: {
    width: screenWidth * 0.7,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: { fontWeight: "bold", fontSize: 16, marginBottom: 4, textAlign: "center" },
  address: { fontSize: 12, color: "#666", marginBottom: 8, textAlign: "center" },
  button: {
    backgroundColor: "#FF7500",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },

  loadingOverlay: {
    position: "absolute",
    zIndex: 18,
    top: OUTSIDE_HIT,
    right: OUTSIDE_HIT,
    bottom: OUTSIDE_HIT,
    left: OUTSIDE_HIT,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 12,
  },
  loadingText: { fontWeight: "600", color: "#111827" },

  emptyOverlay: {
    position: "absolute",
    zIndex: 18,
    top: OUTSIDE_HIT,
    right: OUTSIDE_HIT,
    bottom: OUTSIDE_HIT,
    left: OUTSIDE_HIT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  emptyText: { color: "#475569", fontWeight: "600", textAlign: "center" },
});
