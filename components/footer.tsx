// components/footer.tsx
import { useI18n } from "@/context/I18nContext";
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
  const { t } = useI18n();

  const openMail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) =>
      console.error("Erro ao abrir e-mail:", err),
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
          <Text style={styles.infoText}>
            <Text style={styles.label}>{t("footer_cnpj")}:</Text> 15.914.276/0001-52
          </Text>

          <Text style={styles.infoText}>
            <Text style={styles.label}>{t("footer_address")}:</Text>{" "}
            Rua Exemplo, 123 - Rio de Janeiro - RJ
          </Text>

          <View style={styles.rowCenter}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>{t("footer_email")}:</Text>{" "}
            </Text>
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
            <Text style={styles.link}>{t("footer_terms")}</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => router.push("/politica" as any)}
          >
            <Text style={styles.link}>{t("footer_privacy")}</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => router.push("/cookies" as any)}
          >
            <Text style={styles.link}>{t("footer_cookies")}</Text>
          </TouchableOpacity>

          <Text style={styles.separator}>•</Text>

          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => router.push("/contato" as any)}
          >
            <Text style={styles.link}>{t("footer_contact")}</Text>
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
    borderColor: "#e5e7eb",
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
  label: {
    fontWeight: "600",
    color: "#374151",
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
