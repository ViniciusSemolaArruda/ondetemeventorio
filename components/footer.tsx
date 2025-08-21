import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Erro ao abrir URL:", err));
  };

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        <Text style={styles.copyText}>
          © {currentYear} Copyright <Text style={styles.brand}>Capadócia Produções</Text>
        </Text>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => handleLink("https://seudominio.com/politica")}>
            <Text style={styles.link}>Termos de Serviço</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLink("https://seudominio.com/politica")}>
            <Text style={styles.link}>Política de Privacidade</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLink("https://seudominio.com/contato")}>
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
    backgroundColor: "#fff", // cor do fundo, personalize conforme necessário
    borderTopWidth: 1,
    borderColor: "#e2e8f0", // equivalente a border-gray-200
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  container: {
    alignItems: "center",
    gap: 16,
  },
  copyText: {
    fontSize: 14,
    color: "#6b7280", // text-muted-foreground
    textAlign: "center",
  },
  brand: {
    fontWeight: "600",
    color: "#111", // cor mais escura para "Capadócia Produções"
  },
  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  link: {
    fontSize: 14,
    color: "#6b7280",
    textDecorationLine: "underline",
  },
});
