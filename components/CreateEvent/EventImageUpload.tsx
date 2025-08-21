import { uploadImageToCloudinary } from "@/utils/uploadImage"
import * as ImagePicker from "expo-image-picker"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

interface Props {
  onFileSelect: (url: string) => void
  existingUrl?: string
}

const EventImageUpload = ({ onFileSelect, existingUrl }: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [16, 9],
      })

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0]

        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Alert.alert("Imagem muito grande", "Tamanho máximo: 2MB.")
          return
        }

        Alert.alert("Aguarde", "Enviando imagem para o servidor...")

        const cloudinaryUrl = await uploadImageToCloudinary(asset.uri)
        setPreviewUrl(cloudinaryUrl)
        onFileSelect(cloudinaryUrl)
      }
    } catch (err) {
      console.error("Erro ao selecionar imagem:", err)
      Alert.alert("Erro", "Não foi possível carregar a imagem.")
    }
  }

  useEffect(() => {
    if (existingUrl && !previewUrl) {
      setPreviewUrl(existingUrl)
    }
  }, [existingUrl, previewUrl])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Imagem de divulgação</Text>
      <Text style={styles.warning}>
        Observação: a imagem será exibida exatamente como aparece na pré-visualização. Dimensão recomendada: 1200 x 675.
      </Text>
      <Text style={styles.subWarning}>
        ⚠️ Imagens com corte inadequado podem ser motivo para a não aprovação do evento.
      </Text>

      <Pressable style={styles.uploadArea} onPress={pickImage}>
        {!previewUrl ? (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Clique para selecionar a imagem</Text>
            <Text style={styles.placeholderDetails}>
              Dimensão recomendada: 1200 x 675. Máx 2MB (JPEG, PNG ou GIF).
            </Text>
          </View>
        ) : (
          <Image source={{ uri: previewUrl }} style={styles.preview} resizeMode="cover" />
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  warning: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "500",
  },
  subWarning: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 12,
  },
  uploadArea: {
    aspectRatio: 16 / 9,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#ccc",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    padding: 16,
  },
  placeholderText: {
    color: "#2563eb",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 4,
  },
  placeholderDetails: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
})

export default EventImageUpload
