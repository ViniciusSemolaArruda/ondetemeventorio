import React, { useEffect, useState } from "react"
import { StyleSheet, Switch, Text, TextInput, View } from "react-native"

interface Props {
  defaultValue?: string
  onChangeWebsiteLink?: (value: string) => void
}

const WebsiteSection = ({ defaultValue, onChangeWebsiteLink }: Props) => {
  const [hasWebsite, setHasWebsite] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")

  useEffect(() => {
    if (defaultValue) {
      setWebsiteUrl(defaultValue)
      setHasWebsite(true)
    }
  }, [defaultValue])

  const handleChange = (text: string) => {
    setWebsiteUrl(text)
    onChangeWebsiteLink?.(text)
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>5. Site</Text>

      <View style={styles.checkboxRow}>
        <Switch
          value={hasWebsite}
          onValueChange={setHasWebsite}
          trackColor={{ false: "#ccc", true: "#2563eb" }}
          thumbColor={hasWebsite ? "#2563eb" : "#f4f3f4"}
        />
        <Text style={styles.checkboxLabel}>Possui site ou Instagram?</Text>
      </View>

      {hasWebsite && (
        <View style={styles.field}>
          <Text style={styles.label}>Link do site ou Instagram</Text>
          <TextInput
            style={styles.input}
            value={websiteUrl}
            onChangeText={handleChange}
            placeholder="https://www.exemplo.com"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  field: {
    marginBottom: 12,
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
})

export default WebsiteSection
