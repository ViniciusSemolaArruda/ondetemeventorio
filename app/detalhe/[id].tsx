import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Barbershop = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  ticketsUrl?: string;
  websiteUrl?: string;
  producer?: string;
  producerDescription?: string;
};

export default function BarbershopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`https://ondetemeventorio.vercel.app/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBarbershop(data);
        fetchCoordinates(data.address);
      })
      .catch((err) => console.error("Erro ao buscar evento:", err));
  }, [id]);

  const fetchCoordinates = async (address: string) => {
    const query = encodeURIComponent(address.split(" - ")[0].trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=br`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.length > 0) {
        setCoordinates({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      }
    } catch (err) {
      console.error("Erro ao buscar coordenadas:", err);
    }
  };

  if (!barbershop) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  const timeZone = "America/Sao_Paulo";
  const start = barbershop.startDate
    ? format(toZonedTime(new Date(barbershop.startDate), timeZone), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
    : null;
  const end = barbershop.endDate
    ? format(toZonedTime(new Date(barbershop.endDate), timeZone), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
    : null;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: barbershop.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{barbershop.name}</Text>
        <Text style={styles.address}>{barbershop.address}</Text>

        <Text style={styles.label}>Sobre o Evento</Text>
        <Text style={styles.description}>{barbershop.description}</Text>

        {start && <Text style={styles.time}>Início: {start}</Text>}
        {end && <Text style={styles.time}>Fim: {end}</Text>}

        {coordinates ? (
          Platform.OS !== "web" ? (
            <MapWithMarker
              lat={coordinates.lat}
              lon={coordinates.lon}
              title={barbershop.name}
            />
          ) : (
            <Text style={styles.mapError}>Mapa não disponível no navegador</Text>
          )
        ) : (
          <Text style={styles.mapError}>Localização não encontrada</Text>
        )}

        {barbershop.ticketsUrl && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL(barbershop.ticketsUrl!)}
          >
            <Text style={styles.linkText}>Comprar Ingresso</Text>
          </TouchableOpacity>
        )}

        {barbershop.websiteUrl && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL(barbershop.websiteUrl!)}
          >
            <Text style={styles.linkText}>Acessar site oficial</Text>
          </TouchableOpacity>
        )}

        {barbershop.producerDescription && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Produtora</Text>
            <Text style={styles.description}>{barbershop.producerDescription}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 250 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  address: { fontSize: 14, color: "#666", marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "bold", color: "#555", marginTop: 16 },
  description: { fontSize: 14, marginTop: 4, textAlign: "justify" },
  time: { fontSize: 14, marginTop: 8, color: "#333" },
  map: { height: 200, width: "100%", marginTop: 16 },
  mapError: { color: "red", marginTop: 16 },
  linkButton: {
    backgroundColor: "#222",
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  linkText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

// ✅ Componente para exibir mapa apenas no mobile
const MapWithMarker = ({ lat, lon, title }: { lat: number; lon: number; title: string }) => {
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);

  useEffect(() => {
    const maps = require("react-native-maps");
    setMapView(() => maps.default);
    setMarker(() => maps.Marker);
  }, []);

  if (!MapView || !Marker) return null;

  return (
    <MapView
      style={styles.map}
      region={{
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={{ latitude: lat, longitude: lon }} title={title} />
    </MapView>
  );
};
