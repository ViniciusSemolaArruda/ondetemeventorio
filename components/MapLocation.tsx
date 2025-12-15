// components/MapLocation.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Marker,
  PROVIDER_GOOGLE,
  type MapMarker,
  type Region,
} from "react-native-maps";

import PinIcon from "@/assets/icons/pin-32x32.png";

type Props = {
  lat: number;
  lon: number;
  name: string;
  address?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BUBBLE_MAX_W = Math.min(SCREEN_WIDTH * 0.9, 340);

// 👇 AGORA TIPADO COMO React.FC<Props>
const MapLocation: React.FC<Props> = ({ lat, lon, name, address }) => {
  const mapRef = useRef<MapView | null>(null);
  const markerRef = useRef<MapMarker | null>(null);
  const [interactive, setInteractive] = useState(false);

  const [updatePin, setUpdatePin] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setUpdatePin(false), 500);
    return () => clearTimeout(t);
  }, []);

  const initialRegion: Region = useMemo(
    () => ({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    }),
    [lat, lon]
  );

  useEffect(() => {
    if (!interactive) return;
    const t = setTimeout(() => {
      mapRef.current?.animateToRegion(
        { ...initialRegion, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        160
      );
      markerRef.current?.showCallout?.();
    }, 120);
    return () => clearTimeout(t);
  }, [interactive, initialRegion]);

  return (
    <View style={styles.wrap}>
      {!interactive && (
        <View pointerEvents="box-none" style={styles.overlay}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.tapCta}
            onPress={() => setInteractive(true)}
          >
            <Text style={styles.tapTxt}>Toque para ativar o mapa</Text>
          </TouchableOpacity>
        </View>
      )}

      {interactive && (
        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() => setInteractive(false)}
        >
          <Text style={styles.exitTxt}>Sair do mapa</Text>
        </TouchableOpacity>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        zoomControlEnabled={false}
        moveOnMarkerPress={false}
        onPress={() => !interactive && setInteractive(true)}
      >
        <Marker
          ref={(r) => {
            markerRef.current = r;
          }}
          coordinate={{ latitude: lat, longitude: lon }}
          anchor={{ x: 0.5, y: 1 }}
          calloutOffset={{ x: 0, y: 6 }}
          tracksViewChanges={updatePin}
          onPress={(e) => {
            e.stopPropagation?.();
            if (!interactive) setInteractive(true);
            setTimeout(() => markerRef.current?.showCallout?.(), 80);
          }}
        >
          {/* PIN customizado */}
          <Image
            source={PinIcon}
            style={{ width: 28, height: 32 }}
            resizeMode="contain"
          />

          {/* Balão com nome + endereço */}
          <Callout tooltip>
            <View style={styles.tipWrap} renderToHardwareTextureAndroid>
              <View style={styles.bubble} collapsable={false}>
                <Text style={styles.title} numberOfLines={2}>
                  {name}
                </Text>

                {address ? (
                  <Text style={styles.address} numberOfLines={3}>
                    {address}
                  </Text>
                ) : null}

                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => markerRef.current?.hideCallout?.()}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Text style={styles.closeTxt}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.arrowBorder} />
              <View style={styles.arrow} />
            </View>
          </Callout>
        </Marker>
      </MapView>

      <View style={styles.roundMask} pointerEvents="none" />
    </View>
  );
};

export default MapLocation;

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    height: 256,
    width: "100%",
    backgroundColor: "#f1f1f1",
    position: "relative",
    borderRadius: 16,
  },
  map: { flex: 1 },

  roundMask: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  overlay: {
    position: "absolute",
    zIndex: 20,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  tapCta: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
  },
  tapTxt: { color: "#111827", fontWeight: "600", fontSize: 12 },

  exitBtn: {
    position: "absolute",
    zIndex: 21,
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exitTxt: { color: "#fff", fontWeight: "600", fontSize: 12 },

  tipWrap: { alignItems: "center" },
  bubble: {
    maxWidth: BUBBLE_MAX_W,
    minWidth: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0f172a",
    paddingRight: 22,
  },
  address: {
    marginTop: 4,
    fontSize: 13,
    color: "#4b5563",
  },
  closeBtn: { position: "absolute", right: 6, top: 6 },
  closeTxt: {
    fontSize: 18,
    lineHeight: 18,
    color: "#9ca3af",
    fontWeight: "700",
  },

  arrowBorder: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderTopWidth: 13,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#fff",
    marginTop: -1,
  },
});
