import { useRouter } from "expo-router"
import { SearchIcon } from "lucide-react-native"
import { useState } from "react"
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { z } from "zod"

const formSchema = z.object({
  title: z.string().trim().min(1, { message: "Digite algo para buscar" }),
})

export default function Search() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
  const result = formSchema.safeParse({ title })
  if (!result.success) {
    setError(result.error.issues[0].message) // aqui era .errors, deve ser .issues
    return
  }
  setError(null)
  router.push(`/`)
}


  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Faça sua busca..."
        value={title}
        onChangeText={setTitle}
        style={[styles.input, error && styles.inputError]}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <SearchIcon size={20} color="#fff" />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  button: {
    backgroundColor: "#FF7500", // laranja bem claro
    padding: 10,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    marginLeft: 4,
  },
})
