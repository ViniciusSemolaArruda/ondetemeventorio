import React, { useEffect, useState } from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"

interface Props {
  defaultValue?: string
  onChangeTicketLink?: (value: string) => void
}

const TicketsSection = ({ defaultValue = "", onChangeTicketLink }: Props) => {
  const [ticketLink, setTicketLink] = useState(defaultValue)

  useEffect(() => {
    setTicketLink(defaultValue || "")
  }, [defaultValue])

  const handleChange = (value: string) => {
    setTicketLink(value)
    onChangeTicketLink?.(value)
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>5. Ingressos</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Link para compra de ingressos</Text>
        <TextInput
          style={styles.input}
          value={ticketLink}
          onChangeText={handleChange}
          placeholder="https://www.exemplo.com/ingressos"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
})

export default TicketsSection
