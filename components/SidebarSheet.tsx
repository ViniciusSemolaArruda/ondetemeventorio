// components/SidebarSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useMenu } from "@/context/MenuContext";
import { useGoogleAuth } from "@/hooks/useGoogleLogin";

export default function SidebarSheet() {
  const { user, signOut: appSignOut } = useAuth();
  const { closeMenu } = useMenu();
  const router = useRouter();
  const pathname = usePathname();

  const { signInWithGoogle, signOut: googleSignOut, loading, error } = useGoogleAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const displayName = useMemo(() => user?.name?.trim() || "Usuário", [user?.name]);
  const displayEmail = useMemo(() => user?.email || "", [user?.email]);
  const avatarUri = user?.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Home pode ser "/" (app/index.tsx) ou "/home" (app/home.tsx)
  const isOnHome = pathname === "/" || pathname === "/home";
  const HOME: Href = (pathname === "/" ? "/" : "/home") as Href;

  /** Fecha o menu/modal e só depois navega (evita overlay cinza) */
  const navigateAndClose = (to: Href, opts?: { replace?: boolean }) => {
    if (modalVisible) setModalVisible(false);
    // fecha o menu imediatamente
    closeMenu();
    // espera um tick para o overlay sumir antes de navegar
    setTimeout(() => {
      if (opts?.replace) router.replace(to);
      else router.push(to);
    }, 50);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      setModalVisible(false);
      navigateAndClose(HOME, { replace: true });
    } catch (err: any) {
      Alert.alert("Falha no login", err?.message || "Tente novamente em instantes.");
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
      Alert.alert("Erro ao sair", err?.message || "Tente novamente.");
    } finally {
      setLoggingOut(false);
    }
  };

  const goHome = () => {
    if (isOnHome) {
      // já está na Home: só fecha o menu
      closeMenu();
      return;
    }
    // navega para a Home correta da sua estrutura
    navigateAndClose(HOME, { replace: true });
  };

  const goColecoes = () => navigateAndClose("/colecoes" as Href);

  return (
    <SafeAreaView style={styles.container}>
      {/* Fechar menu */}
      <TouchableOpacity style={styles.closeMenuBtn} onPress={closeMenu}>
        <Ionicons name="close" size={12} color="#FF7500" />
      </TouchableOpacity>

      <Text style={styles.title}>Menu</Text>

      {/* Perfil / Login */}
      {user ? (
        <View style={styles.userInfo}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.userTextCol}>
            <Text style={styles.name}>Olá, {displayName}</Text>
            {!!displayEmail && <Text style={styles.email}>{displayEmail}</Text>}
          </View>
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <View style={styles.loginHeader}>
            <Text style={styles.prompt}>Olá, faça seu login!</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => setModalVisible(true)}
              android_ripple={{ color: "#ddd" }}
            >
              <Ionicons name="log-in-outline" size={20} />
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
                  <Text style={styles.modalTitle}>Acesse sua conta</Text>
                  <Text style={styles.modalDesc}>
                    Entre com sua conta Google para continuar
                  </Text>
                </View>

                <Pressable
                  onPress={handleLogin}
                  disabled={isLoading || loading}
                  style={({ pressed }) => [
                    styles.googleBtn,
                    pressed && styles.googleBtnPressed,
                    (isLoading || loading) && { opacity: 0.7 },
                  ]}
                >
                  <Image
                    source={require("../assets/images/google.png")}
                    style={styles.googleIcon}
                  />
                  {isLoading || loading ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Text style={styles.googleBtnText}>Entrar com Google</Text>
                  )}
                </Pressable>

                {!!error && (
                  <Text style={{ color: "red", marginTop: 8, textAlign: "center" }}>
                    {error}
                  </Text>
                )}

                <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>Fechar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {/* Links */}
      <View style={styles.links}>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [styles.linkBtn, pressed && styles.linkBtnPressed]}
          android_ripple={{ color: "#eee" }}
        >
          <Ionicons name="home-outline" size={18} />
          <Text style={styles.linkText}>Início</Text>
        </Pressable>

        <Pressable
          onPress={goColecoes}
          style={({ pressed }) => [styles.linkBtn, pressed && styles.linkBtnPressed]}
          android_ripple={{ color: "#eee" }}
        >
          <Ionicons name="calendar-outline" size={18} />
          <Text style={styles.linkText}>Meus Eventos</Text>
        </Pressable>

        {user && (
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              styles.linkBtn,
              pressed && styles.linkBtnPressed,
              loggingOut && { opacity: 0.6 },
            ]}
            android_ripple={{ color: "#eee" }}
          >
            <Ionicons name="log-out-outline" size={18} />
            {loggingOut ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.linkText}>Sair da conta</Text>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },

  // Perfil
  userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userTextCol: { flexDirection: "column" },
  name: { fontWeight: "bold", fontSize: 16 },
  email: { fontSize: 12, color: "gray", marginTop: 2 },

  // Login
  loginContainer: { marginBottom: 20 },
  loginHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  prompt: { fontSize: 16, fontWeight: "bold" },
  iconButton: {
    width: 40, height: 40, borderRadius: 8,
    borderWidth: 1, borderColor: "#FF7500", backgroundColor: "#FF7500",
    justifyContent: "center", alignItems: "center",
  },

  // Botão X
  closeMenuBtn: {
    position: "absolute",
    top: 12, right: 12,
    width: 18, height: 18, borderRadius: 6,
    borderWidth: 1, borderColor: "#FF7500",
    backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
  },

  // Modal
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

  closeBtn: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 12 },
  closeBtnText: { color: "#c00", fontWeight: "500" },

  // Links
  links: { marginTop: 20 },
  linkBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12, paddingVertical: 8, paddingHorizontal: 4 },
  linkBtnPressed: { opacity: 0.8 },
  linkText: { fontSize: 16, marginLeft: 8 },
});
