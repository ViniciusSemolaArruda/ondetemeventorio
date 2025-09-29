// components/Banner.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string;
  displaySeconds?: number; // tempo por slide (em segundos)
}

interface BannerProps {
  data: BannerItem[];
  autoPlay?: boolean;
  interval?: number; // fallback em ms quando não houver displaySeconds
  showAdBadge?: boolean;
  adText?: string;
}

const windowWidth = Dimensions.get("window").width;
const CARD_WIDTH = windowWidth * 0.8;
const GAP = 12; // precisa bater com marginHorizontal*2 do item

export default function Banner({
  data,
  autoPlay = true,
  interval = 5000,
  showAdBadge = false,
  adText = "Anúncio",
}: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);

  const snapInterval = CARD_WIDTH + GAP; // precisa bater com snapToInterval
  const effectiveInterval =
    (data[currentIndex]?.displaySeconds ?? interval / 1000) * 1000;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      setCurrentIndex(clamped);
      if (scrollRef.current) {
        const x = clamped * snapInterval; // width + gap
        scrollRef.current.scrollTo({ x, animated });
      }
    },
    [data.length]
  );

  const scheduleNext = useCallback(() => {
    if (!autoPlay || data.length <= 1 || isDraggingRef.current) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      const next = (currentIndex + 1) % data.length;
      scrollToIndex(next);
    }, effectiveInterval);
  }, [autoPlay, data.length, currentIndex, effectiveInterval, scrollToIndex]);

  useEffect(() => {
    scheduleNext();
    return clearTimer;
  }, [scheduleNext]);

  useEffect(() => {
    if (currentIndex > data.length - 1) {
      scrollToIndex(0, false);
    }
  }, [data.length, currentIndex, scrollToIndex]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / snapInterval);
    setCurrentIndex(Math.max(0, Math.min(index, data.length - 1)));
    isDraggingRef.current = false;
    scheduleNext();
  };

  const onScrollBeginDrag = () => {
    isDraggingRef.current = true;
    clearTimer();
  };

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={snapInterval}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        contentContainerStyle={{ paddingHorizontal: GAP / 2 }}
      >
        {data.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.bannerItem,
              {
                width: CARD_WIDTH,
                marginHorizontal: GAP / 2,
                transform: [{ scale: index === currentIndex ? 1 : 0.96 }],
              },
            ]}
          >
            {/* Badge alternado: mostra apenas nos índices pares (0,2,4,...) */}
            {showAdBadge && index % 2 === 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{adText}</Text>
              </View>
            )}

            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicators}>
        {data.map((_, i) => (
          <TouchableOpacity
            key={`indicator-${i}`}
            style={[
              styles.indicator,
              i === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
            ]}
            onPress={() => scrollToIndex(i)}
            activeOpacity={0.8}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  bannerItem: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  image: { width: "100%", height: "100%" },
  // badge
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  // dots
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  activeIndicator: { backgroundColor: "#f97316" },
  inactiveIndicator: { backgroundColor: "#cbd5e1" },
});
