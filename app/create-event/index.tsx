import BasicInfoSection from "@/components/CreateEvent/BasicInfoSection"
import DateTimeSection from "@/components/CreateEvent/DateTimeSection"
import DescriptionSection from "@/components/CreateEvent/DescriptionSection"
import EventImageUpload from "@/components/CreateEvent/EventImageUpload"
import LocationSection from "@/components/CreateEvent/LocationSection"
import ProducerSection from "@/components/CreateEvent/ProducerSection"
import TicketsSection from "@/components/CreateEvent/TicketsSection"
import WebsiteSection from "@/components/CreateEvent/WebsiteSection"
import Header2 from "@/components/Header2"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "expo-router"
import React, { useState } from "react"

import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

const CreateEventPage = () => {
  const { user } = useAuth()

  // --- Estados principais ---
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")

  const [locationString, setLocationString] = useState("")
  const [street, setStreet] = useState("")
  const [number, setNumber] = useState("")
  const [complement, setComplement] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("Rio de Janeiro")
  const [stateUF, setStateUF] = useState("RJ")

  const [ticketLink, setTicketLink] = useState("")
  const [websiteLink, setWebsiteLink] = useState("")
  const [producer, setProducer] = useState("")
  const [producerDescription, setProducerDescription] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
const router = useRouter()

  const confirmSubmission = async () => {
    setShowConfirmation(false)
    await handleSubmit()
  }

  const handleSubmit = async () => {
    if (!termsAccepted) {
      Alert.alert("Atenção", "Você precisa aceitar os Termos de Serviço.")
      return
    }

    if (!title.trim()) {
      Alert.alert("Atenção", "Título é obrigatório.")
      return
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      Alert.alert("Atenção", "Preencha data e hora de início e fim.")
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("description", description ?? "")
      formData.append("startDate", new Date(`${startDate}T${startTime}`).toISOString())
      formData.append("endDate", new Date(`${endDate}T${endTime}`).toISOString())
      if (imageUrl) formData.append("imageUrl", imageUrl)

      if (locationString.trim()) {
        formData.append("location", locationString.trim())
      } else {
        if (street) formData.append("street", street)
        if (number) formData.append("number", number)
        if (complement) formData.append("complement", complement)
        if (neighborhood) formData.append("neighborhood", neighborhood)
        if (city) formData.append("city", city)
        if (stateUF) formData.append("state", stateUF)
      }

      if (ticketLink) formData.append("ticketLink", ticketLink)
      if (websiteLink) formData.append("websiteLink", websiteLink)
      if (producer) formData.append("producer", producer)
      if (producerDescription) formData.append("producerDescription", producerDescription)

      if (categories?.length) {
        categories.forEach((cat) => formData.append("categories", cat))
      }

      if (user?.email) formData.append("creatorEmail", user.email)
      if (user?.name) formData.append("creatorName", user.name)

      const res = await fetch("https://ondetemeventorio.vercel.app/api/events", {
        method: "POST",
        body: formData,
      })

      const text = await res.text()
      console.log("POST /api/events =>", res.status, text)

      if (res.ok) {
  setSuccess(true)
  setTimeout(() => {
    setSuccess(false)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      router.push("/") // redireciona para a página inicial
    }, 5000)
  }, 3000)


      } else {
        Alert.alert("Erro", `Falha ao criar evento (${res.status}).\n${text}`)
      }
    } catch (error) {
      console.error("Erro ao enviar evento:", error)
      Alert.alert("Erro", "Ocorreu um erro. Tente novamente.")
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Header2 />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Criar Novo Evento</Text>

        <BasicInfoSection title={title} onChangeTitle={setTitle} />

        <EventImageUpload onFileSelect={(url) => setImageUrl(url)} />

        <DateTimeSection
          startDate={startDate}
          setStartDate={setStartDate}
          startTime={startTime}
          setStartTime={setStartTime}
          endDate={endDate}
          setEndDate={setEndDate}
          endTime={endTime}
          setEndTime={setEndTime}
        />

        <DescriptionSection description={description} onChangeDescription={setDescription} />

        <LocationSection
          onChangeLocationString={setLocationString}
          onChangeStreet={setStreet}
          onChangeNumber={setNumber}
          onChangeComplement={setComplement}
          onChangeNeighborhood={setNeighborhood}
          onChangeCity={setCity}
          onChangeState={setStateUF}
        />

        <TicketsSection onChangeTicketLink={setTicketLink} />
        <WebsiteSection onChangeWebsiteLink={setWebsiteLink} />

        <ProducerSection
          producerName={producer}
          producerDescription={producerDescription}
          onChangeProducerName={setProducer}
          onChangeProducerDescription={setProducerDescription}
        />

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)} style={styles.checkboxRow}>
            <View style={[styles.checkbox, termsAccepted && styles.checked]} />
            <Text style={styles.checkboxLabel}>
              Eu li e concordo com os
              <Text style={styles.link} onPress={() => Linking.openURL("https://ondetemeventorio.vercel.app/termos")}>
                {" Termos de Serviço"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={() => setShowConfirmation(true)}>
          <Text style={styles.submitButtonText}>Criar Evento</Text>
        </TouchableOpacity>
      </ScrollView>

      {success && (
        <View style={styles.overlay}>
          <View style={styles.successBox}>
            <Text style={styles.spinner}>🔄</Text>
            <Text style={styles.successText}>Evento criado com sucesso! Redirecionando...</Text>
          </View>
        </View>
      )}

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            O evento será avaliado pela nossa equipe em até 24 horas antes de ser publicado.
          </Text>
        </View>
      )}

      {showConfirmation && (
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Confirmar criação do evento</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja criar este evento?{"\n"}Após a confirmação não será possível editar, apenas excluir.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity onPress={() => setShowConfirmation(false)} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmSubmission} style={[styles.button, styles.confirmButton]}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },
  checkboxContainer: {
    marginVertical: 24,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#999",
    marginRight: 8,
  },
  checked: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
  link: {
    color: "#2563eb",
    textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  spinner: {
    fontSize: 24,
    marginRight: 10,
  },
  successText: {
    color: "#047857",
    fontWeight: "bold",
  },
  toast: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#ecfdf5",
    borderColor: "#059669",
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 999,
  },
  toastText: {
    color: "#065f46",
    textAlign: "center",
  },
  confirmBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
  },
  confirmText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  confirmButton: {
    backgroundColor: "#16a34a",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
})

export default CreateEventPage