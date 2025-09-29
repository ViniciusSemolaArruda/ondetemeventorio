// _lib/geo-native.ts
import * as Location from "expo-location";

export async function getUserLocationNative(): Promise<{ lat: number; lng: number } | null> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) return null;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

export async function hasLocationPermission(): Promise<boolean> {
  const perm = await Location.getForegroundPermissionsAsync();
  if (perm.status === "granted") return true;
  const req = await Location.requestForegroundPermissionsAsync();
  return req.status === "granted";
}
