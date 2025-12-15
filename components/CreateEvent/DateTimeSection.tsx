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

/* ==========================
   Utils: SEM UTC / SEM FUSO
   ========================== */

const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
const safeDate = (d?: Date) => (d && !isNaN(d.getTime()) ? d : new Date());

function formatLocalDate(d: Date) {
  d = safeDate(d);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // yyyy-MM-dd
}

function formatLocalTime(d: Date) {
  d = safeDate(d);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`; // HH:mm
}

/**
 * Constrói um Date LOCAL a partir de "yyyy-MM-dd" e "HH:mm"
 * SEM usar string ISO (evita bagunça de UTC).
 */
function buildLocalDate(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map((v) => parseInt(v, 10));
  const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10));

  return safeDate(
    new Date(y || 1970, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0),
  );
}

/**
 * Usa data/hora atuais como fallback se vier vazio.
 */
function parseLocal(dateStr?: string, timeStr?: string) {
  const now = new Date();
  const date = dateStr || formatLocalDate(now);
  const time = timeStr || `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return buildLocalDate(date, time);
}

// formata yyyy-mm-dd -> dd/mm/aaaa para exibição
function toBRDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return "";
  return `${pad(d)}/${pad(m)}/${y}`;
}

/* ==========================
   Componente principal
   ========================== */

const DateTimeSection = ({
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
}: Props) => {
  const [showPicker, setShowPicker] = useState<{
    mode: "date" | "time";
    field: "startDate" | "startTime" | "endDate" | "endTime" | null;
  }>({ mode: "date", field: null });

  // valor inicial do picker quando o campo ainda está vazio:
  const currentPickerValue = useMemo(() => {
    const now = new Date();
    switch (showPicker.field) {
      case "startDate":
        return parseLocal(startDate || formatLocalDate(now), startTime || "00:00");
      case "startTime":
        return parseLocal(startDate || formatLocalDate(now), startTime || "00:00");
      case "endDate":
        return parseLocal(endDate || formatLocalDate(now), endTime || "00:00");
      case "endTime":
        return parseLocal(endDate || startDate || formatLocalDate(now), endTime || "00:00");
      default:
        return now;
    }
  }, [showPicker.field, startDate, startTime, endDate, endTime]);

  // minimumDate pro picker (para garantir que término não seja antes do início)
  const minimumDate = useMemo(() => {
    if (!startDate) return undefined;

    if (showPicker.field === "endDate") {
      // mínimo: data de início
      return parseLocal(startDate, startTime || "00:00");
    }

    if (showPicker.field === "endTime" && endDate && endDate === startDate) {
      // mesmo dia: mínimo é a hora de início
      return parseLocal(startDate, startTime || "00:00");
    }

    return undefined;
  }, [showPicker.field, startDate, startTime, endDate]);

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
      case "startDate":
        setStartDate(datePart);
        break;

      case "startTime":
        setStartTime(timePart);
        if (!startDate) setStartDate(datePart);
        break;

      case "endDate":
        setEndDate(datePart);
        break;

      case "endTime":
        setEndTime(timePart);
        if (!endDate) setEndDate(datePart);
        break;
    }

    setShowPicker({ mode: "date", field: null });
  };

  /* ==========================
     Cálculo da duração (igual web)
     ========================== */

  const calculateDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      return "Preencha data e hora de início e término";
    }

    const start = buildLocalDate(startDate, startTime);
    const end = buildLocalDate(endDate, endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Datas/horas inválidas";
    }

    if (end <= start) {
      return "A data/hora de término deve ser posterior à data/hora de início";
    }

    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays >= 1) {
      return `Seu evento vai durar ${Math.round(diffInDays)} dia(s)`;
    } else {
      const diffInHours = diffInMs / (1000 * 60 * 60);
      return `Seu evento vai durar ${Math.round(diffInHours)} hora(s)`;
    }
  };

  const durationMessage = calculateDuration();
  const isError =
    durationMessage &&
    (durationMessage.includes("Preencha") ||
      durationMessage.includes("inválidas") ||
      durationMessage.includes("deve ser posterior"));

  return (
    <View style={styles.section}>
      <Text style={styles.title}>2. Data e horário</Text>
      <Text style={styles.description}>
        Informe aos participantes quando seu evento vai acontecer.
      </Text>

      <View style={styles.row}>
        {/* Início */}
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

        {/* Término */}
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

      {/* Picker */}
      {showPicker.field && (
        <DateTimePicker
          mode={showPicker.mode}
          value={currentPickerValue}
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleConfirm}
          minimumDate={minimumDate}
        />
      )}

      {/* Mensagem de validação/duração */}
      {durationMessage ? (
        <Text
          style={[
            styles.durationText,
            isError ? styles.errorText : styles.successText,
          ]}
        >
          {durationMessage}
        </Text>
      ) : null}
    </View>
  );
};

/* ==========================
   Campo reutilizável
   ========================== */

const DateField = ({
  label,
  value,
  displayValue,
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

/* ==========================
   Styles
   ========================== */

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  description: { marginBottom: 12, color: "#666" },
  row: { gap: 12 },
  inputContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 4, color: "#333" },
  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
  },
  placeholder: { color: "#9CA3AF" },
  durationText: {
    marginTop: 8,
    fontSize: 13,
  },
  errorText: {
    color: "#DC2626",
  },
  successText: {
    color: "#16A34A",
  },
});

export default DateTimeSection;
