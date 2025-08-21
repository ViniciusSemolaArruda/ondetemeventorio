import React, { useMemo } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";

export type EventMapItem = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  imageUrl?: string | null;
};

export type BarbershopListItem = {
  id: string;
  name: string;
  address?: string | null;
  imageUrl?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

type Props =
  | {
      events: EventMapItem[];
      barbershops?: never;
    }
  | {
      events?: never;
      barbershops: BarbershopListItem[];
    };

const screenWidth = Dimensions.get("window").width;

export default function MapRJ(props: Props) {
  const normalized = useMemo<EventMapItem[]>(() => {
    const source: (EventMapItem | BarbershopListItem)[] =
      props.events ?? props.barbershops ?? [];

    return source
      .map((item) => {
        if ("lat" in item && "lng" in item) {
          return {
            id: String(item.id),
            name: String(item.name ?? ""),
            address: item.address ?? null,
            imageUrl: item.imageUrl ?? null,
            lat: Number(item.lat),
            lng: Number(item.lng),
          };
        } else {
          const lat = item.latitude != null ? Number(item.latitude) : NaN;
          const lng = item.longitude != null ? Number(item.longitude) : NaN;
          return {
            id: String(item.id),
            name: String(item.name ?? ""),
            address: item.address ?? null,
            imageUrl: item.imageUrl ?? null,
            lat,
            lng,
          };
        }
      })
      .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng));
  }, [props.events, props.barbershops]);

  console.log("📍 Normalized eventos:", normalized); // ✅ agora está fora do useMemo

  const defaultRegion: Region = {
    latitude: -22.9068,
    longitude: -43.1729,
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  };

  return (
    <View style={styles.container}>
      <MapView
  style={styles.map}
  initialRegion={defaultRegion}
  showsUserLocation={false}
  showsMyLocationButton={false}
>
  {normalized.map((ev) => (
    <Marker
      key={ev.id}
      coordinate={{ latitude: ev.lat, longitude: ev.lng }}
      title={ev.name}
    >
            <Callout tooltip>
              <View style={styles.popup}>
                {ev.imageUrl && (
                  <Image source={{ uri: ev.imageUrl }} style={styles.image} />
                )}
                <Text style={styles.name}>{ev.name}</Text>
                {ev.address && (
                  <Text style={styles.address}>{ev.address}</Text>
                )}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    console.log("Ver detalhes de:", ev.id);
                    // navigation.push("Detalhes", { id: ev.id }) se usar React Navigation
                  }}
                >
                  <Text style={styles.buttonText}>Ver detalhes</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 420,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  popup: {
    width: screenWidth * 0.7,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  address: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF7500",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
