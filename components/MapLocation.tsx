// components/MapLocation.tsx
import React, { useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

type Props = {
  lat: number;
  lon: number;
  name: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MapLocation({ lat, lon, name }: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [interactive, setInteractive] = useState(false);

  const [region, setRegion] = useState<Region>({
    latitude: lat,
    longitude: lon,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const initialRegion: Region = useMemo(
    () => ({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [lat, lon]
  );

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const zoom = (factor: number) => {
    const next: Region = {
      ...region,
      latitudeDelta: clamp(region.latitudeDelta * factor, 0.002, 40),
      longitudeDelta: clamp(region.longitudeDelta * factor, 0.002, 40),
    };
    mapRef.current?.animateToRegion(next, 200);
    setRegion(next);
  };

  return (
    <View style={styles.wrap}>
      {/* Overlay para liberar interação */}
      {!interactive && (
        <View pointerEvents="box-none" style={styles.overlay}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.tapCta}
            onPress={() => setInteractive(true)}
          >
            <Text style={styles.tapTxt}>Toque para interagir</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botão para “travar” novamente */}
      {interactive && (
        <TouchableOpacity style={styles.exitBtn} onPress={() => setInteractive(false)}>
          <Text style={styles.exitTxt}>Sair do mapa</Text>
        </TouchableOpacity>
      )}

      {/* 🔹 Botões de Zoom (apenas quando interativo) */}
      {/* {interactive && (
        <View style={styles.zoomWrap}>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(0.6)}>
            <Text style={styles.zoomTxt}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoom(1.4)}>
            <Text style={styles.zoomTxt}>－</Text>
          </TouchableOpacity>
        </View>
      )} */}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        region={region}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        zoomControlEnabled={false}
        onRegionChangeComplete={setRegion}
        onPress={() => !interactive && setInteractive(true)}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lon }}
          pinColor="#FF7400"                 
          anchor={{ x: 0.5, y: 1 }}
          calloutAnchor={{ x: 0.5, y: 0 }}
        >
          {/* Callout funciona normalmente com o pin padrão */}
          <Callout tooltip>
            <View style={styles.callout}>
              <Text style={styles.title}>{name}</Text>
              <Text style={styles.subtitle}>
                {lat.toFixed(5)}, {lon.toFixed(5)}
              </Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    height: 256,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f1f1",
  },
  map: { flex: 1 },

  overlay: {
    position: "absolute",
    zIndex: 9998,
    top: 0, right: 0, bottom: 0, left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tapCta: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
  },
  tapTxt: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },

  exitBtn: {
    position: "absolute",
    zIndex: 9999,
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exitTxt: { color: "#fff", fontWeight: "600", fontSize: 12 },

  // 🔹 Zoom buttons
  zoomWrap: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 9999,
    gap: 8,
  },
  zoomBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  zoomTxt: { color: "#fff", fontSize: 20, fontWeight: "800" },

  callout: {
    width: SCREEN_WIDTH * 0.6,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 4,
  },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 12, color: "#666", textAlign: "center" },
});
