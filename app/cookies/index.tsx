// app/cookies/index.tsx
import Footer from "@/components/footer";
import Header2 from "@/components/Header2";
import { useI18n } from "@/context/I18nContext";
import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

type CookieRow = {
  name: string;
  purpose: string;
  duration: string;
  origin: string;
};

export default function CookiesScreen() {
  const { t } = useI18n();

  const rows: CookieRow[] = [
    {
      name: "admin_token",
      purpose: t("cookies_admin_purpose") || "Autenticação do administrador",
      duration: t("cookies_duration_session") || "Sessão / até expiração",
      origin: "ondetemeventorio.vercel.app",
    },
    {
      name: "_ga",
      purpose: t("cookies_ga_purpose") || "Google Analytics – estatísticas",
      duration: t("cookies_duration_2y") || "2 anos",
      origin: "cloudinary.com / Google",
    },
    {
      name: "_gcl_au",
      purpose: t("cookies_gcl_purpose") || "Medição de campanhas",
      duration: t("cookies_duration_3m") || "3 meses",
      origin: "Google Ads",
    },
    {
      name: "intercom-session-*",
      purpose: t("cookies_intercom_purpose") || "Suporte ao usuário (chat)",
      duration: t("cookies_duration_1w") || "1 semana",
      origin: "Intercom",
    },
    {
      name: "ot_er_lang",
      purpose: t("cookies_lang_purpose") || "Preferência de idioma",
      duration: t("cookies_duration_1y") || "1 ano",
      origin: "ondetemeventorio.vercel.app",
    },
  ];

  const openMail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) =>
      console.error("Erro ao abrir e-mail:", err)
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {/* Header agora rola junto */}
      <Header2 />

      <View style={styles.container}>
        <Text style={styles.title}>
          {t("cookies_title") || "Política de Cookies"}
        </Text>

        <Text style={styles.paragraph}>
          {t("cookies_intro") ||
            "Esta Política de Cookies explica o que são cookies, como os utilizamos no app Onde Tem Evento Rio, quais informações coletamos, por que as coletamos e como você pode gerenciar suas preferências. O uso de cookies segue a LGPD e normas aplicáveis."}
        </Text>

        <Text style={styles.h2}>
          {t("cookies_what_are_title") || "1. O que são cookies?"}
        </Text>
        <Text style={styles.paragraph}>
          {t("cookies_what_are_text") ||
            "Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você utiliza um site ou aplicativo. Eles permitem reconhecer seu dispositivo, melhorar a navegação, lembrar preferências e, em alguns casos, coletar informações para análise ou publicidade."}
        </Text>

        <Text style={styles.h2}>
          {t("cookies_types_title") || "2. Tipos de cookies que utilizamos"}
        </Text>
        <View style={styles.list}>
          <View style={styles.li}>
            <Text style={styles.liBullet}>•</Text>
            <Text style={styles.liText}>
              <Text style={styles.bold}>
                {t("cookies_types_needed_title") || "Cookies necessários: "}
              </Text>
              {t("cookies_types_needed_text") ||
                "essenciais para o funcionamento do app (autenticação e segurança). Não podem ser desativados."}
            </Text>
          </View>

          <View style={styles.li}>
            <Text style={styles.liBullet}>•</Text>
            <Text style={styles.liText}>
              <Text style={styles.bold}>
                {t("cookies_types_analytics_title") || "Cookies de analytics: "}
              </Text>
              {t("cookies_types_analytics_text") ||
                "entendem como os usuários interagem com o app e ajudam a melhorar a experiência (ex.: Google Analytics)."}
            </Text>
          </View>

          <View style={styles.li}>
            <Text style={styles.liBullet}>•</Text>
            <Text style={styles.liText}>
              <Text style={styles.bold}>
                {t("cookies_types_marketing_title") || "Cookies de marketing: "}
              </Text>
              {t("cookies_types_marketing_text") ||
                "personalizam anúncios e medem eficácia de campanhas."}
            </Text>
          </View>

          <View style={styles.li}>
            <Text style={styles.liBullet}>•</Text>
            <Text style={styles.liText}>
              <Text style={styles.bold}>
                {t("cookies_types_third_title") || "Cookies de terceiros: "}
              </Text>
              {t("cookies_types_third_text") ||
                "podem ser definidos por serviços externos integrados (ex.: Cloudinary para imagens, Intercom para suporte)."}
            </Text>
          </View>
        </View>

        <Text style={styles.h2}>
          {t("cookies_specific_title") || "3. Cookies específicos usados"}
        </Text>

        {/* “Tabela” responsiva */}
        <View style={styles.table}>
          <View style={[styles.row, styles.rowHeader]}>
            <Text style={[styles.cell, styles.cellName]}>
              {t("cookies_table_name") || "Nome"}
            </Text>
            <Text style={[styles.cell, styles.cellPurpose]}>
              {t("cookies_table_purpose") || "Finalidade"}
            </Text>
            <Text style={[styles.cell, styles.cellDuration]}>
              {t("cookies_table_duration") || "Duração"}
            </Text>
            <Text style={[styles.cell, styles.cellOrigin]}>
              {t("cookies_table_origin") || "Origem"}
            </Text>
          </View>

          {rows.map((r, i) => (
            <View key={r.name + i} style={styles.row}>
              <Text style={[styles.cell, styles.cellName]}>{r.name}</Text>
              <Text style={[styles.cell, styles.cellPurpose]}>{r.purpose}</Text>
              <Text style={[styles.cell, styles.cellDuration]}>{r.duration}</Text>
              <Text style={[styles.cell, styles.cellOrigin]}>{r.origin}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>
          {t("cookies_manage_title") || "4. Como gerenciar cookies"}
        </Text>
        <Text style={styles.paragraph}>
          {t("cookies_manage_text") ||
            "Você pode gerenciar suas preferências de cookies a qualquer momento. Além disso, é possível configurar seu navegador para recusar ou apagar cookies. No entanto, isso pode afetar algumas funcionalidades."}
        </Text>

        <Text style={styles.h2}>
          {t("cookies_changes_title") || "5. Alterações nesta política"}
        </Text>
        <Text style={styles.paragraph}>
          {t("cookies_changes_text") ||
            "Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças no uso de cookies. A data da última atualização será sempre indicada nesta página."}
        </Text>

        <Text style={styles.h2}>
          {t("cookies_contact_title") || "6. Contato"}
        </Text>
        <Text style={styles.paragraph}>
          {(t("cookies_contact_prefix") ||
            "Em caso de dúvidas sobre esta Política de Cookies, entre em contato pelo e-mail: ")}

          <Text
            style={styles.link}
            onPress={() =>
              openMail(
                t("cookies_contact_email") || "contato@capadociaproducoes.com"
              )
            }
          >
            {t("cookies_contact_email") || "contato@capadociaproducoes.com"}
          </Text>

          {t("cookies_contact_suffix") ||
            " ou pelo suporte através do chat do app."}
        </Text>

        <Text style={styles.updated}>
          {(t("common_last_updated") || "Última atualização") + ": "}
          {t("cookies_last_updated") || "Setembro de 2025"}
        </Text>
      </View>

      {/* Footer também rola junto */}
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  screenContent: { paddingBottom: 16 },

  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  h2: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    marginBottom: 12,
  },

  list: { marginBottom: 12 },
  li: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  liBullet: { width: 18, textAlign: "center", color: "#111827", marginTop: 1 },
  liText: { flex: 1, color: "#374151", fontSize: 14, lineHeight: 20 },
  bold: { fontWeight: "700", color: "#111827" },

  // “Tabela”
  table: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  rowHeader: {
    backgroundColor: "#f3f4f6",
    borderTopWidth: 0,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    color: "#111827",
  },
  cellName: { flex: 1.1 },
  cellPurpose: { flex: 1.6 },
  cellDuration: { flex: 0.8 },
  cellOrigin: { flex: 1.2 },

  link: {
    color: "#FF7500",
    textDecorationLine: "underline",
  },
  updated: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
  },
});
