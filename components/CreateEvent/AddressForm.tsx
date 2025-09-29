import MapRJ from "@/components/MapRJ";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  onChangeLocationString: (value: string) => void;
  onChangeStreet: (value: string) => void;
  onChangeNumber: (value: string) => void;
  onChangeComplement: (value: string) => void;
  onChangeNeighborhood: (value: string) => void;
  onChangeCity: (value: string) => void;
  onChangeState: (value: string) => void;
  defaultValue?: string;
}

type PreviewPoint = { lat: number; lng: number; address?: string | null };

const AddressForm = ({
  onChangeLocationString,
  onChangeStreet,
  onChangeNumber,
  onChangeComplement,
  onChangeNeighborhood,
  onChangeCity,
  onChangeState,
  defaultValue,
}: Props) => {
  const [cep, setCep] = useState("");
  const [showMap, setShowMap] = useState(false);

  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Rio de Janeiro");
  const [state, setState] = useState("RJ");

  // Preview no mapa
  const [preview, setPreview] = useState<PreviewPoint | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // Ao receber um valor default (endereço completo), preenche a string e tenta geocodificar quando abrir o mapa
  useEffect(() => {
    if (defaultValue) {
      onChangeLocationString(defaultValue);
    }
  }, [defaultValue, onChangeLocationString]);

  // Monta a string de endereço e envia pro pai
  const locationString = useMemo(() => {
    const parts = [
      street && `${street}${number ? `, ${number}` : ""}`,
      complement,
      neighborhood,
      city,
      state,
      "Brasil",
    ].filter(Boolean);
    return parts.join(", ");
  }, [street, number, complement, neighborhood, city, state]);

  useEffect(() => {
    // Se veio um defaultValue, prioriza ele; senão usa a string composta
    onChangeLocationString(defaultValue?.trim() ? defaultValue.trim() : locationString);
  }, [locationString, defaultValue, onChangeLocationString]);

  // Geocodifica endereço atual (string composta ou default)
  const geocodeCurrentAddress = useCallback(async () => {
    const query = (defaultValue?.trim() || locationString).trim();
    if (!query) return;

    try {
      setGeocoding(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1&countrycodes=br`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "OndeTemEventoRio/1.0 (contato@seudominio.com)",
          "Accept-Language": "pt-BR",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { lat: string; lon: string; display_name?: string }[];
      if (!Array.isArray(data) || data.length === 0) {
        // limpa preview se não achar
        setPreview(null);
        return;
      }
      const { lat, lon, display_name } = data[0];
      setPreview({
        lat: Number(lat),
        lng: Number(lon),
        address: display_name || query,
      });
    } catch (e) {
      console.warn("Geocoding error:", e);
      setPreview(null);
    } finally {
      setGeocoding(false);
    }
  }, [locationString, defaultValue]);

  // Quando ligar o Mostrar Mapa, geocodifica se ainda não tiver preview
  useEffect(() => {
    if (showMap && !preview && !geocoding) {
      geocodeCurrentAddress();
    }
  }, [showMap, preview, geocoding, geocodeCurrentAddress]);

  // CEP → ViaCEP
  const handleCepChange = async (value: string) => {
    const formatted = value.replace(/\D/g, "").slice(0, 8);
    setCep(formatted);

    if (formatted.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formatted}/json/`);
        const data = await response.json();
        if (!data.erro) {
          const s = data.logradouro || "";
          const b = data.bairro || "";
          const c = data.localidade || "Rio de Janeiro";
          const uf = data.uf || "RJ";

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

  // Dados para o MapRJ (um único ponto)
  const previewEvent = useMemo(() => {
    if (!preview) return [];
    return [
      {
        id: "addr-preview",
        name: street || "Local do evento",
        lat: preview.lat,
        lng: preview.lng,
        address: preview.address ?? locationString,
        imageUrl: null,
      },
    ];
  }, [preview, street, locationString]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>CEP</Text>
      <TextInput
        style={styles.input}
        placeholder="00000-000"
        value={cep.replace(/^(\d{5})(\d{0,3}).*/, (m, a, b) => (b ? `${a}-${b}` : a))}
        keyboardType="numeric"
        maxLength={9}
        onChangeText={handleCepChange}
      />

      <Text style={styles.label}>Av./Rua</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da rua ou avenida"
        value={street}
        onChangeText={(text) => {
          setStreet(text);
          onChangeStreet(text);
        }}
      />

      <Text style={styles.label}>Número</Text>
      <TextInput
        style={styles.input}
        placeholder="Número"
        value={number}
        onChangeText={(text) => {
          setNumber(text);
          onChangeNumber(text);
        }}
      />

      <Text style={styles.label}>Complemento</Text>
      <TextInput
        style={styles.input}
        placeholder="Complemento"
        value={complement}
        onChangeText={(text) => {
          setComplement(text);
          onChangeComplement(text);
        }}
      />

      <Text style={styles.label}>Bairro</Text>
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={neighborhood}
        onChangeText={(text) => {
          setNeighborhood(text);
          onChangeNeighborhood(text);
        }}
      />

      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={city}
        onChangeText={(text) => {
          setCity(text);
          onChangeCity(text);
        }}
      />

      <Text style={styles.label}>Estado</Text>
      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={state}
        onChangeText={(text) => {
          setState(text);
          onChangeState(text);
        }}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Mostrar Mapa</Text>
        <Switch value={showMap} onValueChange={setShowMap} />
      </View>

      {showMap && (
        <View style={styles.mapWrap}>
          {geocoding && !preview ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator />
              <Text style={{ marginTop: 6, color: "#555" }}>Localizando endereço…</Text>
            </View>
          ) : preview ? (
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
                <Text style={styles.refreshTxt}>{geocoding ? "Atualizando…" : "Atualizar mapa"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={{ color: "#555", textAlign: "center" }}>
                Preencha o endereço para visualizar no mapa.
              </Text>
              <TouchableOpacity onPress={geocodeCurrentAddress} style={styles.refreshBtn}>
                <Text style={styles.refreshTxt}>Ver no mapa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
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
