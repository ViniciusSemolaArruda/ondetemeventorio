// components/search.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Search as SearchIcon } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().trim().min(1, {
    message: "Digite algo para buscar",
  }),
});

type Props = {
  onSubmit?: (title: string) => void;
};

type FormData = z.infer<typeof formSchema>;

export default function Search({ onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const handleLocalSubmit = (data: FormData) => {
    if (onSubmit) {
      onSubmit(data.title);
    }
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              placeholder="Faça sua busca..."
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              returnKeyType="search"
              onSubmitEditing={handleSubmit(handleLocalSubmit)}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              onPress={handleSubmit(handleLocalSubmit)}
              style={styles.button}
            >
              <SearchIcon size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
  },
  button: {
    marginLeft: 8, // separa do input
    backgroundColor: "#FF7500",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    marginTop: 4,
    color: "red",
    fontSize: 12,
  },
});


