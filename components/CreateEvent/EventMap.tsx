import React from "react"
import { StyleSheet, Text, View } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"

interface EventMapProps {
  showMap: boolean
  latitude: number
  longitude: number
  address?: string
}

const EventMap = ({ showMap, latitude, longitude, address }: EventMapProps) => {
  if (!showMap) return null

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return <Text style={styles.errorText}>Coordenadas inválidas para o mapa</Text>
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE} // pode remover se quiser usar Apple Maps no iOS
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} title="Local do Evento">
          {address && (
            <View style={styles.popup}>
              <Text style={styles.popupTitle}>Local do Evento:</Text>
              {address.split(",").map((part, i) => (
                <Text key={i} style={styles.popupText}>
                  {part.trim()}
                </Text>
              ))}
            </View>
          )}
        </Marker>
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 300,
    borderRadius: 10,
    overflow: "hidden",
    borderColor: "#ccc",
    borderWidth: 1,
    marginTop: 12,
  },
  map: {
    flex: 1,
  },
  errorText: {
    color: "red",
    padding: 12,
  },
  popup: {
    backgroundColor: "white",
    padding: 6,
    borderRadius: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  popupTitle: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
  },
  popupText: {
    fontSize: 12,
  },
})

export default EventMap
