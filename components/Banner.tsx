//components\Banner.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
  interval?: number;
}

const windowWidth = Dimensions.get("window").width;

export default function Banner({
  data,
  autoPlay = true,
  interval = 5000,
}: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const effectiveInterval =
    data[currentIndex]?.displaySeconds !== undefined
      ? data[currentIndex].displaySeconds * 1000
      : interval;

  useEffect(() => {
    if (!autoPlay || data.length <= 1) return;

    timerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      scrollToIndex(nextIndex);
    }, effectiveInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, autoPlay, data.length, effectiveInterval]);

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        x: index * windowWidth * 0.8,
        animated: true,
      });
    }
  };

  const onMomentumScrollEnd = (e: any) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (windowWidth * 0.8));
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        snapToInterval={windowWidth * 0.8 + 12}
        snapToAlignment="center"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        ref={scrollRef}
      >
        {data.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.bannerItem,
              {
                width: windowWidth * 0.8,
                marginHorizontal: 6,
                transform: [{ scale: index === currentIndex ? 1 : 0.96 }],
              },
            ]}
          >
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
              i === currentIndex
                ? styles.activeIndicator
                : styles.inactiveIndicator,
            ]}
            onPress={() => scrollToIndex(i)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  bannerItem: {
    height: 200,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
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
  activeIndicator: {
    backgroundColor: "#f97316",
  },
  inactiveIndicator: {
    backgroundColor: "#cbd5e1",
  },
});
