import { useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  const openMail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) =>
      console.error("Erro ao abrir e-mail:", err)
    );
  };

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        {/* Copyright */}
        <Text style={styles.copyText}>
          © {currentYear} Copyright{" "}
          <Text style={styles.brand}>Capadócia Produções</Text>
        </Text>

        {/* CNPJ / Endereço / Email */}
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>CNPJ: 15.914.276/0001-52</Text>
          <Text style={styles.infoText}>
            Endereço: Rua Exemplo, 123 - Rio de Janeiro - RJ
          </Text>

          <View style={styles.rowCenter}>
            <Text style={styles.infoText}>E-mail: </Text>
            <TouchableOpacity
              accessibilityRole="link"
              onPress={() => openMail("contato.ondetemevento@gmail.com")}
            >
              <Text style={[styles.infoText, styles.linkUnderlined]}>
                contato.ondetemevento@gmail.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Links */}
        <View style={styles.linksContainer}>
          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => router.push("/termos" as any)}
          >
            <Text style={styles.link}>Termos de Serviço</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => router.push("/politica" as any)}
          >
            <Text style={styles.link}>Política de Privacidade</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => router.push("/cookies" as any)}
          >
            <Text style={styles.link}>Cookies</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => router.push("/contato" as any)}
          >
            <Text style={styles.link}>Contato</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e5e7eb", // cinza claro
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  container: {
    alignItems: "center",
  },
  copyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  brand: {
    fontWeight: "600",
    color: "#111827",
  },
  infoBlock: {
    marginTop: 8,
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkUnderlined: {
    textDecorationLine: "underline",
    color: "#374151",
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  link: {
    fontSize: 14,
    color: "#6b7280",
    textDecorationLine: "underline",
  },
  separator: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
