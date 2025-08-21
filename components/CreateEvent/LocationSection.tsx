import React from "react"
import { StyleSheet, Text, View } from "react-native"
import AddressForm from "./AddressForm"

interface Props {
  onChangeLocationString: (value: string) => void
  onChangeStreet: (value: string) => void
  onChangeNumber: (value: string) => void
  onChangeComplement: (value: string) => void
  onChangeNeighborhood: (value: string) => void
  onChangeCity: (value: string) => void
  onChangeState: (value: string) => void
  defaultValue?: string
  readOnly?: boolean
}

const LocationSection = ({
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
        <Text style={styles.readOnlyText}>
          {defaultValue ?? "Endereço não disponível"}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>4. Onde o seu evento vai acontecer?</Text>
      <AddressForm
        onChangeLocationString={onChangeLocationString}
        onChangeStreet={onChangeStreet}
        onChangeNumber={onChangeNumber}
        onChangeComplement={onChangeComplement}
        onChangeNeighborhood={onChangeNeighborhood}
        onChangeCity={onChangeCity}
        onChangeState={onChangeState}
        defaultValue={defaultValue}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  readOnlyText: {
    fontSize: 14,
    color: "#333",
  },
})

export default LocationSection
