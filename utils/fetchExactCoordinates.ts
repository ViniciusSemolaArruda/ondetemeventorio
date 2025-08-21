// utils/fetchExactCoordinates.ts
export type LatLng = { lat: number; lng: number } | null;

export async function fetchExactCoordinates(fullAddress: string): Promise<LatLng> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const url = `https://nominatim.openstreetmap.org/search?` +
    `format=jsonv2&limit=1&countrycodes=br&addressdetails=0&` +
    `q=${encodeURIComponent(fullAddress)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        // Nominatim exige um User-Agent identificável
        "User-Agent": "ondetemeventorio/1.0 (contato: seu-email@dominio.com)",
        "Accept": "application/json",
      },
    });

    const text = await res.text(); // sempre leia como texto primeiro para debugar

    if (!res.ok) {
      console.error("Geocode HTTP error:", res.status, res.statusText, text);
      return null;
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Resposta não-JSON do geocoder:", text);
      return null;
    }

    if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (err) {
    console.error("Erro na geocodificação:", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
