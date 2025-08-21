import { useRouter } from "expo-router";
import { Menu, Undo2 } from "lucide-react-native";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Header2 = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/home");
  };

  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleGoHome}>
          <Image
            source={require("../assets/images/logo01.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.buttonGhost} onPress={handleGoHome}>
            <Undo2 size={18} color="#555" />
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Menu size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
  backgroundColor: "#fff",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderColor: "#ddd",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
  marginTop: 0,
  width: "100%",             // ✅ força a largura total
  alignSelf: "center",       // ✅ centraliza se estiver dentro de ScrollView
},

  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 100,
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonGhost: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: "#f0f0f0",
    gap: 6,
  },
  buttonText: {
    color: "#555",
    fontWeight: "600",
  },
  iconButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
  },
});

export default Header2;
