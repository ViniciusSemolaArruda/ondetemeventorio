// app/create-event/index.tsx
import BasicInfoSection from "@/components/CreateEvent/BasicInfoSection";
import CategoriesSection from "@/components/CreateEvent/CategoriesSection";
import DateTimeSection from "@/components/CreateEvent/DateTimeSection";
import DescriptionSection from "@/components/CreateEvent/DescriptionSection";
import EventImageUpload from "@/components/CreateEvent/EventImageUpload";
import LocationSection from "@/components/CreateEvent/LocationSection";
import ProducerSection from "@/components/CreateEvent/ProducerSection";
import WebsiteSection from "@/components/CreateEvent/WebsiteSection";
import Header2 from "@/components/Header2";

import { useAuth } from "@/context/AuthContext";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// helpers de data/hora com timezone local
const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
const localTzOffset = () => {
  const mins = -new Date().getTimezoneOffset();
  const sign = mins >= 0 ? "+" : "-";
  const abs = Math.abs(mins);
  const hh = pad(Math.floor(abs / 60));
  const mm = pad(abs % 60);
  const finalSign = sign === "+" ? "-" : "+";
  return `${finalSign}${hh}:${mm}`;
};
const withLocalOffset = (dateYYYYMMDD: string, timeHHMM: string) =>
  `${dateYYYYMMDD}T${timeHHMM}${localTzOffset()}`;

const BG = "#f2f2f2"; // fundo acinzentado solicitado

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();

  // ===== form =====
  const [venue, setVenue] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const [locationString, setLocationString] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Rio de Janeiro");
  const [stateUF, setStateUF] = useState("RJ");

  const [ticketLink, setTicketLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [producer, setProducer] = useState("");
  const [producerDescription, setProducerDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  // caixas visuais (não bloqueiam envio)
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // overlays
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const buildAddress = () => {
    const parts = [
      street && number ? `${street}, ${number}` : street || "",
      neighborhood || "",
      city || "",
      stateUF || "",
      complement || "",
    ]
      .filter(Boolean)
      .join(" - ")
      .replace(/\s+-\s+$/, "");
    return parts;
  };

  const confirmSubmission = async () => {
    setShowConfirmation(false);
    await handleSubmit();
  };

  const handleSubmit = async () => {
    // validações mínimas
    if (!title.trim()) {
      Alert.alert("Atenção", "Título é obrigatório.");
      return;
    }
    if (!venue.trim()) {
      Alert.alert("Atenção", "Informe o nome do local (venue).");
      return;
    }
    if (!startDate || !startTime || !endDate || !endTime) {
      Alert.alert("Atenção", "Preencha data e hora de início e fim.");
      return;
    }

    const normalizeCategory = (s: string) =>
      s.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();

    try {
      const formData = new FormData();

      // (mantemos esses campos para satisfazer o backend)
      const truthy = "true";
      const one = "1";
      [
        "acceptTerms",
        "acceptPrivacy",
        "termsAccepted",
        "privacyAccepted",
        "acceptTermsOfService",
        "acceptPrivacyPolicy",
        "tosAccepted",
        "ppAccepted",
      ].forEach((k) => {
        formData.append(k, truthy);
        formData.append(`${k}Bool`, truthy);
        formData.append(`${k}Flag`, one);
      });

      // título (compatibilidade)
      formData.append("title", title.trim());
      formData.append("name", title.trim());

      // venue obrigatório
      formData.append("venue", venue.trim());

      // descrição
      formData.append("description", description ?? "");

      // datas com OFFSET local (evita -3h)
      formData.append("startDate", withLocalOffset(startDate, startTime));
      formData.append("endDate", withLocalOffset(endDate, endTime));
      // dica ao backend
      formData.append("timezone", "America/Sao_Paulo");
      formData.append("tzOffset", localTzOffset());

      if (imageUrl) formData.append("imageUrl", imageUrl);

      // endereço
      const finalAddress = locationString.trim()
        ? locationString.trim()
        : buildAddress();
      if (finalAddress) formData.append("address", finalAddress);

      // links
      if (ticketLink) {
        formData.append("ticketsUrl", ticketLink);
        formData.append("ticketLink", ticketLink);
      }
      if (websiteLink) {
        formData.append("websiteUrl", websiteLink);
        formData.append("site", websiteLink);
      }

      // produtor (opcional)
      if (producer) formData.append("producer", producer);
      if (producerDescription)
        formData.append("producerDescription", producerDescription);

      // categoria única (string)
      if (Array.isArray(categories) && categories.length > 0) {
        const category = normalizeCategory(String(categories[0]));
        if (category) formData.append("category", category); // ex.: "ROCK"
      }

      // identificação do criador (opcional)
      if (user?.email) formData.append("creatorEmail", user.email);
      if (user?.name) formData.append("creatorName", user.name);

      const res = await fetch("https://ondetemeventorio.vercel.app/api/events", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("POST /api/events =>", res.status, text);

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          Toast.show({
            type: "success",
            text1: "Evento enviado com sucesso!",
            text2: "Aguardando avaliação da equipe em até 24h.",
            position: "bottom",
            visibilityTime: 3000,
          });
          router.push("/" as Href);
        }, 900);
      } else {
        Alert.alert("Erro", `Falha ao criar evento (${res.status}).\n${text}`);
      }
    } catch (error) {
      console.error("Erro ao enviar evento:", error);
      Alert.alert("Erro", "Ocorreu um erro. Tente novamente.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <Header2 />

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: BG }]} style={{ backgroundColor: BG }}>
        <Text style={styles.title}>Criar Novo Evento</Text>

        <BasicInfoSection title={title} onChangeTitle={setTitle} />
        <EventImageUpload onFileSelect={(url) => setImageUrl(url)} />

        <CategoriesSection selected={categories} onChange={setCategories} single />

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

        <DescriptionSection
          description={description}
          onChangeDescription={setDescription}
        />

        <LocationSection
          onChangeVenue={setVenue}
          onChangeLocationString={setLocationString}
          onChangeStreet={setStreet}
          onChangeNumber={setNumber}
          onChangeComplement={setComplement}
          onChangeNeighborhood={setNeighborhood}
          onChangeCity={setCity}
          onChangeState={setStateUF}
        />

        <WebsiteSection onChangeWebsiteLink={setWebsiteLink} />

        <ProducerSection
          producerName={producer}
          producerDescription={producerDescription}
          onChangeProducerName={setProducer}
          onChangeProducerDescription={setProducerDescription}
        />

        {/* Caixas informativas (não bloqueiam) */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            onPress={() => setAcceptTerms((v) => !v)}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checked]} />
            <Text style={styles.checkboxLabel}>
              Eu li e concordo com os
              <Text
                style={styles.link}
                onPress={() =>
                  Linking.openURL("https://ondetemeventorio.vercel.app/termos")
                }
              >
                {" Termos de Serviço"}
              </Text>
            </Text>
          </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAcceptPrivacy((v) => !v)}
              style={[styles.checkboxRow, { marginTop: 8 }]}
            >
              <View style={[styles.checkbox, acceptPrivacy && styles.checked]} />
              <Text style={styles.checkboxLabel}>
                Eu li e concordo com a
                <Text
                  style={styles.link}
                  onPress={() =>
                    Linking.openURL(
                      "https://ondetemeventorio.vercel.app/privacidade"
                    )
                  }
                >
                  {" Política de Privacidade"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => setShowConfirmation(true)}
        >
          <Text style={styles.submitButtonText}>Criar Evento</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* overlays locais */}
      {success && (
        <View style={styles.overlay}>
          <View style={styles.successBox}>
            <Text style={styles.spinner}>✅</Text>
            <Text style={styles.successText}>
              Evento criado com sucesso! Redirecionando...
            </Text>
          </View>
        </View>
      )}

      {showConfirmation && (
        <View style={styles.overlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Confirmar criação do evento</Text>
            <Text style={styles.confirmText}>
              Tem certeza que deseja criar este evento?{"\n"}Após a confirmação
              não será possível editar, apenas excluir.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                onPress={() => setShowConfirmation(false)}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmSubmission}
                style={[styles.button, styles.confirmButton]}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, marginTop: 8 },

  checkboxContainer: { marginVertical: 24 },
  checkboxRow: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#999",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  checked: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  checkboxLabel: { fontSize: 14, color: "#333" },
  link: { color: "#2563eb", textDecorationLine: "underline" },

  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
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
  spinner: { fontSize: 20, marginRight: 10 },
  successText: { color: "#047857", fontWeight: "bold" },

  confirmBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  confirmTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#1f2937" },
  confirmText: { fontSize: 14, color: "#4b5563", marginBottom: 20 },
  confirmButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6 },
  cancelButton: { backgroundColor: "#ef4444" },
  confirmButton: { backgroundColor: "#16a34a" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
