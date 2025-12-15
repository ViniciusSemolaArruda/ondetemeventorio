// components/Banner.tsx
import { Image as ExpoImage } from "expo-image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string;
  displaySeconds?: number;
}

interface BannerProps {
  data: BannerItem[];
  autoPlay?: boolean;
  interval?: number; // fallback em ms quando não houver displaySeconds
}

const GAP = 12;
const BANNER_HEIGHT = 200;

export default function Banner({
  data,
  autoPlay = true,
  interval = 5000,
}: BannerProps) {
  const { width: windowWidth } = useWindowDimensions();
  const CARD_WIDTH = Math.round(windowWidth * 0.8);
  const snapInterval = useMemo(() => CARD_WIDTH + GAP, [CARD_WIDTH]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  const effectiveInterval = useMemo(() => {
    const seconds = data[currentIndex]?.displaySeconds ?? interval / 1000;
    return seconds * 1000;
  }, [data, currentIndex, interval]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: clamped * snapInterval, animated });
      }
      currentIndexRef.current = clamped;
      setCurrentIndex((prev) => (prev !== clamped ? clamped : prev));
    },
    [data.length, snapInterval]
  );

  const scheduleNext = useCallback(() => {
    if (!autoPlay || data.length <= 1 || isDraggingRef.current) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (appStateRef.current !== "active") return; // pausa autoplay em background
      const next = (currentIndexRef.current + 1) % data.length;
      scrollToIndex(next);
    }, effectiveInterval);
  }, [autoPlay, data.length, effectiveInterval, clearTimer, scrollToIndex]);

  useEffect(() => {
    scheduleNext();
    return clearTimer;
  }, [scheduleNext, clearTimer]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      appStateRef.current = state;
      if (state !== "active") clearTimer();
      else scheduleNext();
    });
    return () => sub.remove();
  }, [clearTimer, scheduleNext]);

  useEffect(() => {
    if (currentIndex > data.length - 1) scrollToIndex(0, false);
  }, [data.length, currentIndex, scrollToIndex]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / snapInterval);
      currentIndexRef.current = index;
      setCurrentIndex(index);
      isDraggingRef.current = false;
      scheduleNext();
    },
    [scheduleNext, snapInterval]
  );

  const onScrollBeginDrag = useCallback(() => {
    isDraggingRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const onPressDot = useCallback(
    (i: number) => {
      clearTimer();
      scrollToIndex(i);
      scheduleNext();
    },
    [clearTimer, scrollToIndex, scheduleNext]
  );

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        snapToInterval={snapInterval}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        contentContainerStyle={{ paddingHorizontal: GAP / 2 }}
        removeClippedSubviews
        scrollEventThrottle={16}
      >
        {data.map((item) => (
          <View
            key={item.id}
            style={[
              styles.bannerItem,
              {
                width: CARD_WIDTH,
                marginHorizontal: GAP / 2,
              },
            ]}
          >
            <ExpoImage
              source={{ uri: item.imageUrl }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="disk"
              transition={100}
            />
          </View>
        ))}
      </ScrollView>

      {/* Indicadores embaixo */}
      <View style={styles.indicators}>
        {data.map((_, i) => (
          <TouchableOpacity
            key={`indicator-${i}`}
            style={[
              styles.indicator,
              i === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
            onPress={() => onPressDot(i)}
            activeOpacity={0.8}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, alignItems: "center" },
  bannerItem: {
    height: BANNER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  image: { width: "100%", height: "100%" },

  // indicadores abaixo do banner
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  activeIndicator: { backgroundColor: "#f97316" },
  inactiveIndicator: { backgroundColor: "#cbd5e1" },
});
