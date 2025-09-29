import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
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
  /** Se passado, controla o estado de interação de fora */
  isInteractive?: boolean;
  /** Informa mudanças de interação para o pai */
  onInteractionChange?: (enabled: boolean) => void;
};

type Props =
  | (BaseProps & { events: EventMapItem[]; barbershops?: never })
  | (BaseProps & { events?: never; barbershops: BarbershopListItem[] });

const screenWidth = Dimensions.get("window").width;

export default function MapRJ(props: Props) {
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

  const defaultRegion: Region = {
    latitude: -22.9068,
    longitude: -43.1729,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  const [interactive, setInteractive] = useState<boolean>(!!props.isInteractive);
  const [region, setRegion] = useState<Region>(defaultRegion);

  // sincroniza com o controle externo, se vier
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
    if (!mapRef.current || normalized.length === 0) return;
    mapRef.current.fitToCoordinates(
      normalized.map((n) => ({ latitude: n.lat, longitude: n.lng })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true }
    );
  }, [normalized]);

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

  return (
    <View style={styles.container} /* o pai mede este container */>
      {/* Overlay de instrução */}
      {!interactive && (
        <View pointerEvents="box-none" style={styles.overlayWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => notifyInteraction(true)}
            style={styles.overlayCta}
          >
            <Text style={styles.lockText}>Clique para interagir</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botão para sair (opcional além do “clicar fora”) */}
      {interactive && (
        <TouchableOpacity
          onPress={() => notifyInteraction(false)}
          style={styles.exitBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.exitTxt}>Sair do mapa</Text>
        </TouchableOpacity>
      )}

      {/* Zoom + / - */}
      {/* <View pointerEvents="box-none" style={styles.zoomWrap}>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(0.6)}>
          <Text style={styles.zoomTxt}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(1.4)}>
          <Text style={styles.zoomTxt}>－</Text>
        </TouchableOpacity>
      </View> */}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={defaultRegion}
        {...props.mapProps}
        onMapReady={fitMarkers}
        onLayout={fitMarkers}
        onRegionChangeComplete={onRegionChangeComplete}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        zoomControlEnabled={false}
        minZoomLevel={3}
        maxZoomLevel={20}
        // dentro do mapa: só ENTRA em modo interativo. Sair é pelo botão ou pelo backdrop do PAI.
        onPress={() => !interactive && notifyInteraction(true)}
      >
        {normalized.map((ev) => (
          <Marker
            key={ev.id}
            ref={setMarkerRef(ev.id)}
            coordinate={{ latitude: ev.lat, longitude: ev.lng }}
            pinColor="#FF7400"           // 🎯 cor exata do pin
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
                {ev.address ? <Text style={styles.address}>{ev.address}</Text> : null}
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Ver detalhes</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 420, borderRadius: 12, overflow: "hidden" },
  map: { flex: 1 },

  overlayWrap: {
    position: "absolute",
    zIndex: 9998,
    top: 0, right: 0, bottom: 0, left: 0,
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
    zIndex: 9999,
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exitTxt: { color: "#fff", fontWeight: "600", fontSize: 12 },

  zoomWrap: {
    position: "absolute",
    right: 12,
    bottom: 12,
    zIndex: 9999,
    gap: 8,
  },
  zoomBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  zoomTxt: { color: "#fff", fontSize: 22, fontWeight: "800", lineHeight: 22 },

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
});
