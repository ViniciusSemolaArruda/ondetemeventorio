// app/SplashScreen.tsx
import AnimatedIntro from "@/components/AnimatedIntro";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const [finished, setFinished] = useState(false);
  const router = useRouter();
  const handleFinish = () => {
    if (!finished) {
      setFinished(true);
      router.replace("/home");
    }
  };
  return (
    <View style={styles.container}>
      <AnimatedIntro onFinish={handleFinish} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
