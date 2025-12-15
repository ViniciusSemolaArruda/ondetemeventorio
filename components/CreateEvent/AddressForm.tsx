// components/AddressForm.tsx
import MapRJ from "@/components/MapRJ";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  // venue (obrigatório pela API, mas não afeta geocoding)
  onChangeVenue: (value: string) => void;
  defaultVenue?: string;

  // endereço completo em string (usado para salvar no banco)
  onChangeLocationString: (value: string) => void;

  // campos individuais
  onChangeStreet: (value: string) => void;
  onChangeNumber: (value: string) => void;
  onChangeComplement: (value: string) => void;
  onChangeNeighborhood: (value: string) => void;
  onChangeCity: (value: string) => void;
  onChangeState: (value: string) => void;

  // coordenadas (opcionais: salvar lat/lng no pai)
  onChangeLatitude?: (value: string) => void;
  onChangeLongitude?: (value: string) => void;
  defaultLatitude?: string;
  defaultLongitude?: string;

  // endereço completo padrão (ex: quando está editando)
  defaultValue?: string;

  // defaults dos campos individuais (edição)
  defaultCep?: string;
  defaultStreet?: string;
  defaultNumber?: string;
  defaultComplement?: string;
  defaultNeighborhood?: string;
  defaultCity?: string;
  defaultState?: string;
}

type PreviewPoint = { lat: number; lng: number; address?: string | null };

const AddressForm = ({
  onChangeVenue,
  defaultVenue,

  onChangeLocationString,
  onChangeStreet,
  onChangeNumber,
  onChangeComplement,
  onChangeNeighborhood,
  onChangeCity,
  onChangeState,
  onChangeLatitude,
  onChangeLongitude,

  defaultLatitude,
  defaultLongitude,
  defaultValue,

  defaultCep,
  defaultStreet,
  defaultNumber,
  defaultComplement,
  defaultNeighborhood,
  defaultCity,
  defaultState,
}: Props) => {
  // VENUE
  const [venue, setVenue] = useState(defaultVenue ?? "");

  // CEP / endereço
  const [cep, setCep] = useState(defaultCep ?? "");
  const [showMap, setShowMap] = useState(false);

  const [street, setStreet] = useState(defaultStreet ?? "");
  const [number, setNumber] = useState(defaultNumber ?? ""); // obrigatório
  const [complement, setComplement] = useState(defaultComplement ?? "");
  const [noComplement, setNoComplement] = useState(
    !defaultComplement || defaultComplement.trim() === "",
  );
  const [neighborhood, setNeighborhood] = useState(
    defaultNeighborhood ?? "",
  );
  const [city, setCity] = useState(defaultCity ?? "");
  const [state, setState] = useState(defaultState ?? "");

  // Latitude / Longitude
  const [latitude, setLatitude] = useState(defaultLatitude ?? "");
  const [longitude, setLongitude] = useState(defaultLongitude ?? "");

  // Preview no mapa
  const [preview, setPreview] = useState<PreviewPoint | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // hidrata venue inicial e propaga
  useEffect(() => {
    const v = defaultVenue ?? "";
    setVenue(v);
    onChangeVenue(v);
  }, [defaultVenue, onChangeVenue]);

  // --------- LOCATION STRING (padrão igual ao Next) ----------
  // Ex.: "Rua X, 123, Bairro Y, Cidade Z - RJ, CEP 00000-000, Brasil"
  const locationString = useMemo(() => {
    const streetWithNumber =
      street && number ? `${street}, ${number}` : street || "";

    // CEP formatado tipo 00000-000
    const digitsCep = cep.replace(/\D/g, "");
    const cepFormatted =
      digitsCep.length === 8
        ? digitsCep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
        : "";

    const cityState =
      city && state ? `${city} - ${state}` : city || undefined;

    const parts = [
      streetWithNumber || undefined,
      !noComplement && complement ? complement : undefined,
      neighborhood || undefined,
      cityState,
      cepFormatted ? `CEP ${cepFormatted}` : undefined,
      "Brasil",
    ].filter(Boolean) as string[];

    return parts.join(", ");
  }, [
    street,
    number,
    complement,
    noComplement,
    neighborhood,
    city,
    state,
    cep,
  ]);

  // String para geocodificação (sem complemento e sem CEP, mas com "Cidade - UF")
  const geoString = useMemo(() => {
    const streetWithNumber =
      street && number ? `${street}, ${number}` : street || "";

    const cityState =
      city && state ? `${city} - ${state}` : city || undefined;

    const parts = [
      streetWithNumber || undefined,
      neighborhood || undefined,
      cityState,
      "Brasil",
    ].filter(Boolean) as string[];

    return parts.join(", ");
  }, [street, number, neighborhood, city, state]);

  // Atualiza o pai com o endereço completo (incluindo complemento)
  useEffect(() => {
    onChangeLocationString(
      defaultValue?.trim() ? defaultValue.trim() : locationString,
    );
  }, [locationString, defaultValue, onChangeLocationString]);

  // Campos obrigatórios preenchidos?
  const isAddressReadyForMap = useMemo(() => {
    return (
      venue.trim().length > 0 &&
      cep.replace(/\D/g, "").length === 8 &&
      street.trim().length > 0 &&
      number.trim().length > 0 &&
      neighborhood.trim().length > 0 &&
      city.trim().length > 0
    );
  }, [venue, cep, street, number, neighborhood, city]);

  // ---------- Geocoding usando /api/geocode ----------
  const geocodeCurrentAddress = useCallback(async () => {
    const addressFallback = defaultValue?.trim() || geoString;

    const body = {
      street: street.trim(),
      number: number.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim() || "RJ", // app é RJ, mas não força "Rio de Janeiro"
      postcode: cep.trim(),
      address: locationString || addressFallback,
    };

    if (!body.street || !body.number || !body.city) return;

    try {
      setGeocoding(true);

      const res = await fetch(
        "https://ondetemeventorio.vercel.app/api/geocode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        console.warn("Falha /api/geocode:", await res.text());
        setPreview(null);
        return;
      }

      const data = await res.json();

      if (!data?.lat || !data?.lng) {
        setPreview(null);
        return;
      }

      const latNum = Number(data.lat);
      const lngNum = Number(data.lng);

      if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
        setPreview(null);
        return;
      }

      setPreview({
        lat: latNum,
        lng: lngNum,
        address: locationString || body.address,
      });

      if (!latitude) {
        const latStr = String(latNum);
        setLatitude(latStr);
        onChangeLatitude?.(latStr);
      }
      if (!longitude) {
        const lngStr = String(lngNum);
        setLongitude(lngStr);
        onChangeLongitude?.(lngStr);
      }
    } catch (e) {
      console.warn("Geocoding error (mobile):", e);
      setPreview(null);
    } finally {
      setGeocoding(false);
    }
  }, [
    street,
    number,
    neighborhood,
    city,
    state,
    cep,
    locationString,
    defaultValue,
    geoString,
    latitude,
    longitude,
    onChangeLatitude,
    onChangeLongitude,
  ]);

  // Quando ligar “Mostrar Mapa”, tenta geocodificar se ainda não tiver coords
  useEffect(() => {
    if (showMap && !geocoding) {
      const hasManualCoords =
        latitude.trim().length > 0 && longitude.trim().length > 0;
      if (!hasManualCoords && !preview && isAddressReadyForMap) {
        geocodeCurrentAddress();
      }
    }
  }, [
    showMap,
    geocoding,
    latitude,
    longitude,
    preview,
    isAddressReadyForMap,
    geocodeCurrentAddress,
  ]);

  // ---------- CEP → ViaCEP ----------
  const handleCepChange = async (value: string) => {
    const formattedDigits = value.replace(/\D/g, "").slice(0, 8);
    setCep(formattedDigits);

    if (formattedDigits.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${formattedDigits}/json/`,
        );
        const data = await response.json();
        if (!data.erro) {
          const s = data.logradouro || "";
          const b = data.bairro || "";
          const c = data.localidade || "";
          const uf = data.uf || "";

          setStreet(s);
          setNeighborhood(b);
          setCity(c);
          setState(uf);

          onChangeStreet(s);
          onChangeNeighborhood(b);
          onChangeCity(c);
          onChangeState(uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  // Coordenadas que o mapa vai usar
  const coordsForMap = useMemo(() => {
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
      return { lat: latNum, lng: lngNum };
    }
    if (preview) {
      return { lat: preview.lat, lng: preview.lng };
    }
    return null;
  }, [latitude, longitude, preview]);

  // Dados para o MapRJ
  const previewEvent = useMemo(() => {
    if (!coordsForMap) return [];
    return [
      {
        id: "addr-preview",
        name: venue || street || "Local do evento",
        lat: coordsForMap.lat,
        lng: coordsForMap.lng,
        address: preview?.address ?? locationString,
        imageUrl: null,
      },
    ];
  }, [coordsForMap, street, venue, preview, locationString]);

  return (
    <ScrollView style={styles.container}>
      {/* VENUE */}
      <Text style={styles.label}>
        Nome do local (venue) <Text style={{ color: "#ef4444" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: Lapa 40 Graus, Circo Voador, Quadra da Portela…"
        value={venue}
        onChangeText={(text) => {
          setVenue(text);
          onChangeVenue(text);
        }}
      />

      {/* CEP */}
      <Text style={styles.label}>
        CEP <Text style={{ color: "#ef4444" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="00000-000"
        value={cep.replace(
          /^(\d{5})(\d{0,3}).*/,
          (m, a, b) => (b ? `${a}-${b}` : a),
        )}
        keyboardType="numeric"
        maxLength={9}
        onChangeText={handleCepChange}
      />

      {/* RUA */}
      <Text style={styles.label}>
        Av./Rua <Text style={{ color: "#ef4444" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da rua ou avenida"
        value={street}
        onChangeText={(text) => {
          setStreet(text);
          onChangeStreet(text);
        }}
      />

      {/* NÚMERO */}
      <Text style={styles.label}>
        Número <Text style={{ color: "#ef4444" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Número"
        value={number}
        keyboardType="default"
        onChangeText={(text) => {
          setNumber(text);
          onChangeNumber(text);
        }}
      />

      {/* COMPLEMENTO + SWITCH "SEM" */}
      <View style={styles.inlineRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={[styles.input, noComplement && styles.inputDisabled]}
            placeholder="Apto, loja, fundos… (não afeta o mapa)"
            value={complement}
            editable={!noComplement}
            onChangeText={(text) => {
              setComplement(text);
              if (!noComplement) onChangeComplement(text);
            }}
          />
        </View>

        <View style={styles.snToggle}>
          <Text style={styles.labelSmall}>Sem complemento</Text>
          <Switch
            value={noComplement}
            onValueChange={(v) => {
              setNoComplement(v);
              if (v) {
                setComplement("");
                onChangeComplement("");
              }
            }}
          />
        </View>
      </View>

      {/* BAIRRO */}
      <Text style={styles.label}>
        Bairro <Text style={{ color: "#ef4444" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={neighborhood}
        onChangeText={(text) => {
          setNeighborhood(text);
          onChangeNeighborhood(text);
        }}
      />

      {/* CIDADE */}
      <Text style={styles.label}>
        Cidade <Text style={{ color: "#ef4444" }}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={city}
        onChangeText={(text) => {
          setCity(text);
          onChangeCity(text);
        }}
      />

      {/* ESTADO */}
      <Text style={styles.label}>Estado</Text>
      <TextInput
        style={styles.input}
        placeholder="UF (ex.: RJ)"
        value={state}
        onChangeText={(text) => {
          setState(text);
          onChangeState(text);
        }}
      />

      {/* TEXTO EM VERMELHO ANTES DO SWITCH */}
      <Text style={styles.redInfo}>
        IMPORTANTE: preencher a latitude e a longitude ajuda a melhorar a
        precisão da localização do seu evento no mapa.
        {"\n"}
        Para encontrar as coordenadas no Google Maps:
        {"\n"}1) Abra o endereço do evento no Google Maps.
        {"\n"}2) Toque e segure exatamente em cima do ponto do evento no mapa
        até aparecer um pin.
        {"\n"}3) Toque nas coordenadas que aparecem embaixo e copie. O primeiro
        número é a latitude e o segundo é a longitude. Cole nos campos de
        latitude e longitude abaixo.
      </Text>

      {/* Mostrar mapa – só habilita depois dos campos obrigatórios */}
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Mostrar mapa do local</Text>
        <Switch
          value={showMap}
          onValueChange={setShowMap}
          disabled={!isAddressReadyForMap}
        />
      </View>

      {!isAddressReadyForMap && (
        <Text style={styles.redSmall}>
          Preencha primeiro: Nome do local, CEP, Av./Rua, Número, Bairro e
          Cidade para liberar o mapa.
        </Text>
      )}

      {/* Latitude / Longitude (obrigatórios quando mapa estiver ativo) */}
      {showMap && (
        <>
          <View style={styles.inlineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Latitude <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="-22.9"
                keyboardType="numeric"
                value={latitude}
                onChangeText={(text) => {
                  const normalized = text.replace(",", ".").trim();
                  setLatitude(normalized);
                  onChangeLatitude?.(normalized);
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                Longitude <Text style={{ color: "#ef4444" }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="-43.2"
                keyboardType="numeric"
                value={longitude}
                onChangeText={(text) => {
                  const normalized = text.replace(",", ".").trim();
                  setLongitude(normalized);
                  onChangeLongitude?.(normalized);
                }}
              />
            </View>
          </View>
        </>
      )}

      {/* MAPA */}
      {showMap && (
        <View style={styles.mapWrap}>
          {geocoding && !coordsForMap ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator />
              <Text style={{ marginTop: 6, color: "#555" }}>
                Localizando endereço…
              </Text>
            </View>
          ) : coordsForMap ? (
            <>
              <MapRJ
                events={previewEvent}
                onPressItem={() => {}}
                onInteractionChange={() => {}}
              />
              <TouchableOpacity
                onPress={geocodeCurrentAddress}
                disabled={geocoding}
                style={[styles.refreshBtn, geocoding && { opacity: 0.6 }]}
              >
                <Text style={styles.refreshTxt}>
                  {geocoding ? "Atualizando…" : "Sugerir coordenadas pelo mapa"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={{ color: "#555", textAlign: "center" }}>
                Preencha latitude e longitude para visualizar o mapa com
                precisão.
              </Text>
              <TouchableOpacity
                onPress={geocodeCurrentAddress}
                style={styles.refreshBtn}
              >
                <Text style={styles.refreshTxt}>
                  Tentar localizar pelo endereço
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16, padding: 12 },
  label: { fontSize: 14, fontWeight: "500", color: "#333", marginBottom: 4 },
  labelSmall: { fontSize: 12, fontWeight: "600", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  inputDisabled: { backgroundColor: "#f3f4f6" },
  inlineRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 4,
  },
  snToggle: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  redInfo: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
    marginBottom: 4,
  },
  redSmall: {
    fontSize: 11,
    color: "#dc2626",
    marginBottom: 8,
  },
  mapWrap: {
    marginTop: 6,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f8f8f8",
  },
  mapPlaceholder: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  refreshBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    margin: 10,
  },
  refreshTxt: { color: "#fff", fontWeight: "700" },
});

export default AddressForm;
