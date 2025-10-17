// app/debug-map.tsx
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, {
    Callout,
    Marker,
    PROVIDER_GOOGLE,
    type MapMarker,
} from "react-native-maps";

export default function DebugMap() {
  const markerRef = useRef<MapMarker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // tenta abrir automaticamente quando o MAPA estiver pronto
  useEffect(() => {
    if (!mapReady) return;
    const t = setTimeout(() => markerRef.current?.showCallout?.(), 350);
    return () => clearTimeout(t);
  }, [mapReady]);

  return (
    <View style={styles.wrap}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: -22.9068,
          longitude: -43.1729,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        moveOnMarkerPress={false} // evita recentrar e fechar o callout
        onMapReady={() => setMapReady(true)}
        onLayout={() => setMapReady(true)} // duplo gatilho: alguns devices só disparam um deles
      >
        <Marker
          // ⚠️ callback-ref sem retorno (void), pra não dar erro de tipo
          ref={(r) => { markerRef.current = r; }}
          coordinate={{ latitude: -22.9068, longitude: -43.1729 }}
          pinColor="#FF7400"
          anchor={{ x: 0.5, y: 1 }}
          calloutAnchor={{ x: 0.5, y: 0 }}
          tracksViewChanges={false}
          title="Teste callout" // Fallback: abre o callout padrão se o custom falhar
          onPress={(e) => {
            e.stopPropagation?.();
            // pequena espera ajuda no Android
            setTimeout(() => markerRef.current?.showCallout?.(), 60);
          }}
        >
          {/* tooltip para ter o “rabinho”; no Android funciona bem com conteúdo fixo */}
          <Callout tooltip>
            {/* renderToHardwareTextureAndroid + collapsable={false} => evita medição 0x0 */}
            <View style={styles.tipWrap} renderToHardwareTextureAndroid>
              <View style={styles.bubble} collapsable={false}>
                <Text style={styles.title}>Funcionou 🎉</Text>
                <Text style={styles.subtitle}>Balão saindo do pin</Text>
                <TouchableOpacity onPress={() => markerRef.current?.hideCallout?.()}>
                  <Text style={styles.link}>Fechar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.arrowBorder} />
              <View style={styles.arrow} />
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ⚠️ NÃO usar overflow:'hidden' aqui — isso corta o Callout no Android
  wrap: { flex: 1, backgroundColor: "#fff", overflow: "visible" },

  tipWrap: { alignItems: "center" },
  bubble: {
    minWidth: 220,
    maxWidth: 320,
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
  title: { fontWeight: "800", fontSize: 16, color: "#0f172a" },
  subtitle: { marginTop: 4, color: "#334155" },
  link: { marginTop: 8, color: "#FF7400", fontWeight: "700" },

  arrowBorder: {
    width: 0, height: 0,
    borderLeftWidth: 11, borderRightWidth: 11, borderTopWidth: 13,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  arrow: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 12,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderTopColor: "#fff",
    marginTop: -1,
  },
});
