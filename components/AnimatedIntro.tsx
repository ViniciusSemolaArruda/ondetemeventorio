// components/AnimatedIntro.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  StyleSheet,
  View,
} from "react-native";

import pinImg from "@/assets/icons/pin.png";
import logoImg from "@/assets/icons/restoLOGO.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ORANGE = "#f97316";

interface Props {
  onFinish: () => void;
}

/** ===== Tamanhos/espaços (seguros e ajustáveis) ===== */
const gapHorizontal = 4;              // ↓ mais perto um do outro (antes 12)
const rowPadding = 16;
const widthCap = (SCREEN_WIDTH - rowPadding * 2 - gapHorizontal) / 2;
const heightCap = SCREEN_HEIGHT * 0.36; // ↑ pode crescer mais (antes 0.32)
const MAX_SIZE = 520;                   // ↑ teto maior, ainda limitado pela tela
const SHARED_SIZE = Math.min(widthCap, heightCap, MAX_SIZE);

const LOGO_SIZE = SHARED_SIZE;
const PIN_SIZE = SHARED_SIZE;

/** Offsets horizontais para posicionar melhor cada imagem */
const PIN_SHIFT_X = -22;   // ↶ empurra o pin mais para a esquerda
const LOGO_SHIFT_X = -8;   // ↶ aproxima o logo do pin

/** ===== Espera visível antes do pin cair ===== */
const WAIT_BEFORE_PIN_MS = 1000;

/** Fallback de carregamento de imagem */
const ASSET_WAIT_FALLBACK_MS = 800;

export default function AnimatedIntro({ onFinish }: Props) {
  // pin começa fora da tela (bem acima) e invisível
  const dropY = useRef(new Animated.Value(-SCREEN_HEIGHT * 0.7)).current;
  const pinScale = useRef(new Animated.Value(0.94)).current;
  const pinOpacity = useRef(new Animated.Value(0)).current; // invisível até a queda

  // logo parado e visível desde o começo
  const logoX = useRef(new Animated.Value(LOGO_SHIFT_X)).current; // puxa logo um pouco à esquerda
  const logoOpacity = useRef(new Animated.Value(1)).current;

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const bgPulse = useRef(new Animated.Value(0.18)).current;
  const finishedRef = useRef(false);

  // estados de carregamento das imagens
  const [pinLoaded, setPinLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [pinFailed, setPinFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  // garante primeiro paint antes de animar
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
    const MIN_TOTAL_MS = 5000;

    let started = false;
    const maybeStart = () => {
      if (started) return;
      const assetsReady =
        (pinLoaded || pinFailed) && (logoLoaded || logoFailed);
      if (!paintedRef.current || !assetsReady) return;
      started = true;

      const pinLine = Animated.sequence([
        Animated.delay(WAIT_BEFORE_PIN_MS),
        Animated.parallel([
          Animated.timing(pinOpacity, {
            toValue: 1,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(dropY, {
            toValue: 0,
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
        ]),
      ]);

      Animated.sequence([
        pinLine,
        Animated.delay(1200),
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 760,
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

      // fundo “?” pulsando
      Animated.loop(
        Animated.sequence([
          Animated.timing(bgPulse, {
            toValue: 0.3,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
            // @ts-ignore
            isInteraction: false,
          }),
          Animated.timing(bgPulse, {
            toValue: 0.18,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
            // @ts-ignore
            isInteraction: false,
          }),
        ])
      ).start();
    };

    // fallback caso imagens demorem
    const assetFallback = setTimeout(() => {
      if (!started) {
        setPinFailed((v) => v || !pinLoaded);
        setLogoFailed((v) => v || !logoLoaded);
        maybeStart();
      }
    }, ASSET_WAIT_FALLBACK_MS);

    const readyCheck = setInterval(() => {
      maybeStart();
      if (started) clearInterval(readyCheck);
    }, 50);

    const kill = setTimeout(() => {
      if (!finishedRef.current) onFinish();
    }, 8000);

    return () => {
      clearTimeout(assetFallback);
      clearInterval(readyCheck);
      clearTimeout(kill);
    };
  }, [bgPulse, containerOpacity, dropY, onFinish, pinOpacity, pinScale, pinLoaded, logoLoaded, pinFailed, logoFailed]);

  // grade decorativa
  const cols = 6;
  const rows = 11;
  const cellW = SCREEN_WIDTH / cols;
  const cellH = SCREEN_HEIGHT / rows;
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

      <View style={[styles.introRow, { paddingHorizontal: rowPadding }]}>
        {/* PIN — começa invisível e “fora do céu” */}
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
                transform: [
                  { translateX: PIN_SHIFT_X }, // empurra para a esquerda
                  { translateY: dropY },
                  { scale: pinScale },
                ],
              },
            ]}
          />
        )}

        {/* LOGO — visível desde o início */}
        {logoFailed ? (
          <View style={[styles.introLogo, styles.fallbackBox]} />
        ) : (
          <Animated.Image
            source={logoImg}
            resizeMode="contain"
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoFailed(true)}
            style={[
              styles.introLogo,
              { opacity: logoOpacity, transform: [{ translateX: logoX }] },
            ]}
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
  bgWhite: { ...StyleSheet.absoluteFillObject, backgroundColor: "#ffffff" },
  introRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  introPin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    marginRight: gapHorizontal / 2,
  },
  introLogo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginLeft: gapHorizontal / 2,
  },
  fallbackBox: {
    backgroundColor: "#ffe5d0",
    borderRadius: 16,
  },
});
