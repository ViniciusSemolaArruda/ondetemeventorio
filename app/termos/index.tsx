// app/termos/index.tsx
import Header2 from "@/components/Header2"
import { useI18n } from "@/context/I18nContext"
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

type Section = { id: string; label: string }

export default function TermosScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const updatedAt = "05/09/2025"

  // === Seções (sumário) ===
  const sections: Section[] = useMemo(
    () => [
      { id: "objeto", label: t("terms_object_title") },
      { id: "cadastro", label: t("terms_signup_title") },
      { id: "usuario", label: t("terms_user_title") },
      { id: "plataforma", label: t("terms_platform_title") },
      { id: "propriedade", label: t("terms_ip_title") },
      { id: "modificacoes", label: t("terms_changes_title") },
      { id: "foro", label: t("terms_forum_title") },
      { id: "diretrizes", label: t("terms_guidelines_title") },
      { id: "moderacao", label: t("terms_moderation_title") },
      { id: "organizador", label: t("terms_organizer_title") },
      { id: "alteracoes", label: t("terms_vigencia_title") },
      { id: "contato", label: t("terms_contact_title") },
    ],
    [t]
  )

  // === Scroll & âncoras ===
  const scrollRef = useRef<ScrollView>(null)
  const [yMap, setYMap] = useState<Record<string, number>>({})
  const HEADER_HEIGHT = 0

  const onSectionLayout = (id: string, y: number) =>
    setYMap((prev) => ({ ...prev, [id]: y }))

  const scrollToSection = (id: string) => {
    const y = yMap[id] ?? 0
    scrollRef.current?.scrollTo({
      y: Math.max(y - HEADER_HEIGHT - 12, 0),
      animated: true,
    })
  }

  const onScroll = (_e: NativeSyntheticEvent<NativeScrollEvent>) => {}

  // Helper para strings "Prefixo: descrição"
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

  const ORANGE = "#FF7500"

  return (
    <>
    <Header2/>
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.headerBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("terms_title")}</Text>
          <Text style={styles.subtitle}>
            {t("common_last_updated")}: <Text>{updatedAt}</Text>
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={[styles.btn, styles.btnOutline]}
          >
            <Text style={[styles.btnText, { color: "#374151" }]}>
              {t("terms_header_contact")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sumário */}
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
        {/* 1. Objeto */}
        <View onLayout={(e) => onSectionLayout("objeto", e.nativeEvent.layout.y)}>
          <Text style={styles.h2}>{t("terms_object_title")}</Text>
          <Text style={styles.p}>{t("terms_object_p")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_object_no_tickets")}</Text>
            <Text style={styles.li}>{t("terms_object_partners")}</Text>
            <Text style={styles.li}>{t("terms_object_preferences")}</Text>
          </View>
        </View>

        {/* 2. Cadastro */}
        <View
          onLayout={(e) => onSectionLayout("cadastro", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_signup_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_signup_access")}</Text>
            <Text style={styles.li}>{t("terms_signup_email")}</Text>
            <Text style={styles.li}>{t("terms_signup_features")}</Text>
          </View>
        </View>

        {/* 3. Usuário */}
        <View
          onLayout={(e) => onSectionLayout("usuario", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_user_title")}</Text>
          <Text style={styles.p}>{t("terms_user_p")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_user_lawful")}</Text>
            <Text style={styles.li}>{t("terms_user_no_illegal")}</Text>
            <Text style={styles.li}>{t("terms_user_organizers")}</Text>
          </View>
        </View>

        {/* 4. Plataforma */}
        <View
          onLayout={(e) => onSectionLayout("plataforma", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_platform_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_platform_no_responsibility")}</Text>
            <Text style={styles.li}>{t("terms_platform_mci")}</Text>
          </View>
        </View>

        {/* 5. Propriedade Intelectual */}
        <View
          onLayout={(e) => onSectionLayout("propriedade", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_ip_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_ip_brand")}</Text>
            <Text style={styles.li}>{t("terms_ip_nocopy")}</Text>
          </View>
        </View>

        {/* 6. Modificações */}
        <View
          onLayout={(e) => onSectionLayout("modificacoes", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_changes_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_changes_notice")}</Text>
            <Text style={styles.li}>{t("terms_changes_effective")}</Text>
            <Text style={styles.li}>{t("terms_changes_continued_use")}</Text>
            <Text style={styles.li}>{t("terms_changes_end_use")}</Text>
          </View>
        </View>

        {/* 7. Foro */}
        <View
          onLayout={(e) => onSectionLayout("foro", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_forum_title")}</Text>
          <Text style={styles.p}>{t("terms_forum_p")}</Text>
        </View>

        {/* 8. Diretrizes */}
        <View
          onLayout={(e) => onSectionLayout("diretrizes", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_guidelines_title")}</Text>

          <Text style={styles.h3}>{t("terms_guidelines_fields_sub")}</Text>
          <View style={styles.ul}>
            <BoldPrefix text={t("terms_fields_title")} />
            <BoldPrefix text={t("terms_fields_description")} />
            <BoldPrefix text={t("terms_fields_categories")} />
            <BoldPrefix text={t("terms_fields_date_time")} />
            <BoldPrefix text={t("terms_fields_location")} />
            <BoldPrefix text={t("terms_fields_links")} />
            <BoldPrefix text={t("terms_fields_cover")} />
            <BoldPrefix text={t("terms_fields_organizer_contact")} />
          </View>

          <Text style={[styles.h3, { marginTop: 12 }]}>{t("terms_text_sub")}</Text>
          <Text style={styles.p}>{t("terms_text_intro")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_text_insults")}</Text>
            <Text style={styles.li}>{t("terms_text_hate")}</Text>
            <Text style={styles.li}>{t("terms_text_crimes")}</Text>
            <Text style={styles.li}>{t("terms_text_misinformation")}</Text>
            <Text style={styles.li}>{t("terms_text_ip_rights")}</Text>
          </View>

          <Text style={[styles.h3, { marginTop: 12 }]}>{t("terms_images_sub")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_images_porn")}</Text>
            <Text style={styles.li}>{t("terms_images_violence")}</Text>
            <Text style={styles.li}>{t("terms_images_hate")}</Text>
            <Text style={styles.li}>{t("terms_images_rights")}</Text>
            <Text style={styles.li}>{t("terms_images_quality")}</Text>
          </View>

          <Text style={[styles.h3, { marginTop: 12 }]}>{t("terms_links_sub")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_links_review")}</Text>
            <Text style={styles.li}>{t("terms_links_malicious")}</Text>
            <Text style={styles.li}>{t("terms_links_tickets")}</Text>
          </View>

          <Text style={[styles.h3, { marginTop: 12 }]}>{t("terms_other_sub")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_other_compliance")}</Text>
            <Text style={styles.li}>{t("terms_other_sensitives")}</Text>
            <Text style={styles.li}>{t("terms_other_update")}</Text>
          </View>
        </View>

        {/* 9. Moderação */}
        <View
          onLayout={(e) => onSectionLayout("moderacao", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_moderation_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_moderation_review")}</Text>
            <Text style={styles.li}>{t("terms_moderation_sanctions")}</Text>
            <Text style={styles.li}>{t("terms_moderation_ranking")}</Text>
          </View>
        </View>

        {/* 10. Organizador */}
        <View
          onLayout={(e) => onSectionLayout("organizador", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_organizer_title")}</Text>
          <View style={styles.ul}>
            <Text style={styles.li}>{t("terms_organizer_rights")}</Text>
            <Text style={styles.li}>{t("terms_organizer_authorize")}</Text>
            <Text style={styles.li}>{t("terms_organizer_support")}</Text>
          </View>
        </View>

        {/* 11. Vigência/Alterações */}
        <View
          onLayout={(e) => onSectionLayout("alteracoes", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_vigencia_title")}</Text>
          <Text style={styles.p}>{t("terms_vigencia_p")}</Text>
        </View>

        {/* 12. Contato */}
        <View
          onLayout={(e) => onSectionLayout("contato", e.nativeEvent.layout.y)}
          style={styles.section}
        >
          <Text style={styles.h2}>{t("terms_contact_title")}</Text>
          <Text style={styles.p}>
            {t("terms_contact_p")}
            <Text
              onPress={() => router.push("/")}
              style={{ color: ORANGE, textDecorationLine: "underline" }}
            >
              {t("terms_contact_link_label")}
            </Text>
            .
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/")}
            style={[styles.btn, { backgroundColor: "#000", marginTop: 12 }]}
          >
            <Text style={[styles.btnText, { color: "#fff" }]}>
              {t("terms_contact_button")}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 12 }} />
          <Text style={[styles.p, styles.muted]}>{t("terms_footer_notice")}</Text>
        </View>

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

  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnOutline: { borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: "#fff" },
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

  content: { paddingHorizontal: 16, paddingVertical: 16 },
  section: { marginTop: 20 },
  h2: { fontSize: 20, fontWeight: "800", color: "#111827", marginBottom: 8 },
  h3: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 6 },
  p: { fontSize: 15, lineHeight: 22, color: "#374151", marginBottom: 8 },
  ul: { marginTop: 6, marginBottom: 8 },
  li: { fontSize: 15, lineHeight: 22, color: "#374151", marginBottom: 6 },
  bold: { fontWeight: "700", color: "#111827" },
  muted: { color: "#6B7280" },
})
