// components/SidebarSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useMenu } from "@/context/MenuContext";
import { useGoogleAuth } from "@/hooks/useGoogleLogin";

export default function SidebarSheet() {
  // ⬇️ agora pegamos refreshUser para garantir user atualizado após o login
  const { user, refreshUser, signOut: appSignOut } = useAuth() as any;
  const { closeMenu } = useMenu();
  const router = useRouter();
  const pathname = usePathname();
  const i18n = useI18n?.();
  const t = (key: string) => i18n?.t?.(key) ?? FALLBACK[key] ?? key;

  const { signInWithGoogle, signOut: googleSignOut, loading, error } = useGoogleAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const displayName = useMemo(() => user?.name?.trim() || t("user_fallback"), [user?.name]);
  const displayEmail = useMemo(() => user?.email || "", [user?.email]);
  const avatarUri = user?.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const isOnHome = pathname === "/" || pathname === "/home";
  const HOME: Href = (pathname === "/" ? "/" : "/home") as Href;

  const navigateAndClose = (to: Href, opts?: { replace?: boolean }) => {
    if (modalVisible) setModalVisible(false);
    closeMenu();
    setTimeout(() => {
      if (opts?.replace) router.replace(to);
      else router.push(to);
    }, 50);
  };

  // ✅ LOGIN: decide destino após sincronizar o usuário
  const handleLogin = async () => {
    try {
      setIsLoading(true);

      // 1) Faz login Google
      await signInWithGoogle();

      // 2) Sincroniza o usuário no contexto (ideal se refreshUser retorna o user atualizado)
      let freshUser: any = undefined;
      if (typeof refreshUser === "function") {
        try {
          freshUser = await refreshUser();
        } catch {
          // se falhar, segue usando o user do contexto
        }
      }

      // 3) Descobre se já tem preferências
      const prefsSet =
        (freshUser?.preferencesSet ??
          user?.preferencesSet ??
          false) === true;

      // 4) Primeiro login (sem prefs) => /welcome; senão => /home
      const target: Href = (prefsSet ? "/home" : "/welcome") as Href;

      setModalVisible(false);
      navigateAndClose(target, { replace: true });
    } catch (err: any) {
      Alert.alert(t("login_error_title"), err?.message || t("try_again"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await googleSignOut();
      await appSignOut();
      navigateAndClose(HOME, { replace: true });
    } catch (err: any) {
      Alert.alert(t("logout_error_title"), err?.message || t("try_again"));
    } finally {
      setLoggingOut(false);
    }
  };

  const goHome = () => {
    if (isOnHome) return closeMenu();
    navigateAndClose(HOME, { replace: true });
  };

  const goColecoes = () => navigateAndClose("/colecoes" as Href);
  const openExternal = (url: string) => Linking.openURL(url).catch(() => {});
  const sendEmail = () => openExternal("mailto:contato.ondetemevento@gmail.com");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
      >
        {/* Fechar */}
        <Pressable style={styles.closeMenuBtn} onPress={closeMenu} accessibilityLabel={t("close_menu")}>
          <Ionicons name="close" size={14} color="#FF7701" />
        </Pressable>

        <Text style={styles.title}>{t("sheet_menu")}</Text>

        {/* Perfil / Login */}
        {user ? (
          <View style={styles.userInfo}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View style={styles.userTextCol}>
              <Text style={styles.name}>
                {t("greeting_named").replace("{name}", displayName)}
              </Text>
              {!!displayEmail && <Text style={styles.email}>{displayEmail}</Text>}
            </View>
          </View>
        ) : (
          <View style={styles.loginContainer}>
            <View style={styles.loginHeader}>
              <Text style={styles.prompt}>{t("sidebar_hello_login")}</Text>
              <Pressable
                style={styles.iconButton}
                onPress={() => setModalVisible(true)}
                android_ripple={{ color: "#ddd" }}
                accessibilityLabel={t("login_google")}
              >
                <Ionicons name="log-in-outline" size={20} color="#fff" />
              </Pressable>
            </View>

            {/* Modal login */}
            <Modal
              visible={modalVisible}
              animationType="fade"
              transparent
              statusBarTranslucent
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.modalTitle}>{t("login_title")}</Text>
                    <Text style={styles.modalDesc}>{t("login_desc")}</Text>
                  </View>

                  <Pressable
                    onPress={handleLogin}
                    disabled={isLoading || loading}
                    style={({ pressed }) => [
                      styles.googleBtn,
                      pressed && styles.googleBtnPressed,
                      (isLoading || loading) && { opacity: 0.7 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={t("login_google")}
                  >
                    <Image
                      source={require("../assets/images/google.png")}
                      style={styles.googleIcon}
                    />
                    {isLoading || loading ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Text style={styles.googleBtnText}>{t("login_google")}</Text>
                    )}
                  </Pressable>

                  {!!error && (
                    <Text style={styles.loginError}>{error}</Text>
                  )}

                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                    accessibilityLabel={t("close")}
                  >
                    <Text style={styles.closeBtnText}>{t("close")}</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
        )}

        {/* Navegação principal */}
        <View style={styles.section}>
          <Pressable
            onPress={goHome}
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
            android_ripple={{ color: "#eee" }}
            accessibilityLabel={t("nav_home")}
          >
            <Ionicons name="home-outline" size={18} />
            <Text style={styles.linkText}>{t("nav_home")}</Text>
          </Pressable>

          <Pressable
            onPress={goColecoes}
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
            android_ripple={{ color: "#eee" }}
            accessibilityLabel={t("nav_collections")}
          >
            <Ionicons name="calendar-outline" size={18} />
            <Text style={styles.linkText}>{t("nav_collections")}</Text>
          </Pressable>
        </View>

        {/* Conta */}
        {user && (
          <View style={styles.section}>
            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              style={({ pressed }) => [
                styles.linkRow,
                pressed && styles.linkRowPressed,
                loggingOut && { opacity: 0.6 },
              ]}
              android_ripple={{ color: "#eee" }}
              accessibilityLabel={t("account_sign_out")}
            >
              <Ionicons name="log-out-outline" size={18} />
              {loggingOut ? (
                <ActivityIndicator size="small" style={{ marginLeft: 8 }} />
              ) : (
                <Text style={styles.linkText}>{t("account_sign_out")}</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Redes sociais */}
        <View style={[styles.section, { paddingTop: 16 }]}>
          <Text style={styles.sectionLabel}>{t("social_follow")}</Text>
          <View style={styles.socialRow}>
            <Pressable
              onPress={() => openExternal("https://instagram.com")}
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && styles.socialBtnPressed,
              ]}
              accessibilityLabel={t("social_instagram_aria") ?? "Instagram"}
            >
              <Ionicons name="logo-instagram" size={18} color="#FF7701" />
            </Pressable>

            <Pressable
              onPress={() => openExternal("https://facebook.com")}
              style={({ pressed }) => [
                styles.socialBtn,
                pressed && styles.socialBtnPressed,
              ]}
              accessibilityLabel={t("social_facebook_aria") ?? "Facebook"}
            >
              <Ionicons name="logo-facebook" size={18} color="#FF7701" />
            </Pressable>
          </View>
        </View>

        {/* Legal */}
        <View style={[styles.section, { paddingTop: 8 }]}>
          <View style={styles.divider} />
          <Pressable style={styles.legalLink} onPress={() => navigateAndClose("/termos" as Href)}>
            <Text style={styles.legalText}>{t("footer_terms")}</Text>
          </Pressable>
          <Pressable style={styles.legalLink} onPress={() => navigateAndClose("/politica" as Href)}>
            <Text style={styles.legalText}>{t("footer_privacy")}</Text>
          </Pressable>
          <Pressable style={styles.legalLink} onPress={() => navigateAndClose("/cookies" as Href)}>
            <Text style={styles.legalText}>{t("footer_cookies")}</Text>
          </Pressable>
          <Pressable style={styles.legalLink} onPress={() => navigateAndClose("/contato" as Href)}>
            <Text style={styles.legalText}>{t("footer_contact")}</Text>
          </Pressable>
        </View>

        {/* Informações da empresa (sempre no fim) */}
        <View style={[styles.section, styles.footer]}>
          <View style={styles.divider} />
          <Text style={styles.companyLine}>
            <Text style={styles.companyBold}>{t("footer_cnpj")}:</Text> 15.914.276/0001-52
          </Text>
          <Text style={styles.companyLine}>
            <Text style={styles.companyBold}>{t("footer_address")}:</Text> Rua Exemplo, 123 - Rio de Janeiro - RJ
          </Text>
          <Text style={styles.companyLine}>
            <Text style={styles.companyBold}>{t("footer_email")}:</Text>{" "}
            <Text style={styles.emailLink} onPress={sendEmail}>
              contato.ondetemevento@gmail.com
            </Text>
          </Text>
          <Text style={styles.copy}>© 2025 Copyright Capadócia Produções</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ORANGE = "#FF7701";

// Fallback simples para quando o provider ainda não estiver montado.
const FALLBACK: Record<string, string> = {
  sheet_menu: "Menu",
  sidebar_hello_login: "Olá, faça seu login!",
  login_title: "Acesse sua conta",
  login_desc: "Entre com sua conta Google para continuar",
  login_google: "Entrar com Google",
  login_error_title: "Falha no login",
  logout_error_title: "Erro ao sair",
  try_again: "Tente novamente.",
  close: "Fechar",
  close_menu: "Fechar menu",
  nav_home: "Início",
  nav_collections: "Coleções",
  social_follow: "Siga nas redes",
  footer_terms: "Termos de Uso",
  footer_privacy: "Política de Privacidade",
  footer_cookies: "Política de Cookies",
  footer_contact: "Contato",
  footer_cnpj: "CNPJ",
  footer_address: "Endereço",
  footer_email: "E-mail",
  account_sign_out: "Sair da conta",
  greeting_named: "Olá, {name}",
  user_fallback: "Usuário",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  closeMenuBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ORANGE,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },

  userInfo: { flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userTextCol: { flexDirection: "column" },
  name: { fontWeight: "bold", fontSize: 16 },
  email: { fontSize: 12, color: "gray", marginTop: 2 },

  loginContainer: { marginTop: 8, marginBottom: 12 },
  loginHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  prompt: { fontSize: 16, fontWeight: "bold" },
  iconButton: {
    width: 40, height: 40, borderRadius: 8,
    borderWidth: 1, borderColor: ORANGE, backgroundColor: ORANGE,
    justifyContent: "center", alignItems: "center",
  },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center", paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%", maxWidth: 420, backgroundColor: "#fff",
    borderRadius: 12, padding: 20, alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "600", textAlign: "center" },
  modalDesc: { fontSize: 13, color: "#6b7280", textAlign: "center", marginTop: 6 },

  googleBtn: {
    marginTop: 16, alignSelf: "stretch",
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  googleBtnPressed: { backgroundColor: "#f3f4f6" },
  googleIcon: { width: 20, height: 20, marginRight: 8, resizeMode: "contain" },
  googleBtnText: { fontSize: 15, fontWeight: "600", color: "#374151" },
  loginError: { color: "red", marginTop: 8, textAlign: "center" },
  closeBtn: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 12 },
  closeBtnText: { color: "#c00", fontWeight: "500" },

  section: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb", paddingTop: 12, marginTop: 8 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 4 },
  linkRowPressed: { opacity: 0.85 },
  linkText: { fontSize: 16, marginLeft: 8 },

  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase", color: "#6b7280", marginBottom: 8 },
  socialRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  socialBtn: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 10 },
  socialBtnPressed: { backgroundColor: "#f9fafb" },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#e5e7eb", marginBottom: 8 },
  legalLink: { paddingVertical: 10 },
  legalText: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, color: "#374151" },

  companyLine: { fontSize: 13, color: "#374151", marginBottom: 6 },
  companyBold: { fontWeight: "600" },
  emailLink: { textDecorationLine: "underline" },
  copy: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#e5e7eb", fontSize: 12, color: "#6b7280" },

  // empurra o bloco final para o fim do ScrollView
  footer: { marginTop: "auto" },
});
