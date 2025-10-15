// components/ProducerSection.tsx
import React, { memo, useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  producerName: string;
  producerDescription: string;
  onChangeProducerName: (text: string) => void;
  onChangeProducerDescription: (text: string) => void;
  maxNameLength?: number;
  maxDescriptionLength?: number;
};

function ProducerSection({
  producerName,
  producerDescription,
  onChangeProducerName,
  onChangeProducerDescription,
  maxNameLength = 80,
  maxDescriptionLength = 600,
}: Props) {
  const nameOver = producerName?.length > maxNameLength;
  const descOver = producerDescription?.length > maxDescriptionLength;

  const nameCounter = useMemo(
    () => `${producerName.length}/${maxNameLength}`,
    [producerName.length, maxNameLength]
  );
  const descCounter = useMemo(
    () => `${producerDescription.length}/${maxDescriptionLength}`,
    [producerDescription.length, maxDescriptionLength]
  );

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>6. Sobre o produtor</Text>
        <Text style={styles.optionalNote}>
          Opcional — se não tiver o que informar, pode deixar em branco.{"\n"}
          Compartilhar detalhes sobre a produtora melhora a confiança do público.
        </Text>
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Nome do Produtor</Text>
          <Text style={[styles.counter, nameOver && styles.counterOver]}>
            {nameCounter}
          </Text>
        </View>

        <TextInput
          style={[styles.input, nameOver && styles.inputWarn]}
          value={producerName}
          onChangeText={onChangeProducerName}
          placeholder="Ex.: Farol das Estrelas Produções / João Silva"
          autoCapitalize="words"
          autoCorrect
          accessibilityLabel="Nome do produtor (opcional)"
          accessibilityHint="Campo opcional. Informe o nome da pessoa ou empresa responsável."
        />

        <Text style={[styles.helper, styles.helperOptional]}>
          Campo opcional.
        </Text>
        {nameOver && (
          <Text style={styles.helperWarn}>
            Dica: mantenha até {maxNameLength} caracteres para melhor leitura.
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Descrição</Text>
          <Text style={[styles.counter, descOver && styles.counterOver]}>
            {descCounter}
          </Text>
        </View>

        <TextInput
          style={[styles.input, styles.textarea, descOver && styles.inputWarn]}
          multiline
          numberOfLines={6}
          value={producerDescription}
          onChangeText={onChangeProducerDescription}
          placeholder="Conte rapidamente quem é a produtora, histórico e canais de contato (site/Instagram)."
          textAlignVertical="top"
          accessibilityLabel="Descrição do produtor (opcional)"
          accessibilityHint="Campo opcional. Fale sobre o produtor/organizador e canais de contato."
        />

        <Text style={[styles.helper, styles.helperOptional]}>
          Opcional — informe um breve perfil do produtor/organizador.
        </Text>
        {descOver && (
          <Text style={styles.helperWarn}>
            Dica: tente ficar dentro de {maxDescriptionLength} caracteres para
            facilitar a leitura.
          </Text>
        )}
      </View>
    </View>
  );
}

export default memo(ProducerSection);

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  headingRow: { marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 6 },
  optionalNote: { fontSize: 12, color: "#dc2626", lineHeight: 16 },
  field: { marginBottom: 16 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155" },
  counter: { fontSize: 11, color: "#6b7280" },
  counterOver: { color: "#dc2626", fontWeight: "700" },
  input: {
    borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: "#fff",
  },
  textarea: { height: 140 },
  inputWarn: { borderColor: "#f59e0b" },
  helper: { marginTop: 6, fontSize: 12, lineHeight: 16 },
  helperOptional: { color: "#dc2626" },
  helperWarn: { color: "#b45309" },
});
