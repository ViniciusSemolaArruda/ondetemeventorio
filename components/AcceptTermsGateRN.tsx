// components/AcceptTermsGateRN.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  storageKey?: string;                 // chave no AsyncStorage
  termsUrl?: string;                   // link para os termos
  title?: string;                      // título do card
  acceptLabel?: string;                // texto do botão
  onAccepted?: (acceptedAt: string) => void; // callback opcional
};

export default function AcceptTermsGateRN({
  storageKey = "tos.accepted.v1",
  termsUrl = "https://ondetemeventorio.vercel.app/termos",
  title = "Antes de continuar, aceite os Termos de Serviço",
  acceptLabel = "Aceitar e continuar",
  onAccepted,
}: Props) {
  const [checked, setChecked] = React.useState(false);
  const [alreadyAccepted, setAlreadyAccepted] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        setAlreadyAccepted(!!saved);
      } catch {
        setAlreadyAccepted(false);
      }
    })();
  }, [storageKey]);

  const handleAccept = async () => {
    const acceptedAt = new Date().toISOString();
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify({ acceptedAt }));
    } catch {}
    onAccepted?.(acceptedAt);
    setAlreadyAccepted(true);
  };

  // Se já aceitou, não renderiza nada
  if (alreadyAccepted) return null;
  // Enquanto carrega o estado do storage, também não renderiza (evita flicker)
  if (alreadyAccepted === null) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.body}>
        Você pode{" "}
        <Text style={styles.link} onPress={() => Linking.openURL(termsUrl)}>
          ler os Termos de Serviço
        </Text>{" "}
        antes de aceitar.
      </Text>

      <TouchableOpacity
        onPress={() => setChecked((v) => !v)}
        style={styles.row}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]} />
        <Text style={styles.rowText}>Eu li e aceito os Termos de Serviço</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleAccept}
        disabled={!checked}
        style={[styles.button, !checked && { opacity: 0.6 }]}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{acceptLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },
  body: { fontSize: 14, color: "#4b5563" },
  link: { color: "#2563eb", textDecorationLine: "underline" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1, borderColor: "#9ca3af", backgroundColor: "#fff",
  },
  checkboxChecked: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  rowText: { fontSize: 14, color: "#374151" },
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
