// components/AnimatedIntro.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import pinImg from "@/assets/icons/PinBranco.png";
import logoImg from "@/assets/icons/restoLOGOBranca.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ORANGE = "#FF7400";

interface Props {
  onFinish: () => void;
}

/** ===== Layout responsivo ===== */
const gapHorizontal = 5; // ✅ distância TOTAL entre pin e logo
const rowPadding = 16;

// largura disponível para cada item
const availableWidth =
  (SCREEN_WIDTH - rowPadding * 2 - gapHorizontal) / 2;

// altura segura (não passa da tela)
const availableHeight = SCREEN_HEIGHT * 0.48;

// tamanho final único (ambos iguais)
const SHARED_SIZE = Math.min(
  availableWidth,
  availableHeight,
  560 // teto seguro pra telas grandes
);

const PIN_SIZE = SHARED_SIZE;
const LOGO_SIZE = SHARED_SIZE;

/** ===== Timings ===== */
const WAIT_BEFORE_PIN_MS = 1000;
const ASSET_WAIT_FALLBACK_MS = 800;

export default function AnimatedIntro({ onFinish }: Props) {
  const dropY = useRef(new Animated.Value(-SCREEN_HEIGHT * 0.6)).current;
  const pinScale = useRef(new Animated.Value(0.96)).current;
  const pinOpacity = useRef(new Animated.Value(0)).current;

  const logoOpacity = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const finishedRef = useRef(false);

  const [pinLoaded, setPinLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [pinFailed, setPinFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const paintedRef = useRef(false);
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        paintedRef.current = true;
      });
    });
  }, []);

  useEffect(() => {
    const START = Date.now();
    const MIN_TOTAL_MS = 4800;
    let started = false;

    const maybeStart = () => {
      if (started) return;

      const assetsReady =
        (pinLoaded || pinFailed) && (logoLoaded || logoFailed);

      if (!paintedRef.current || !assetsReady) return;
      started = true;

      const pinAnim = Animated.sequence([
        Animated.delay(WAIT_BEFORE_PIN_MS),
        Animated.parallel([
          Animated.timing(pinOpacity, {
            toValue: 1,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(dropY, {
            toValue: 0,
            speed: 6,
            bounciness: 10,
            useNativeDriver: true,
          }),
          Animated.timing(pinScale, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]);

      Animated.sequence([
        pinAnim,
        Animated.delay(1000),
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;

        const elapsed = Date.now() - START;
        const rest = Math.max(0, MIN_TOTAL_MS - elapsed);

        InteractionManager.runAfterInteractions(() => {
          setTimeout(onFinish, rest);
        });
      });
    };

    const fallback = setTimeout(() => {
      if (!started) {
        setPinFailed(v => v || !pinLoaded);
        setLogoFailed(v => v || !logoLoaded);
        maybeStart();
      }
    }, ASSET_WAIT_FALLBACK_MS);

    const check = setInterval(() => {
      maybeStart();
      if (started) clearInterval(check);
    }, 50);

    const kill = setTimeout(() => {
      if (!finishedRef.current) onFinish();
    }, 8000);

    return () => {
      clearTimeout(fallback);
      clearInterval(check);
      clearTimeout(kill);
    };
  }, [
    dropY,
    onFinish,
    pinOpacity,
    pinScale,
    pinLoaded,
    logoLoaded,
    pinFailed,
    logoFailed,
    containerOpacity,
  ]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.introOverlay,
        { opacity: containerOpacity, backgroundColor: ORANGE },
      ]}
    >
      <StatusBar backgroundColor={ORANGE} barStyle="light-content" animated />

      <View style={styles.bgOrange} />

      <View style={[styles.introRow, { paddingHorizontal: rowPadding }]}>
        {/* PIN */}
        {pinFailed ? (
          <View style={[styles.introPin, styles.fallbackBox]} />
        ) : (
          <Animated.Image
            source={pinImg}
            resizeMode="contain"
            onLoad={() => setPinLoaded(true)}
            onError={() => setPinFailed(true)}
            style={[
              styles.introPin,
              {
                opacity: pinOpacity,
                transform: [{ translateY: dropY }, { scale: pinScale }],
              },
            ]}
          />
        )}

        {/* LOGO */}
        {logoFailed ? (
          <View style={[styles.introLogo, styles.fallbackBox]} />
        ) : (
          <Animated.Image
            source={logoImg}
            resizeMode="contain"
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoFailed(true)}
            style={[styles.introLogo, { opacity: logoOpacity }]}
          />
        )}
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
  bgOrange: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ORANGE,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  introPin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    marginRight: gapHorizontal / 2, // 2.5px
  },
  introLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginLeft: gapHorizontal / 2, // 2.5px → total 5px
  },
  fallbackBox: {
    backgroundColor: "#ffe5d0",
    borderRadius: 16,
  },
});
