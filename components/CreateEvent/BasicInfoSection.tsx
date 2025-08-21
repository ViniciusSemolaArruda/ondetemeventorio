import React from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"

interface Props {
  defaultValues?: {
    name?: string
  }
  title: string
  onChangeTitle: (text: string) => void
}

const BasicInfoSection = ({ defaultValues, title, onChangeTitle }: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>1. Informações básicas</Text>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          Nome do evento (no máximo 100 caracteres)
        </Text>
        <TextInput
          style={styles.input}
          maxLength={100}
          value={title}
          onChangeText={onChangeTitle}
          placeholder="Digite o nome do evento"
        />
      </View>
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
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
  },
})

export default BasicInfoSection
