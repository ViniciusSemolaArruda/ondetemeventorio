// components/MapTeaserCard.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MapTeaserCardProps = {
  title?: string;
  subtitle?: string;
  /** Se não for passado, o componente navega para /maprj */
  onPress?: () => void;
  /** Opcional: abre /maprj já filtrando região (?region=...) */
  region?: string;
  height?: number;
};

export default function MapTeaserCard({
  title = "Ver mapa de eventos",
  subtitle = "Explore por regiões e bairros",
  onPress,
  region,
  height = 100,
}: MapTeaserCardProps) {
  const router = useRouter();

  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,        // 🔥 mais rápido
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,        // 🔥 mais rápido
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => {
      // @ts-ignore - objeto de loop tem .stop()
      loop.stop?.();
    };
  }, [pulse]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handlePress = () => {
    if (onPress) return onPress();
    const r = (region ?? "").trim();
    if (r) {
      router.push(`/MapRJ?region=${encodeURIComponent(r)}`);
    } else {
      router.push("/MapRJ");
    }
  };

  // 🔥 Pulso mais forte: maior e mais opaco no início
  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <Animated.View style={[styles.card, { height, transform: [{ scale }] }]}>
      {/* Fundo mapa estilizado */}
      <View style={styles.mapBase} />
      <View style={[styles.water, { left: 30, top: 20 }]} />
      <View style={[styles.park, { right: 40, bottom: 20 }]} />
      <View style={[styles.road, { top: 8, left: 0, width: "60%" }]} />
      <View style={[styles.road, { bottom: 8, right: 0, width: "50%" }]} />

      <Pressable
        style={styles.content}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: "rgba(0,0,0,0.1)" }}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View style={styles.left}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.right}>
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: ringScale }], opacity: ringOpacity },
            ]}
          />
          <View style={styles.pinWrap}>
            <Feather name="map-pin" size={22} color="#fff" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    width: "100%",
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    elevation: 4,
  },
  mapBase: { ...StyleSheet.absoluteFillObject, backgroundColor: "#e2e8f0" },
  water: {
    position: "absolute",
    width: 120,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#38bdf8",
    opacity: 0.25,
    transform: [{ rotate: "-10deg" }],
  },
  park: {
    position: "absolute",
    width: 90,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#22c55e",
    opacity: 0.25,
    transform: [{ rotate: "8deg" }],
  },
  road: {
    position: "absolute",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94a3b8",
    opacity: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#334155" },
  right: {
    width: 64,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f97316",
  },
  pinWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
});
