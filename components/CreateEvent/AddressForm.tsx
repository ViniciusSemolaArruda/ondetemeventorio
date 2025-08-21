import React, { useEffect, useState } from "react"
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native"

interface Props {
  onChangeLocationString: (value: string) => void
  onChangeStreet: (value: string) => void
  onChangeNumber: (value: string) => void
  onChangeComplement: (value: string) => void
  onChangeNeighborhood: (value: string) => void
  onChangeCity: (value: string) => void
  onChangeState: (value: string) => void
  defaultValue?: string
}

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
  const [cep, setCep] = useState("")
  const [showMap, setShowMap] = useState(false)

  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("Rio de Janeiro")
  const [state, setState] = useState("RJ")

  useEffect(() => {
    if (defaultValue) {
      onChangeLocationString(defaultValue)
    }
  }, [defaultValue])

  useEffect(() => {
    const locationString = `${street}, ${number}${
      complement ? " - " + complement : ""
    }, ${neighborhood}, ${city} - ${state}`
    onChangeLocationString(locationString)
  }, [street, number, complement, neighborhood, city, state])

  const handleCepChange = async (value: string) => {
    const formatted = value.replace(/\D/g, "")
    setCep(formatted)

    if (formatted.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${formatted}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setStreet(data.logradouro || "")
          setNeighborhood(data.bairro || "")
          setCity(data.localidade || "Rio de Janeiro")
          setState(data.uf || "RJ")

          onChangeStreet(data.logradouro || "")
          onChangeNeighborhood(data.bairro || "")
          onChangeCity(data.localidade || "Rio de Janeiro")
          onChangeState(data.uf || "RJ")
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      }
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>CEP</Text>
      <TextInput
        style={styles.input}
        placeholder="00000-000"
        value={cep}
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
          setStreet(text)
          onChangeStreet(text)
        }}
      />

      <Text style={styles.label}>Número</Text>
      <TextInput
        style={styles.input}
        placeholder="Número"
        value={number}
        onChangeText={(text) => {
          setNumber(text)
          onChangeNumber(text)
        }}
      />

      <Text style={styles.label}>Complemento</Text>
      <TextInput
        style={styles.input}
        placeholder="Complemento"
        value={complement}
        onChangeText={(text) => {
          setComplement(text)
          onChangeComplement(text)
        }}
      />

      <Text style={styles.label}>Bairro</Text>
      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={neighborhood}
        onChangeText={(text) => {
          setNeighborhood(text)
          onChangeNeighborhood(text)
        }}
      />

      <Text style={styles.label}>Cidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Cidade"
        value={city}
        onChangeText={(text) => {
          setCity(text)
          onChangeCity(text)
        }}
      />

      <Text style={styles.label}>Estado</Text>
      <TextInput
        style={styles.input}
        placeholder="Estado"
        value={state}
        onChangeText={(text) => {
          setState(text)
          onChangeState(text)
        }}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Mostrar Mapa</Text>
        <Switch value={showMap} onValueChange={setShowMap} />
      </View>
    </ScrollView>
  )
}

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
    marginTop: 16,
  },
})

export default AddressForm
