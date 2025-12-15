// Calendar.tsx
import { Feather } from "@expo/vector-icons";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS, es as esES, ptBR } from "date-fns/locale";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* i18n */
import { useI18n } from "@/context/I18nContext";
/* região por endereço */
import { mapCityToRegion } from "@/lib/rjRegions";

type RawEvent = {
  id: string;
  name: string;
  address: string;
  startDate: string;
  endDate: string;
};

interface Event {
  id: string;
  name: string;
  address: string;
  startDate: Date;
  endDate: Date;
}

type EventRuntime = Event & {
  _startMs: number; // normalizado 00:00
  _endMs: number; // normalizado 00:00
};

type Props = {
  region?: string; // "" = todas
  externalEvents?: RawEvent[];
};

const DOT_COLORS = {
  finished: "#f43f5e",
  scheduled: "#3b82f6",
  ongoing: "#10b981",
} as const;

/* ---------- helpers ---------- */
const toYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const midnightMs = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};
const statusOf = (nowMs: number, ev: EventRuntime) => {
  if (nowMs < ev._startMs) return "scheduled";
  if (nowMs > ev._endMs) return "finished";
  return "ongoing";
};

/* ---------- memoized dot ---------- */
const Dot = React.memo(function Dot({ color }: { color: string }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
});

/* ---------- memoized day cell ---------- */
type DayCellProps = {
  day: Date | null;
  inMonth: boolean;
  isTodayValid: boolean;
  dots: string[]; // cores (hex)
  onPress?: (d: Date) => void;
};
const DayCell = React.memo(function DayCell({
  day,
  inMonth,
  isTodayValid,
  dots,
  onPress,
}: DayCellProps) {
  const handlePress = useCallback(() => {
    if (day && onPress) onPress(day);
  }, [day, onPress]);

  return (
    <Pressable
      disabled={!day}
      onPress={handlePress}
      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
      style={[styles.day, isTodayValid && styles.today]}
    >
      {day ? (
        <Text style={[styles.dayText, { color: inMonth ? "#0F172A" : "#CBD5E1" }]}>
          {day.getDate()}
        </Text>
      ) : (
        <Text style={[styles.dayText, { color: "transparent" }]}>0</Text>
      )}

      <View style={styles.eventDots}>
        {dots.slice(0, 3).map((c, i) => (
          <View key={i} style={[styles.dotWrap, i > 0 && styles.dotWrapSpacing]}>
            <Dot color={c} />
          </View>
        ))}
      </View>
    </Pressable>
  );
});

/* =======================
   Componente principal
   ======================= */
export default function Calendar({ region = "", externalEvents }: Props) {
  const { t, lang } = useI18n();
  const router = useRouter();

  const locale = useMemo(() => {
    if (lang === "en") return enUS;
    if (lang === "es") return esES;
    return ptBR;
  }, [lang]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [events, setEvents] = useState<EventRuntime[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<EventRuntime[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔔 pede permissão de notificação uma vez
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();
  }, []);

  // fetch (ou usa externos)
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        let data: RawEvent[];

        if (externalEvents) {
          data = externalEvents;
        } else {
          const res = await fetch(
            "https://ondetemeventorio.vercel.app/api/events",
            {
              signal: controller.signal,
            }
          );
          if (!res.ok) throw new Error("failed");
          data = await res.json();
        }

        if (!alive) return;

        // normaliza apenas 1x
        const parsed: EventRuntime[] = data.map((e) => {
          const s = new Date(e.startDate);
          const eEnd = new Date(e.endDate);
          const _s = midnightMs(s);
          const _e = midnightMs(eEnd);
          return {
            id: e.id,
            name: e.name,
            address: e.address,
            startDate: s,
            endDate: eEnd,
            _startMs: _s,
            _endMs: _e,
          };
        });

        setEvents(parsed);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [externalEvents]);

  // filtro por região
  const filteredEvents = useMemo(() => {
    const r = (region || "").trim();
    if (!r) return events;
    return events.filter((e) => mapCityToRegion(e.address ?? "") === r);
  }, [events, region]);

  // dias do mês (6 linhas * 7 colunas = 42)
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });

    const arr: (Date | null)[] = [];
    for (let i = 0; i < 42; i++) {
      const d = addDays(gridStart, i);
      if (d < monthStart || d > monthEnd) {
        arr.push(null);
      } else {
        arr.push(d);
      }
    }
    return arr;
  }, [currentMonth]);

  // index de eventos por dia do mês corrente -> { 'YYYY-MM-DD': [EventRuntime] }
  const eventsByDay = useMemo(() => {
    const index = new Map<string, EventRuntime[]>();
    if (filteredEvents.length === 0) return index;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthStartMs = monthStart.getTime();
    const monthEndMs = monthEnd.getTime();

    for (const ev of filteredEvents) {
      if (ev._endMs < monthStartMs || ev._startMs > monthEndMs) continue;

      const start = Math.max(ev._startMs, monthStartMs);
      const end = Math.min(ev._endMs, monthEndMs);

      for (let cur = start; cur <= end; cur += 24 * 60 * 60 * 1000) {
        const d = new Date(cur);
        const key = toYMD(d);
        const arr = index.get(key);
        if (arr) arr.push(ev);
        else index.set(key, [ev]);
      }
    }
    return index;
  }, [filteredEvents, currentMonth]);

  // cabeçalho dos dias (Dom..Sáb) no locale
  const weekdays = useMemo(() => {
    const base = startOfWeek(currentMonth, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, i) =>
      format(addDays(base, i), "EEEEE", { locale })
    );
  }, [currentMonth, locale]);

  const nowMs = useMemo(() => midnightMs(new Date()), []);

  // clique no dia
  const handleDayPress = useCallback(
    (day: Date) => {
      const key = toYMD(day);
      const dayEvents = eventsByDay.get(key) || [];
      if (dayEvents.length > 0) {
        setSelectedDay(day);
        setSelectedEvents(dayEvents);
        setIsDialogOpen(true);
      }
    },
    [eventsByDay]
  );

  // navega para tela do evento
  const goToEvent = useCallback(
  (ev: EventRuntime) => {
    router.push(`/barbershop/${ev.id}`); // 👈 bate com app/barbershop/[id].tsx
    setIsDialogOpen(false);
  },
  [router]
);

  // agenda notificação local
  const scheduleNotificationForEvent = useCallback(async (ev: EventRuntime) => {
    const now = new Date();
    if (ev.startDate <= now) {
      Alert.alert(
        "Não foi possível",
        "Esse evento já começou ou já passou."
      );
      return;
    }

    try {
      const start = ev.startDate;
      const triggerDate = new Date(start.getTime() - 15 * 60 * 1000); // 15 min antes

      await Notifications.scheduleNotificationAsync({
        content: {
          title: ev.name,
          body: `O evento começa às ${format(start, "HH:mm")}`,
          sound: true,
        },
        // 👇 Date é aceito pela lib; cast pra driblar o bug de tipo
        trigger: triggerDate as unknown as Notifications.NotificationTriggerInput,
      });

      Alert.alert(
        "Lembrete criado",
        "Você será lembrado 15 minutos antes do evento."
      );
    } catch (err) {
      console.error("Erro ao agendar notificação", err);
      Alert.alert(
        "Erro",
        "Não foi possível criar o lembrete. Verifique as permissões de notificação."
      );
    }
  }, []);

  /* ---------- render ---------- */
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          hitSlop={8}
        >
          <Feather name="chevron-left" size={20} color="#f97316" />
        </Pressable>

        <View style={styles.monthLabel}>
          <Feather name="calendar" size={16} color="#f97316" />
          <Text style={styles.monthText}>
            {format(currentMonth, "MMMM yyyy", { locale })}
          </Text>
          <Feather name="sun" size={16} color="#f97316" />
        </View>

        <Pressable
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          hitSlop={8}
        >
          <Feather name="chevron-right" size={20} color="#f97316" />
        </Pressable>
      </View>

      {/* Dias da semana */}
      <View style={styles.weekdays}>
        {weekdays.map((d, i) => (
          <Text key={i} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {/* Grade de dias */}
      <View style={styles.grid}>
        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator size="small" color="#f97316" />
            <Text style={{ marginTop: 8, color: "#64748b" }}>
              {t("cal_loading")}
            </Text>
          </View>
        ) : (
          days.map((day, index) => {
            const inMonth = !!day && isSameMonth(day, currentMonth);
            const isTodayValid =
              !!day && isToday(day) && isSameMonth(day, currentMonth);

            const dots =
              day && eventsByDay.size > 0
                ? (eventsByDay.get(toYMD(day)) || [])
                    .slice(0, 3)
                    .map((ev) => {
                      const st = statusOf(nowMs, ev);
                      return DOT_COLORS[st];
                    })
                : [];

            return (
              <DayCell
                key={index}
                day={day}
                inMonth={!!inMonth}
                isTodayValid={!!isTodayValid}
                dots={dots}
                onPress={handleDayPress}
              />
            );
          })
        )}
      </View>

      {/* Legenda */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <Dot color={DOT_COLORS.finished} />
          <Text style={styles.legendText}>{t("cal_finished")}</Text>
        </View>
        <View style={styles.legendItem}>
          <Dot color={DOT_COLORS.scheduled} />
          <Text style={styles.legendText}>{t("cal_scheduled")}</Text>
        </View>
        <View style={styles.legendItem}>
          <Dot color={DOT_COLORS.ongoing} />
          <Text style={styles.legendText}>{t("cal_ongoing")}</Text>
        </View>
      </View>

      {/* Modal de eventos do dia */}
      <Modal
        visible={isDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDialogOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {(t("cal_events_on") || "Eventos em {date}").replace(
                "{date}",
                selectedDay ? format(selectedDay, "dd/MM/yyyy") : ""
              )}
            </Text>

            <FlatList
              data={selectedEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const st = statusOf(nowMs, item);
                const color = DOT_COLORS[st];
                return (
                  <View style={styles.eventItem}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: color, marginRight: 8 },
                      ]}
                    />
                    <View style={{ flexShrink: 1, flex: 1 }}>
                      {/* clique na linha → abre detalhes */}
                      <Pressable onPress={() => goToEvent(item)}>
                        <Text style={styles.eventName}>{item.name}</Text>
                        <Text style={styles.eventDetails}>
                          📍 {item.address}
                        </Text>
                        <Text style={styles.eventDetails}>
                          ⏰ {t("cal_start")}:{" "}
                          {format(item.startDate, "dd/MM/yyyy HH:mm")} —{" "}
                          {t("cal_end")}:{" "}
                          {format(item.endDate, "dd/MM/yyyy HH:mm")}
                        </Text>
                      </Pressable>

                      {/* botão de lembrete */}
                      <Pressable
                        style={styles.reminderButton}
                        onPress={() => scheduleNotificationForEvent(item)}
                      >
                        <Feather
                          name="bell"
                          size={14}
                          color="#f97316"
                          style={{ marginRight: 4 }}
                        />
                        <Text style={styles.reminderText}>Lembrar</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
              getItemLayout={(_, index) => ({
                length: 70,
                offset: 70 * index,
                index,
              })}
              initialNumToRender={8}
              windowSize={8}
              maxToRenderPerBatch={8}
              removeClippedSubviews
            />

            <Pressable
              onPress={() => setIsDialogOpen(false)}
              style={{ paddingTop: 8 }}
            >
              <Text style={styles.closeButton}>{t("header_back")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- styles ---------- */
const CELL = 40;
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
  },
  monthText: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginHorizontal: 8,
    color: "#0F172A",
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
    color: "#64748B",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  day: {
    width: CELL,
    height: CELL,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  today: {
    borderColor: "#f97316",
    borderWidth: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  eventDots: {
    flexDirection: "row",
    marginTop: 2,
  },
  dotWrap: {},
  dotWrapSpacing: { marginLeft: 2 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#475569",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#00000099",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    width: "92%",
    maxHeight: "80%",
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#0F172A",
  },
  eventItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  eventName: {
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 2,
  },
  eventDetails: {
    fontSize: 12,
    color: "#475569",
  },
  reminderButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#f97316",
  },
  reminderText: {
    fontSize: 12,
    color: "#f97316",
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 6,
    textAlign: "center",
    fontWeight: "600",
    color: "#f97316",
  },
});
