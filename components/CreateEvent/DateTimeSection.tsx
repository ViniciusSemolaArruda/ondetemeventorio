import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  startTime: string;
  setStartTime: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  endTime: string;
  setEndTime: React.Dispatch<React.SetStateAction<string>>;
};

// ------- utils locais (sem UTC)
const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
const safeDate = (d?: Date) => (d && !isNaN(d.getTime()) ? d : new Date());

function formatLocalDate(d: Date) {
  d = safeDate(d);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // valor salvo (yyyy-mm-dd)
}
function formatLocalTime(d: Date) {
  d = safeDate(d);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`; // valor salvo (HH:mm)
}
function parseLocal(dateStr?: string, timeStr?: string) {
  const now = new Date();
  const [y, m, d] = (dateStr || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`)
    .split("-")
    .map((v) => parseInt(v, 10));
  const [hh, mm] = (timeStr || `${pad(now.getHours())}:${pad(now.getMinutes())}`)
    .split(":")
    .map((v) => parseInt(v, 10));
  const res = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  return safeDate(res);
}

const DateTimeSection = ({
  startDate, setStartDate,
  startTime, setStartTime,
  endDate,   setEndDate,
  endTime,   setEndTime,
}: Props) => {
  const [showPicker, setShowPicker] = useState<{
    mode: "date" | "time";
    field: "startDate" | "startTime" | "endDate" | "endTime" | null;
  }>({ mode: "date", field: null });

  // valor inicial do picker quando o campo ainda está vazio:
  const currentPickerValue = useMemo(() => {
    const now = new Date();
    switch (showPicker.field) {
      case "startDate": return parseLocal(startDate || formatLocalDate(now), startTime || "00:00");
      case "startTime": return parseLocal(startDate || formatLocalDate(now), startTime || "00:00");
      case "endDate":   return parseLocal(endDate   || formatLocalDate(now), endTime   || "00:00");
      case "endTime":   return parseLocal(endDate   || startDate || formatLocalDate(now), endTime || "00:00");
      default:          return now;
    }
  }, [showPicker.field, startDate, startTime, endDate, endTime]);

  const handleConfirm = (event: any, selected?: Date) => {
    // Android: evento de cancel
    if (Platform.OS !== "ios" && event?.type !== "set") {
      setShowPicker({ mode: "date", field: null });
      return;
    }
    if (!selected) {
      setShowPicker({ mode: "date", field: null });
      return;
    }

    const datePart = formatLocalDate(selected);
    const timePart = formatLocalTime(selected);

    switch (showPicker.field) {
      case "startDate": setStartDate(datePart); if (!startTime) setStartTime(""); break;
      case "startTime": setStartTime(timePart); if (!startDate) setStartDate(datePart); break;
      case "endDate":   setEndDate(datePart);   if (!endTime) setEndTime("");   break;
      case "endTime":   setEndTime(timePart);   if (!endDate) setEndDate(datePart);   break;
    }
    setShowPicker({ mode: "date", field: null });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>2. Data e horário</Text>
      <Text style={styles.description}>Informe aos participantes quando seu evento vai acontecer.</Text>

      <View style={styles.row}>
        <DateField
          label="Data de Início *"
          value={startDate}
          placeholder="dd/mm/aaaa"
          displayValue={startDate ? toBRDate(startDate) : ""}
          onPress={() => setShowPicker({ mode: "date", field: "startDate" })}
        />
        <DateField
          label="Hora de Início *"
          value={startTime}
          placeholder="--:--"
          displayValue={startTime}
          onPress={() => setShowPicker({ mode: "time", field: "startTime" })}
        />
        <DateField
          label="Data de Término *"
          value={endDate}
          placeholder="dd/mm/aaaa"
          displayValue={endDate ? toBRDate(endDate) : ""}
          onPress={() => setShowPicker({ mode: "date", field: "endDate" })}
        />
        <DateField
          label="Hora de Término *"
          value={endTime}
          placeholder="--:--"
          displayValue={endTime}
          onPress={() => setShowPicker({ mode: "time", field: "endTime" })}
        />
      </View>

      {showPicker.field && (
        <DateTimePicker
          mode={showPicker.mode}
          value={currentPickerValue}
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleConfirm}
        />
      )}
    </View>
  );
};

// formata yyyy-mm-dd -> dd/mm/aaaa para exibição
function toBRDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return "";
  return `${pad(d)}/${pad(m)}/${y}`;
}

const DateField = ({
  label,
  value,          // valor “real” salvo (pode estar vazio)
  displayValue,   // valor mostrado (ex.: dd/mm/aaaa)
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  displayValue: string;
  placeholder: string;
  onPress: () => void;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <Pressable onPress={onPress} style={styles.inputBox} accessibilityRole="button">
      <Text style={!value ? styles.placeholder : undefined}>
        {value ? displayValue : placeholder}
      </Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  description: { marginBottom: 12, color: "#666" },
  row: { gap: 12 },
  inputContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 4, color: "#333" },
  inputBox: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
  placeholder: { color: "#9CA3AF" }, // cinza claro tipo placeholder
});

export default DateTimeSection;
