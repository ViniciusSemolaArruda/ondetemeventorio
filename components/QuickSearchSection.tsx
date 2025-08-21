import { quickSearchOptions } from "@/constants/search";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { RootStackParamList } from "types/navigation"; // ✅

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function QuickSearchSection() {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const scrollLeft = () => {
    scrollRef.current?.scrollTo({ x: scrollX - 200, animated: true });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollTo({ x: scrollX + 200, animated: true });
  };

  return (
    <View style={{ marginTop: 24 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Busca Rápida</Text>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => navigation.navigate("Colecoes")}
        >
          <Text style={styles.linkText}>Ver todas</Text>
          <Feather name="chevron-right" size={16} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Carrossel */}
      <View style={{ position: "relative" }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          {quickSearchOptions.map((option) => (
            <TouchableOpacity
              key={option.title}
              style={styles.option}
              onPress={() =>
                navigation.navigate("Barbershops", { service: option.title })
              }
            >
              <Image
                source={getIcon(option.imageUrl)}
                style={styles.icon}
                resizeMode="contain"
              />
              <Text style={styles.optionText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {scrollX > 10 && (
          <TouchableOpacity style={styles.leftArrow} onPress={scrollLeft}>
            <Feather name="chevron-left" size={24} color="#f97316" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.rightArrow} onPress={scrollRight}>
          <Feather name="chevron-right" size={24} color="#f97316" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ICONS: Record<string, any> = {
  "/musica(1).png": require("../assets/icons/musica(1).png"),
  "/show.png": require("../assets/icons/show.png"),
  "/ano-novo.png": require("../assets/icons/ano-novo.png"),
  "/bar.png": require("../assets/icons/bar.png"),
  "/restaurante.png": require("../assets/icons/restaurante.png"),
  "/religion.png": require("../assets/icons/religion.png"),
  "/teatro.png": require("../assets/icons/teatro.png"),
  "/esporte.png": require("../assets/icons/esporte.png"),
  "/chefe-de-cozinha.png": require("../assets/icons/chefe-de-cozinha.png"),
  "/barraca-de-comida.png": require("../assets/icons/barraca-de-comida.png"),
  "/seminario.png": require("../assets/icons/seminario.png"),
  "/simposio.png": require("../assets/icons/simposio.png"),
};

const getIcon = (imageUrl: string) => ICONS[imageUrl];

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#f97316",
    marginRight: 4,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  option: {
    width: 100,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  icon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 13,
    color: "#444",
    textAlign: "center",
  },
  leftArrow: {
    position: "absolute",
    top: "40%",
    left: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 4,
    zIndex: 1,
  },
  rightArrow: {
    position: "absolute",
    top: "40%",
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 4,
    zIndex: 1,
  },
});
