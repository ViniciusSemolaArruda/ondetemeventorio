import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface SubmitButtonProps {
  isEditing?: boolean
  isSubmitting?: boolean
  onPress: () => void // ✅ importante
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isEditing = false,
  isSubmitting = false,
  onPress,
}) => {
  const label = isSubmitting
    ? "Salvando..."
    : isEditing
    ? "Salvar Alterações"
    : "Criar Evento"

  const buttonStyle = [
    styles.button,
    isSubmitting
      ? styles.disabledButton
      : isEditing
      ? styles.editingButton
      : styles.defaultButton,
  ]

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={buttonStyle}
        disabled={isSubmitting}
        onPress={onPress} // ✅ agora funcional
      >
        <Text style={styles.text}>{label}</Text>
      </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },
  button: {
    width: "100%",
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  defaultButton: {
    backgroundColor: "#2563eb", // azul
  },
  editingButton: {
    backgroundColor: "#ca8a04", // amarelo escuro
  },
  disabledButton: {
    backgroundColor: "#9ca3af", // cinza claro
  },
})

export default SubmitButton
