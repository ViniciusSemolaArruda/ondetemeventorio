import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AddressForm from "./AddressForm";

interface Props {
  // ✅ venue deve ser repassado para o AddressForm (obrigatório)
  onChangeVenue: (value: string) => void;
  defaultVenue?: string;

  // Endereço
  onChangeLocationString: (value: string) => void;
  onChangeStreet: (value: string) => void;
  onChangeNumber: (value: string) => void;
  onChangeComplement: (value: string) => void;
  onChangeNeighborhood: (value: string) => void;
  onChangeCity: (value: string) => void;
  onChangeState: (value: string) => void;

  /** Endereço completo padrão para o AddressForm */
  defaultValue?: string;

  /** Modo somente leitura */
  readOnly?: boolean;
}

const LocationSection = ({
  onChangeVenue,
  defaultVenue = "",
  defaultValue,
  readOnly = false,
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
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>4. Onde o seu evento vai acontecer?</Text>

      {/* 🔸 O AddressForm já renderiza o campo de VENUE.
          Não duplicamos aqui — apenas repassamos. */}
      <AddressForm
        onChangeVenue={onChangeVenue}
        defaultVenue={defaultVenue}
        defaultValue={defaultValue}
        onChangeLocationString={onChangeLocationString}
        onChangeStreet={onChangeStreet}
        onChangeNumber={onChangeNumber}
        onChangeComplement={onChangeComplement}
        onChangeNeighborhood={onChangeNeighborhood}
        onChangeCity={onChangeCity}
        onChangeState={onChangeState}
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
