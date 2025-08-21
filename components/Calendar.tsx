import { Feather } from "@expo/vector-icons"
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    isAfter,
    isBefore,
    isSameMonth,
    isToday,
    isWithinInterval,
    startOfMonth,
    subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"

type RawEvent = {
  id: string
  name: string
  address: string
  startDate: string
  endDate: string
}

interface Event {
  id: string
  name: string
  address: string
  startDate: Date
  endDate: Date
}

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("https://ondetemeventorio.vercel.app/api/events")
        if (!res.ok) throw new Error("Erro ao carregar eventos")
        const data: RawEvent[] = await res.json()
        if (!active) return
        const parsed: Event[] = data.map((e) => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: new Date(e.endDate),
        }))
        setEvents(parsed)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const startDay = monthStart.getDay()
    const emptyStartDays = Array(startDay).fill(null)

    const totalDays: (Date | null)[] = [...emptyStartDays, ...daysInMonth]
    while (totalDays.length < 42) totalDays.push(null)

    return totalDays
  }, [currentMonth])

  const getEventsForDay = useCallback(
    (day: Date) => {
      const target = new Date(day)
      target.setHours(0, 0, 0, 0)
      return events.filter((e) => {
        const start = new Date(e.startDate)
        const end = new Date(e.endDate)
        start.setHours(0, 0, 0, 0)
        end.setHours(0, 0, 0, 0)
        return isWithinInterval(target, { start, end })
      })
    },
    [events],
  )

  const getEventStatus = (event: Event) => {
    const now = new Date()
    if (isBefore(now, event.startDate)) return "scheduled"
    if (isWithinInterval(now, { start: event.startDate, end: event.endDate })) return "ongoing"
    if (isAfter(now, event.endDate)) return "finished"
    return "scheduled"
  }

  const handleDayPress = (day: Date) => {
    const dayEvents = getEventsForDay(day)
    if (dayEvents.length > 0) {
      setSelectedDay(day)
      setSelectedEvents(dayEvents)
      setIsDialogOpen(true)
    }
  }

  const renderDay = (day: Date | null, index: number) => {
    const inMonth = day && isSameMonth(day, currentMonth)
    const dayEvents = day ? getEventsForDay(day) : []
    const isTodayValid = day && isToday(day) && isSameMonth(day, currentMonth)

    return (
      <TouchableOpacity
        key={index}
        style={[styles.day, isTodayValid && styles.today]}
        onPress={() => day && handleDayPress(day)}
        disabled={!day}
      >
        {day && <Text style={styles.dayText}>{format(day, "d")}</Text>}
        <View style={styles.eventDots}>
          {dayEvents.slice(0, 3).map((event, i) => {
            const status = getEventStatus(event)
            const color =
              status === "finished" ? "#f43f5e" : status === "ongoing" ? "#10b981" : "#3b82f6"
            return <View key={i} style={[styles.dot, { backgroundColor: color }]} />
          })}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <Feather name="chevron-left" size={20} color="#f97316" />
        </TouchableOpacity>
        <View style={styles.monthLabel}>
          <Feather name="calendar" size={16} color="#f97316" />
          <Text style={styles.monthText}>{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</Text>
          <Feather name="sun" size={16} color="#f97316" />
        </View>
        <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <Feather name="chevron-right" size={20} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Dias da semana */}
      <View style={styles.weekdays}>
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <Text key={i} style={styles.weekday}>{d}</Text>
        ))}
      </View>

      {/* Dias */}
      <View style={styles.grid}>
        {days.map((day, index) => renderDay(day, index))}
      </View>

      {/* Legenda */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#f43f5e" }]} />
          <Text style={styles.legendText}>Finalizado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#3b82f6" }]} />
          <Text style={styles.legendText}>Agendado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>Em andamento</Text>
        </View>
      </View>

      {/* Modal */}
      <Modal visible={isDialogOpen} transparent animationType="fade">

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Eventos em {selectedDay && format(selectedDay, "dd/MM/yyyy")}
            </Text>
            <FlatList
              data={selectedEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.eventItem}>
                  <View
                    style={[styles.dot, {
                      backgroundColor:
                        getEventStatus(item) === "finished"
                          ? "#f43f5e"
                          : getEventStatus(item) === "ongoing"
                          ? "#10b981"
                          : "#3b82f6",
                    }]}
                  />
                  <View>
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text style={styles.eventDetails}>📍 {item.address}</Text>
                    <Text style={styles.eventDetails}>
                      ⏰ {format(item.startDate, "dd/MM/yyyy HH:mm")} - {format(item.endDate, "dd/MM/yyyy HH:mm")}
                    </Text>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => setIsDialogOpen(false)}>
              <Text style={styles.closeButton}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginHorizontal: 8,
  },
  weekdays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekday: {
    width: "14.28%",
    textAlign: "center",
    fontWeight: "600",
    color: "#999",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  today: {
    borderColor: "#f97316",
    borderWidth: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },
  eventDots: {
    flexDirection: "row",
    marginTop: 2,
    gap: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  eventItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  eventName: {
    fontWeight: "bold",
  },
  eventDetails: {
    fontSize: 12,
    color: "#555",
  },
  closeButton: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
    color: "#f97316",
  },
})
