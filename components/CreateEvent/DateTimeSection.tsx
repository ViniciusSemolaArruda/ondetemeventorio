import DateTimePicker from "@react-native-community/datetimepicker"
import React, { useMemo, useState } from "react"
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native"

type Props = {
  startDate: string
  setStartDate: React.Dispatch<React.SetStateAction<string>>
  startTime: string
  setStartTime: React.Dispatch<React.SetStateAction<string>>
  endDate: string
  setEndDate: React.Dispatch<React.SetStateAction<string>>
  endTime: string
  setEndTime: React.Dispatch<React.SetStateAction<string>>
}

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
    mode: "date" | "time"
    field: "startDate" | "startTime" | "endDate" | "endTime" | null
  }>({
    mode: "date",
    field: null,
  })

  const handleConfirm = (
    event: any,
    selectedDate: Date | undefined
  ) => {
    if (!selectedDate) {
      setShowPicker({ mode: "date", field: null })
      return
    }

    const iso = selectedDate.toISOString()
    const datePart = iso.split("T")[0]
    const timePart = iso.split("T")[1].substring(0, 5)

    switch (showPicker.field) {
      case "startDate":
        setStartDate(datePart)
        break
      case "startTime":
        setStartTime(timePart)
        break
      case "endDate":
        setEndDate(datePart)
        break
      case "endTime":
        setEndTime(timePart)
        break
    }

    setShowPicker({ mode: "date", field: null })
  }

  const durationMessage = useMemo(() => {
    if (startDate && startTime && endDate && endTime) {
      try {
        const start = new Date(`${startDate}T${startTime}`)
        const end = new Date(`${endDate}T${endTime}`)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null
        if (end <= start) return "A data/hora de término deve ser posterior à data/hora de início"

        const diffMs = end.getTime() - start.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)

        if (diffDays >= 1) {
          return `Seu evento vai durar ${Math.round(diffDays)} dias`
        } else {
          const diffHours = diffMs / (1000 * 60 * 60)
          return `Seu evento vai durar ${Math.round(diffHours)} horas`
        }
      } catch {
        return null
      }
    }
    return null
  }, [startDate, startTime, endDate, endTime])

  return (
    <View style={styles.section}>
      <Text style={styles.title}>2. Data e horário</Text>
      <Text style={styles.description}>
        Informe aos participantes quando seu evento vai acontecer.
      </Text>

      <View style={styles.row}>
        <DateField
          label="Data de Início *"
          value={startDate}
          onPress={() => setShowPicker({ mode: "date", field: "startDate" })}
        />
        <DateField
          label="Hora de Início *"
          value={startTime}
          onPress={() => setShowPicker({ mode: "time", field: "startTime" })}
        />
        <DateField
          label="Data de Término *"
          value={endDate}
          onPress={() => setShowPicker({ mode: "date", field: "endDate" })}
        />
        <DateField
          label="Hora de Término *"
          value={endTime}
          onPress={() => setShowPicker({ mode: "time", field: "endTime" })}
        />
      </View>

      {durationMessage && (
        <Text
          style={[
            styles.durationMessage,
            durationMessage.includes("posterior")
              ? styles.durationError
              : styles.durationSuccess,
          ]}
        >
          {durationMessage}
        </Text>
      )}

      {showPicker.field && (
        <DateTimePicker
          mode={showPicker.mode}
          value={new Date()}
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleConfirm}
        />
      )}
    </View>
  )
}

const DateField = ({
  label,
  value,
  onPress,
}: {
  label: string
  value: string
  onPress: () => void
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <Pressable onPress={onPress} style={styles.inputBox}>
      <Text>{value || "--"}</Text>
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    marginBottom: 12,
    color: "#666",
  },
  row: {
    gap: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
  },
  durationMessage: {
    marginTop: 10,
    fontSize: 13,
  },
  durationSuccess: {
    color: "#2e7d32",
  },
  durationError: {
    color: "#c62828",
  },
})

export default DateTimeSection
