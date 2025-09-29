// app/politica/index.tsx
import { useRouter } from "expo-router"
import React, { useMemo, useRef, useState } from "react"
import {
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
// Ajuste o import conforme seu projeto RN:
import Header2 from "@/components/Header2"
import { useI18n } from "@/context/I18nContext"

type Section = { id: string; label: string }

export default function PoliticaScreen() {
  const router = useRouter()
  const { t } = useI18n()
  const updatedAt = "28/08/2025"

  // === Sumário/Seções ===
  const sections: Section[] = useMemo(
    () => [
      { id: "quem-somos", label: t("policy_who_title") },
      { id: "dados-coletados", label: t("policy_data_title") },
      { id: "bases-legais", label: t("policy_bases_title") },
      { id: "finalidades", label: t("policy_purposes_title") },
      { id: "compartilhamento", label: t("policy_sharing_title") },
      { id: "seguranca-retencao", label: t("policy_storage_title") },
      { id: "cookies", label: t("policy_cookies_title") },
      { id: "direitos", label: t("policy_rights_title") },
      { id: "transferencias", label: t("policy_transfers_title") },
      { id: "criancas", label: t("policy_children_title") },
      { id: "alteracoes", label: t("policy_changes_title") },
      { id: "contato", label: t("policy_contact_title") },
    ],
    [t]
  )

  // === Scroll / Âncoras ===
  const scrollRef = useRef<ScrollView>(null)
  const [yMap, setYMap] = useState<Record<string, number>>({})
  const HEADER_HEIGHT = 0 // ajuste se tiver um header fixo no app

  const onSectionLayout = (id: string, y: number) => {
    setYMap((prev) => ({ ...prev, [id]: y }))
  }

  const scrollToSection = (id: string) => {
    const y = yMap[id] ?? 0
    scrollRef.current?.scrollTo({ y: Math.max(y - HEADER_HEIGHT - 12, 0), animated: true })
  }

  const onScroll = (_e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Se quiser destacar a seção ativa, você pode ler o e.nativeEvent.contentOffset.y
  }

  // === Helpers para textos "prefixo: descrição" ===
  const BoldPrefix: React.FC<{ text: string }> = ({ text }) => {
    const [pfx, ...rest] = text.split(":")
    const restJoined = rest.join(":").trim()
    return (
      <Text style={styles.li}>
        <Text style={styles.bold}>{pfx}</Text>
        {restJoined ? <Text>{`: ${restJoined}`}</Text> : null}
      </Text>
    )
  }

  // === Tema/cores ===
  const ORANGE = "#FF7500"

  return (
    <>
    <Header2/>
    <View style={styles.container}>
      {/* Cabeçalho simples da página */}
      <View style={styles.headerBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("policy_title")}</Text>
          <Text style={styles.subtitle}>
            {t("common_last_updated")}: <Text>{updatedAt}</Text>
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => scrollToSection("contato")}
            style={[styles.btn, styles.btnOutline]}
          >
            <Text style={[styles.btnText, { color: "#374151" }]}>
              {t("common_questions_contact")}
            </Text>
          </TouchableOpacity>

          {/* Em mobile não há "imprimir"; se quiser, pode abrir uma tela de compartilhamento depois */}
          {/* <TouchableOpacity style={[styles.btn, styles.btnSolid]}>
            <Text style={[styles.btnText, { color: "#fff" }]}>
              {t("common_print_pdf")}
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Sumário (horizontal) */}
      <View style={styles.tocBox}>
        <Text style={styles.tocTitle}>{t("common_summary")}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tocScroll}
        >
          {sections.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => scrollToSection(s.id)}
              style={styles.tocPill}
            >
              <Text style={styles.tocPillText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conteúdo */}
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
      >
        {/* Quem somos */}
        <View
          onLayout={(e) => onSectionLayout("quem-somos", e.nativeEvent.layout.y)}
        >
          <Text style={styles.h2}>{t("policy_who_title")}</Text>
          <Text style={styles.p}>{t("policy_who_p1")}</Text>
          <Text style={styles.p}>{t("policy_who_p2")}</Text>
        </View>

        {/* Dados coletados */}
        <View
          onLayout={(e) => onSectionLayout("dados-coletados", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_data_title")}</Text>
          <View style={styles.ul}>
            <BoldPrefix text={t("policy_data_google_email")} />
            <BoldPrefix text={t("policy_data_preferences")} />
            <BoldPrefix text={t("policy_data_interactions")} />
            <BoldPrefix text={t("policy_data_technical")} />
            <BoldPrefix text={t("policy_data_location")} />
          </View>
          <Text style={[styles.p, styles.muted]}>{t("policy_data_note")}</Text>
        </View>

        {/* Bases legais */}
        <View
          onLayout={(e) => onSectionLayout("bases-legais", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_bases_title")}</Text>
          <View style={styles.ul}>
            <BoldPrefix text={t("policy_bases_contract")} />
            <BoldPrefix text={t("policy_bases_legit_interest")} />
            <BoldPrefix text={t("policy_bases_consent")} />
            <BoldPrefix text={t("policy_bases_legal_obligation")} />
          </View>
        </View>

        {/* Finalidades */}
        <View
          onLayout={(e) => onSectionLayout("finalidades", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_purposes_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("policy_purpose_auth")}</Text>
            <Text style={styles.li}>{t("policy_purpose_personalize")}</Text>
            <Text style={styles.li}>{t("policy_purpose_security")}</Text>
            <Text style={styles.li}>{t("policy_purpose_stats")}</Text>
            <Text style={styles.li}>{t("policy_purpose_requests")}</Text>
          </View>
          <Text style={[styles.p]}>
            <Text style={styles.bold}>
              {t("policy_purpose_nosale").split(" ")[0]}
            </Text>{" "}
            {t("policy_purpose_nosale").split(" ").slice(1).join(" ")}
          </Text>
        </View>

        {/* Compartilhamento */}
        <View
          onLayout={(e) => onSectionLayout("compartilhamento", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_sharing_title")}</Text>
          <View style={styles.ul}>
            <BoldPrefix text={t("policy_sharing_vendors")} />
            <BoldPrefix text={t("policy_sharing_legal")} />
          </View>
          <Text style={[styles.p, styles.muted]}>
            {t("policy_sharing_public_events_note")}
          </Text>
        </View>

        {/* Segurança e retenção */}
        <View
          onLayout={(e) =>
            onSectionLayout("seguranca-retencao", e.nativeEvent.layout.y)
          }
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_storage_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("policy_storage_measures")}</Text>
            <Text style={styles.li}>{t("policy_storage_retention")}</Text>
            <Text style={styles.li}>{t("policy_storage_deletion")}</Text>
          </View>
        </View>

        {/* Cookies */}
        <View
          onLayout={(e) => onSectionLayout("cookies", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_cookies_title")}</Text>
          <Text style={styles.p}>{t("policy_cookies_p1")}</Text>
          <Text style={styles.p}>{t("policy_cookies_p2")}</Text>
        </View>

        {/* Direitos */}
        <View
          onLayout={(e) => onSectionLayout("direitos", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_rights_title")}</Text>
          <Text style={styles.p}>{t("policy_rights_intro")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("policy_rights_confirm_access")}</Text>
            <Text style={styles.li}>{t("policy_rights_correction")}</Text>
            <Text style={styles.li}>{t("policy_rights_anon_block_delete")}</Text>
            <Text style={styles.li}>{t("policy_rights_portability")}</Text>
            <Text style={styles.li}>{t("policy_rights_info_sharing")}</Text>
            <Text style={styles.li}>{t("policy_rights_revoke")}</Text>
            <Text style={styles.li}>{t("policy_rights_objection")}</Text>
          </View>
          <Text style={styles.p}>{t("policy_rights_footer")}</Text>
        </View>

        {/* Transferências */}
        <View
          onLayout={(e) => onSectionLayout("transferencias", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_transfers_title")}</Text>
          <Text style={styles.p}>{t("policy_transfers_p")}</Text>
        </View>

        {/* Crianças */}
        <View
          onLayout={(e) => onSectionLayout("criancas", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_children_title")}</Text>
          <Text style={styles.p}>{t("policy_children_p")}</Text>
        </View>

        {/* Alterações */}
        <View
          onLayout={(e) => onSectionLayout("alteracoes", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_changes_title")}</Text>
          <Text style={styles.p}>{t("policy_changes_p")}</Text>
        </View>

        {/* Contato */}
        <View
          onLayout={(e) => onSectionLayout("contato", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("policy_contact_title")}</Text>
          <Text style={styles.p}>{t("policy_contact_p1")}</Text>

          <TouchableOpacity
          
            onPress={() => router.push("/")}
            style={[styles.btn, { backgroundColor: "#000", marginTop: 12 }]}
          >
            <Text style={[styles.btnText, { color: "#fff" }]}>
              {t("policy_contact_button")}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.p, styles.muted, { marginTop: 12 }]}>
            {t("common_questions_contact")}{" "}
            <Text
              onPress={() => router.push("/")}
              style={{ color: ORANGE, textDecorationLine: "underline" }}
            >
              {t("policy_contact_link_label")}
            </Text>
            .
          </Text>
        </View>

        {/* Rodapé simples */}
        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  headerBox: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 13, color: "#6B7280" },
  headerActions: { flexDirection: "row", gap: 8 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  btnSolid: {
    backgroundColor: "#000",
  },
  btnText: { fontSize: 14, fontWeight: "700" },

  tocBox: {
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  tocTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  tocScroll: { paddingRight: 8 },
  tocPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  tocPillText: { fontSize: 13, color: "#374151" },

  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: { marginTop: 20 },
  h2: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 8,
  },
  ul: { marginTop: 6, marginBottom: 8 },
  li: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 6,
  },
  bold: { fontWeight: "700", color: "#111827" },
  muted: { color: "#6B7280" },
})
