import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BarbershopItem from "../components/barbershop-item";
import { Barbershop } from "../types/barbershop";

export default function AllBarbershopsScreen() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Barbershop[]>([]);
  const router = useRouter();

  const fetchResults = async () => {
    try {
      const res = await fetch(
        `http://https://ondetemeventorio.vercel.app/api/events?title=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setResults(data);
      Keyboard.dismiss();
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar eventos</Text>

      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Digite o nome do evento"
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={fetchResults}
        />
        <TouchableOpacity onPress={fetchResults} style={styles.button}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BarbershopItem
            barbershop={item}
            isLoggedIn={true}
            onPressIngresso={(id) => {
              router.push({
                pathname: "/detalhe/[id]",
                params: { id },
              });
            }}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  searchBox: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  button: {
    marginLeft: 8,
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 24,
    fontSize: 14,
  },
});
