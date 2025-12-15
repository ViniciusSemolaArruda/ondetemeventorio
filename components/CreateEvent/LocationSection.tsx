// components/LocationSection.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AddressForm from "./AddressForm";

interface Props {
  // ✅ venue (nome do local)
  onChangeVenue: (value: string) => void;
  defaultVenue?: string;

  // 📍 Endereço completo em string (para mostrar/editar)
  defaultValue?: string;

  // 📦 Campos individuais (para edição / defaults vindos do banco)
  defaultCep?: string;
  defaultStreet?: string;
  defaultNumber?: string;
  defaultComplement?: string;
  defaultNeighborhood?: string;
  defaultCity?: string;
  defaultState?: string;

  // 🔁 callbacks para salvar no pai
  onChangeLocationString: (value: string) => void;
  onChangeStreet: (value: string) => void;
  onChangeNumber: (value: string) => void;
  onChangeComplement: (value: string) => void;
  onChangeNeighborhood: (value: string) => void;
  onChangeCity: (value: string) => void;
  onChangeState: (value: string) => void;

  /** Coordenadas padrão (opcional, para edição) */
  defaultLatitude?: string;
  defaultLongitude?: string;

  /** Callbacks opcionais para salvar latitude/longitude no pai */
  onChangeLatitude?: (value: string) => void;
  onChangeLongitude?: (value: string) => void;

  /** Modo somente leitura */
  readOnly?: boolean;
}

const LocationSection = ({
  // venue
  onChangeVenue,
  defaultVenue = "",

  // endereço “cheio” em string
  defaultValue,

  // defaults individuais
  defaultCep,
  defaultStreet,
  defaultNumber,
  defaultComplement,
  defaultNeighborhood,
  defaultCity,
  defaultState,

  // coordenadas
  defaultLatitude,
  defaultLongitude,
  onChangeLatitude,
  onChangeLongitude,

  // modo leitura
  readOnly = false,

  // callbacks para o pai
  onChangeLocationString,
  onChangeStreet,
  onChangeNumber,
  onChangeComplement,
  onChangeNeighborhood,
  onChangeCity,
  onChangeState,
}: Props) => {
  if (readOnly) {
    return (
      <View style={styles.section}>
        <Text style={styles.heading}>4. Onde o seu evento vai acontecer?</Text>

        <Text style={styles.labelInline}>Nome do local (venue)</Text>
        <Text style={styles.readOnlyText}>
          {defaultVenue?.trim() || "Não informado"}
        </Text>

        <View style={{ height: 10 }} />

        <Text style={styles.labelInline}>Endereço</Text>
        <Text style={styles.readOnlyText}>
          {defaultValue ?? "Endereço não disponível"}
        </Text>

        {/* Extra opcional: cidade/bairro/UF em modo leitura */}
        {(defaultNeighborhood || defaultCity || defaultState) && (
          <>
            <View style={{ height: 6 }} />
            <Text style={styles.readOnlyText}>
              {[
                defaultNeighborhood,
                defaultCity,
                defaultState && `- ${defaultState}`,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>4. Onde o seu evento vai acontecer?</Text>

      {/* O AddressForm cuida de CEP, cidade, bairro, etc. */}
      <AddressForm
        // venue
        onChangeVenue={onChangeVenue}
        defaultVenue={defaultVenue}

        // endereço em string (ex: "Rua X, 123 - Bairro Y, Cidade - RJ, CEP 00000-000")
        defaultValue={defaultValue}
        onChangeLocationString={onChangeLocationString}

        // defaults dos campos individuais – NÃO assume mais Rio de Janeiro
        defaultCep={defaultCep}
        defaultStreet={defaultStreet}
        defaultNumber={defaultNumber}
        defaultComplement={defaultComplement}
        defaultNeighborhood={defaultNeighborhood}
        defaultCity={defaultCity}
        defaultState={defaultState}

        // callbacks individuais
        onChangeStreet={onChangeStreet}
        onChangeNumber={onChangeNumber}
        onChangeComplement={onChangeComplement}
        onChangeNeighborhood={onChangeNeighborhood}
        onChangeCity={onChangeCity}
        onChangeState={onChangeState}

        // coordenadas (opcional, se você estiver preenchendo via geocode)
        defaultLatitude={defaultLatitude}
        defaultLongitude={defaultLongitude}
        onChangeLatitude={onChangeLatitude}
        onChangeLongitude={onChangeLongitude}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0f172a",
  },
  labelInline: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  readOnlyText: {
    fontSize: 14,
    color: "#333",
  },
});

export default LocationSection;
