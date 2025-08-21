import React from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"

interface Props {
  producerName: string
  producerDescription: string
  onChangeProducerName: (text: string) => void
  onChangeProducerDescription: (text: string) => void
}

const ProducerSection = ({
  producerName,
  producerDescription,
  onChangeProducerName,
  onChangeProducerDescription,
}: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>7. Sobre o produtor</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nome do Produtor</Text>
        <TextInput
          style={styles.input}
          value={producerName}
          onChangeText={onChangeProducerName}
          placeholder="Nome da pessoa ou empresa responsável"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={4}
          value={producerDescription}
          onChangeText={onChangeProducerDescription}
          placeholder="Descreva quem é o produtor/organizador do evento..."
          textAlignVertical="top"
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
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textarea: {
    height: 120,
  },
})

export default ProducerSection
