// IMPORTS
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedRN, { SlideInRight, SlideOutRight } from "react-native-reanimated";

import Banner from "@/components/Banner";
import BarbershopCarousel from "@/components/barbershop-carousel";
import Calendar from "@/components/Calendar";
import EventosGrid from "@/components/EventosGrid";
import Footer from "@/components/footer";
import Header from "@/components/Header";
import { EventMapItem } from "@/components/MapRJ";
import Search from "@/components/search";
import SidebarSheet from "@/components/SidebarSheet";
import { quickSearchOptions } from "@/constants/search";
import { useMenu } from "@/context/MenuContext";
import { useBanners } from "@/hooks/useBanners";
import { Barbershop } from "@/types/barbershop";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Home() {
  const [session, setSession] = useState<{ user?: { name: string } } | null>(null);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [events, setEvents] = useState<EventMapItem[]>([]);
  const { isOpen, closeMenu } = useMenu();
  const { banners, loading: loadingBanners } = useBanners();

  useEffect(() => {
    setSession({ user: { name: "Vinicius" } });

    fetch("https://ondetemeventorio.vercel.app/api/events")
      .then((res) => res.json())
      .then((data) => {
        setBarbershops(data);

        const normalizedEvents: EventMapItem[] = data
          .filter((item: any) => item.latitude != null && item.longitude != null)
          .map((item: any) => ({
            id: String(item.id),
            name: item.name,
            address: item.address ?? null,
            imageUrl: item.imageUrl ?? null,
            lat: Number(item.latitude),
            lng: Number(item.longitude),
          }));

        setEvents(normalizedEvents);
      })
      .catch((err) => console.error("Erro ao buscar eventos:", err));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[{ key: "header" }]}
        renderItem={() => null}
        keyExtractor={(item) => (typeof item === "string" ? item : item.key)}
        ListHeaderComponent={
          <View style={styles.container}>
            <Header />
            <View style={styles.padding}>
              <Text style={styles.greeting}>
                Olá, {session?.user ? session.user.name : "bem vindo"}!
              </Text>
              <Text style={styles.subtitle}>O que você gostaria de fazer hoje?</Text>

              <View style={{ marginTop: 24 }}>
                <Search />
              </View>

              <View style={styles.quickSearchHeader}>
                <Text style={styles.quickSearchTitle}>Busca Rápida</Text>
                <TouchableOpacity style={styles.seeAllRow}>
                  <Text style={styles.seeAll}>Ver todas</Text>
                  <Feather name="chevron-right" size={16} color="#f97316" />
                </TouchableOpacity>
              </View>

              <View style={styles.quickSearchContainerRow}>
                <FlatList
                  data={quickSearchOptions}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.title}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.quickOption}>
                      <Image source={getIcon(item.imageUrl)} style={styles.quickImage} />
                      <Text style={styles.quickText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {!loadingBanners && banners.length > 0 && (
                <View style={{ marginTop: 24 }}>
                  <Banner data={banners} autoPlay />
                </View>
              )}

              {barbershops.length > 0 && (
                <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Eventos para você</Text>
                    <TouchableOpacity style={styles.seeAllRow}>
                      <Text style={styles.seeAll}>Ver todas</Text>
                      <Feather name="chevron-right" size={16} color="#f97316" />
                    </TouchableOpacity>
                  </View>

                  <EventosGrid
                    barbershops={barbershops}
                    session={session}
                    onLoginPress={() => console.log("Login")}
                  />
                </View>
              )}

              <View style={{ marginTop: 32 }}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Mais Eventos</Text>
                  <TouchableOpacity style={styles.seeAllRow}>
                    <Text style={styles.seeAll}>Ver todas</Text>
                    <Feather name="chevron-right" size={16} color="#f97316" />
                  </TouchableOpacity>
                </View>

                <BarbershopCarousel
                  barbershops={barbershops}
                  isLoggedIn={!!session?.user}
                  onLoginPress={() => console.log("Login")}
                />
              </View>

              {/* {events.length > 0 && (
                <View style={{ marginTop: 32 }}>
                  <Text style={styles.sectionTitle}>Mapa de Eventos</Text>
                  <View style={{ marginTop: 16 }}>
                    <MapRJ events={events} />
                  </View>
                </View>
              )} */}

              <View style={{ marginTop: 32 }}>
                <Text style={styles.sectionTitle}>Calendário</Text>
                <View style={{ marginTop: 16 }}>
                  <Calendar />
                </View>
              </View>
            </View>
          </View>
        }
        ListFooterComponent={<Footer />}
      />

      {isOpen && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <AnimatedRN.View
            entering={SlideInRight}
            exiting={SlideOutRight}
            style={styles.sidebar}
          >
            <SidebarSheet />
          </AnimatedRN.View>
        </Pressable>
      )}
    </View>
  );
}

// ÍCONES
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
  container: { flex: 1, backgroundColor: "#fff" },
  padding: { padding: 16 },
  greeting: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 4 },
  quickSearchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 12,
  },
  quickSearchTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  seeAll: { fontSize: 14, color: "#f97316" },
  seeAllRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  quickSearchContainerRow: { paddingRight: 16, marginBottom: 8 },
  quickOption: {
    minWidth: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickImage: { width: 32, height: 32, marginBottom: 8, resizeMode: "contain" },
  quickText: { fontSize: 14, color: "#444", textAlign: "center" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: "#fff",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
