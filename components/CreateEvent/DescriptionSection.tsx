// components/CreateEvent/DescriptionSection.tsx
import React from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"

interface Props {
  description: string
  onChangeDescription: (value: string) => void
}

const DescriptionSection = ({ description, onChangeDescription }: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>3. Descrição do evento</Text>
      <Text style={styles.description}>
        Conte todos os detalhes do seu evento, como a programação e os
        diferenciais da sua produção!
      </Text>

      <TextInput
        style={styles.textarea}
        multiline
        numberOfLines={6}
        value={description}
        onChangeText={onChangeDescription}
        placeholder="Descreva seu evento com detalhes..."
        textAlignVertical="top"
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
  description: {
    color: "#666",
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    height: 140,
    fontSize: 14,
    backgroundColor: "#fff",
  },
})

export default DescriptionSection
