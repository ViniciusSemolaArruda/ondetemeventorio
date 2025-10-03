import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  StyleSheet,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ORANGE = "#f97316";

interface Props {
  onFinish: () => void;
}

/** ==== TAMANHOS (ajuste aqui se quiser) ==== */
const LOGO_SIZE = SCREEN_WIDTH * 0.44;
const PIN_SIZE  = SCREEN_WIDTH * 0.44;

export default function AnimatedIntro({ onFinish }: Props) {
  const dropY = useRef(new Animated.Value(-220)).current; // início mais alto para a queda
  const pinScale = useRef(new Animated.Value(0.9)).current;
  const logoX = useRef(new Animated.Value(160)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const bgPulse = useRef(new Animated.Value(0.18)).current;
  const finishedRef = useRef(false);

  const cols = 6;
  const rows = 11;
  const cellW = SCREEN_WIDTH / cols;
  const cellH = SCREEN_HEIGHT / rows;

  useEffect(() => {
    const START = Date.now();
    const MIN_TOTAL_MS = 5000;

    const pinLine = Animated.parallel([
      Animated.spring(dropY, {
        toValue: 0, // alinha base com a logo
        speed: 5,
        bounciness: 12,
        useNativeDriver: true,
      }),
      Animated.timing(pinScale, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const logoLine = Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(logoX, {
          toValue: 0,
          duration: 720,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    Animated.sequence([
      Animated.parallel([pinLine, logoLine]),
      Animated.delay(1600),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      const elapsed = Date.now() - START;
      const remaining = Math.max(0, MIN_TOTAL_MS - elapsed);

      InteractionManager.runAfterInteractions(() => {
        setTimeout(onFinish, remaining);
      });
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulse, {
          toValue: 0.32,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
          // @ts-ignore
          isInteraction: false,
        }),
        Animated.timing(bgPulse, {
          toValue: 0.18,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
          // @ts-ignore
          isInteraction: false,
        }),
      ])
    ).start();

    const kill = setTimeout(() => {
      if (!finishedRef.current) onFinish();
    }, 8000);
    return () => clearTimeout(kill);
  }, [bgPulse, containerOpacity, dropY, logoOpacity, logoX, onFinish, pinScale]);

  const backgroundMarks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const big = (r + c) % 2 === 0;
      backgroundMarks.push(
        <Animated.Text
          key={`q-${r}-${c}`}
          style={{
            position: "absolute",
            left: c * cellW + cellW * 0.22,
            top: r * cellH + cellH * 0.16,
            fontSize: big ? 36 : 28,
            fontWeight: "900",
            color: ORANGE,
            opacity: bgPulse,
          }}
        >
          ?
        </Animated.Text>
      );
    }
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.introOverlay, { opacity: containerOpacity }]}
    >
      <View style={styles.bgWhite}>{backgroundMarks}</View>

      <View style={styles.introRow}>
        <Animated.Image
          source={require("../assets/icons/pin.png")}
          resizeMode="contain"
          style={[
            styles.introPin,
            { transform: [{ translateY: dropY }, { scale: pinScale }] },
          ]}
        />
        <Animated.Image
          source={require("../assets/icons/restoLOGO.png")}
          resizeMode="contain"
          style={[
            styles.introLogo,
            { opacity: logoOpacity, transform: [{ translateX: logoX }] },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  bgWhite: { ...StyleSheet.absoluteFillObject, backgroundColor: "#ffffff" },
  introRow: {
    flexDirection: "row",
    alignItems: "flex-end", // alinha pela base
    justifyContent: "center",
    paddingHorizontal: 8,   // menos espaço lateral
  },
  introPin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    marginRight: 4,         // distância menor
  },
  introLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginLeft: 2,          // distância menor
  },
});
