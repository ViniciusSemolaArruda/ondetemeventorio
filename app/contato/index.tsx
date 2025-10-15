import Footer from "@/components/footer";
import Header2 from "@/components/Header2";
import { useAuth } from "@/context/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleLogin";
import {
    apiHelpers,
    type ChatMeResponse,
    type ChatMessage,
    setAuthToken,
} from "@/lib/api";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

/* ===========================
   Constantes / utils
=========================== */
const BRAND_ORANGE = "#FF7701";

type FaqItem = { q: string; a: React.ReactNode };

const BUSINESS_START_MIN = 7 * 60 + 30; // 07:30
const BUSINESS_END_MIN = 18 * 60; // 18:00

function minutesNowLocalTZ(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function isWithinBusinessHoursNow(): boolean {
  const m = minutesNowLocalTZ();
  return m >= BUSINESS_START_MIN && m <= BUSINESS_END_MIN;
}
function formatTimeBR(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Evita flicker: só troca mensagens se realmente mudarem */
function areMessagesEqual(a: ChatMessage[], b: ChatMessage[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].text !== b[i].text) return false;
  }
  return true;
}

/* ===========================
   FAQ
=========================== */
const FAQ: FaqItem[] = [
  {
    q: "Como publicar meu evento no Onde Tem Evento Rio?",
    a: (
      <Text>
        No app, vá em <Text style={{ fontWeight: "700" }}>“Publicar evento”</Text>, preencha
        título, descrição, data/horário e local. Envie as imagens e confirme. O
        evento passa por uma checagem rápida antes de ir ao ar.
      </Text>
    ),
  },
  {
    q: "Quais regras de imagem e tamanho para o banner do evento?",
    a: (
      <Text>
        Use proporção horizontal (ex.: 1280×720) e boa nitidez. Evite muito texto no
        banner. Formatos aceitos: <Text style={{ fontStyle: "italic" }}>JPG/PNG</Text> até 2 MB.
      </Text>
    ),
  },
  {
    q: "Meu evento não aparece na busca/mapa. O que fazer?",
    a: (
      <Text>
        Verifique se o evento está <Text style={{ fontWeight: "700" }}>aprovado</Text> e com
        <Text style={{ fontWeight: "700" }}> data futura</Text>. Revise o endereço (bairro/cidade)
        e palavras-chave na descrição. Persistindo, fale com a gente pelo chat.
      </Text>
    ),
  },
  {
    q: "Como editar data, horário, local ou descrição do evento?",
    a: (
      <Text>
        Abra o evento em <Text style={{ fontWeight: "700" }}>“Meus eventos”</Text> e toque em{" "}
        <Text style={{ fontWeight: "700" }}>Editar</Text>. Alterações podem passar por nova revisão.
      </Text>
    ),
  },
  {
    q: "Consigo pausar ou remover um evento publicado?",
    a: (
      <Text>
        Sim. Em <Text style={{ fontWeight: "700" }}>“Meus eventos”</Text>, escolha o evento e toque
        em <Text style={{ fontWeight: "700" }}>Pausar</Text> ou{" "}
        <Text style={{ fontWeight: "700" }}>Remover</Text>.
      </Text>
    ),
  },
  {
    q: "Qual o prazo de análise para eventos enviados?",
    a: (
      <Text>
        Em geral, <Text style={{ fontWeight: "700" }}>até algumas horas</Text> no horário comercial
        (07:30–18:00).
      </Text>
    ),
  },
  {
    q: "Como denunciar um evento com informação incorreta?",
    a: (
      <Text>
        Abra o evento e toque em <Text style={{ fontWeight: "700" }}>“Reportar/Denunciar”</Text>.
        Descreva o problema.
      </Text>
    ),
  },
  {
    q: "Não recebi e-mail de confirmação. Como resolver?",
    a: (
      <Text>
        Verifique o <Text style={{ fontStyle: "italic" }}>spam</Text>/lixo. Confirme se o e-mail da
        conta está correto. Se não chegar, fale no chat.
      </Text>
    ),
  },
  {
    q: "O app usa minha localização? Como ativar/desativar?",
    a: (
      <Text>
        Sim, para melhorar achados no mapa. Você pode permitir ou negar nas configurações do celular.
      </Text>
    ),
  },
  {
    q: "Como funcionam as notificações push?",
    a: (
      <Text>
        Enviamos alertas de <Text style={{ fontWeight: "700" }}>novos eventos</Text>, alterações e
        recomendações. Gerencie em{" "}
        <Text style={{ fontWeight: "700" }}>Configurações &gt; Notificações</Text>.
      </Text>
    ),
  },
  {
    q: "Como falar sobre parcerias/divulgação?",
    a: (
      <Text>
        Chame a gente no chat e selecione{" "}
        <Text style={{ fontWeight: "700" }}>“Parcerias/Divulgação”</Text>.
      </Text>
    ),
  },
  {
    q: "Como excluir meus dados (LGPD) ou encerrar minha conta?",
    a: (
      <Text>
        Solicite pelo chat com o assunto{" "}
        <Text style={{ fontWeight: "700" }}>“Privacidade/LGPD”</Text>. A equipe confirmará por
        e-mail.
      </Text>
    ),
  },
];

/* ===========================
   AccordionRow
=========================== */
function AccordionRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View
      style={{
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e5e5",
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => ({
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: pressed ? "#fafafa" : "#fff",
        })}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text
          style={{
            flex: 1,
            paddingRight: 12,
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {title}
        </Text>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: BRAND_ORANGE,
            transform: [{ rotate: open ? "180deg" : "0deg" }],
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>⌄</Text>
        </View>
      </Pressable>

      {open ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          {typeof children === "string" ? (
            <Text style={{ color: "#374151", lineHeight: 20 }}>{children}</Text>
          ) : (
            children
          )}
        </View>
      ) : null}
    </View>
  );
}

/* ===========================
   MessageBubble (memo)
=========================== */
const MessageBubble = React.memo(function MessageBubble({
  item,
}: {
  item: ChatMessage;
}) {
  const isUser = item.senderRole === "user";
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      <View
        style={{
          maxWidth: "85%",
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: isUser ? "#fff" : "#f3f4f6",
          borderWidth: isUser ? 1 : 0,
          borderColor: isUser ? BRAND_ORANGE : "transparent",
        }}
      >
        <Text
          style={{
            color: isUser ? BRAND_ORANGE : "#111827",
            lineHeight: 20,
          }}
        >
          {item.text}
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 10,
            textAlign: "right",
            color: isUser ? "#00000099" : "#6b7280",
          }}
        >
          {formatTimeBR(item.createdAt)}
        </Text>
      </View>
    </View>
  );
});

/* ===========================
   ChatPanel (Tela cheia)
=========================== */
function ChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth() as any;
  const { signInWithGoogle } = useGoogleAuth();

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [convStatus, setConvStatus] = useState<
    "open" | "closed" | "none" | string | undefined
  >("open");
  const [convId, setConvId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [stick, setStick] = useState(true);
  const justSentRef = useRef(false);
  const [tempNotice, setTempNotice] = useState<ChatMessage | null>(null);
  const tempNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Token -> Axios
  const ensureAuth = useCallback(async (): Promise<boolean> => {
    const tokenFromCtx =
      accessToken ?? (user && (user.accessToken || user.token || user.idToken));
    if (tokenFromCtx) {
      setAuthToken(tokenFromCtx);
      return true;
    }
    return false;
  }, [accessToken, user]);

  // Aviso fora de horário (sem hook dentro de JSX)
  const outOfHoursFooter = tempNotice ? (
    <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
      <View
        style={{
          backgroundColor: "#fff7ed",
          borderColor: "#fed7aa",
          borderWidth: 1,
          padding: 10,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#9a3412", fontSize: 12 }}>{tempNotice.text}</Text>
      </View>
    </View>
  ) : null;

  const showOutOfHoursNotice = useCallback(() => {
    const notice: ChatMessage = {
      id: `local-out-of-hours-${Date.now()}`,
      senderRole: "support",
      createdAt: new Date().toISOString(),
      text:
        "Nosso horário de atendimento é de 07:30 às 18:00 (horário de Brasília). " +
        "Recebemos sua mensagem e vamos responder nesse período. Obrigado pela compreensão! 🙂",
    };
    setTempNotice(notice);
    if (tempNoticeTimer.current) clearTimeout(tempNoticeTimer.current);
    tempNoticeTimer.current = setTimeout(() => setTempNotice(null), 15000);
  }, []);

  useEffect(() => {
    return () => {
      if (tempNoticeTimer.current) clearTimeout(tempNoticeTimer.current);
    };
  }, []);

  const loadMyChat = useCallback(async () => {
    if (!user) return;
    const ok = await ensureAuth();
    if (!ok) return;

    try {
      const data = (await apiHelpers.chat.getMyChat()) as ChatMeResponse;

      setConvId((prev) =>
        prev !== (data.conversationId ?? null) ? data.conversationId ?? null : prev
      );
      setConvStatus((prev) =>
        prev !== (data.status ?? "open") ? data.status ?? "open" : prev
      );
      setChat((prev) =>
        areMessagesEqual(prev, data.messages ?? []) ? prev : data.messages ?? []
      );

      if (listRef.current && (justSentRef.current || stick)) {
        requestAnimationFrame(() =>
          listRef.current?.scrollToEnd({ animated: true })
        );
        justSentRef.current = false;
      }
    } finally {
      // sem loading no polling
    }
  }, [stick, user, ensureAuth]);

  // 1º load com loading; polling sem loading
  useEffect(() => {
    if (!open || !user) return;

    let mounted = true;
    let first = true;

    const firstLoad = async () => {
      if (first) setLoading(true);
      await loadMyChat();
      if (mounted) setLoading(false);
      first = false;
    };

    void firstLoad();
    const id = setInterval(loadMyChat, 6000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [user, open, loadMyChat]);

 const handleSend = useCallback(async () => {
  const payload = message.trim();
  if (!payload) return;

  // limpa o input imediatamente
  setMessage("");

  if (!user) {
    await signInWithGoogle?.();
    return;
  }

  const ok = await ensureAuth();
  if (!ok) {
    await signInWithGoogle?.();
    return;
  }

  try {
    setSending(true);

    if (convStatus === "closed" && convId) {
      const reopen = await apiHelpers.chat.reopenConversation(convId);
      if (reopen?.ok) setConvStatus("open");
    }

    if (!isWithinBusinessHoursNow()) showOutOfHoursNotice();

    justSentRef.current = true;

    // usa 'payload' (a cópia) pra enviar
    const resp = await apiHelpers.chat.sendChatMessage(payload);
    if (!resp?.ok) throw new Error("Falha ao enviar a mensagem.");

    await loadMyChat();
  } finally {
    setSending(false);
  }
}, [
  message,
  user,
  convStatus,
  convId,
  loadMyChat,
  showOutOfHoursNotice,
  signInWithGoogle,
  ensureAuth,
]);


  // ✅ Hooks no topo: renderItem e keyExtractor memorizados
  const renderItem = useCallback(({ item }: { item: ChatMessage }) => {
    return <MessageBubble item={item} />;
  }, []);
  const keyExtractor = useCallback((m: ChatMessage) => m.id, []);

  const placeholder = isWithinBusinessHoursNow()
    ? "Digite uma mensagem"
    : "Fora do horário (07:30–18:00). Envie sua mensagem e responderemos no próximo período.";

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      {/* Tela cheia com SafeArea */}
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#00000055",
        }}
        edges={["top", "bottom"]}
      >
        {/* backdrop para fechar */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* Conteúdo em tela cheia */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "#fff",
          }}
        >
          {/* Cabeçalho */}
          <View
            style={{
              paddingTop: insets.top,
              backgroundColor: BRAND_ORANGE,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Central de Ajuda • Onde Tem Evento Rio
            </Text>
            <Pressable onPress={onClose} accessibilityLabel="Fechar chat">
              <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>

          {/* Sem login */}
          {!user ? (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                Acesse sua conta
              </Text>
              <Text
                style={{ textAlign: "center", color: "#6b7280", marginBottom: 16 }}
              >
                Entre com sua conta Google para continuar
              </Text>
              <TouchableOpacity
                onPress={() => signInWithGoogle?.()}
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  backgroundColor: "#fff",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  width: "90%",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600" }}>Entrar com Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  marginTop: 8,
                  backgroundColor: "#f3f4f6",
                  paddingVertical: 12,
                  borderRadius: 12,
                  width: "90%",
                  alignItems: "center",
                }}
              >
                <Text>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {/* Aviso segurança */}
              <View
                style={{
                  backgroundColor: "#fef2f2",
                  borderBottomWidth: 1,
                  borderBottomColor: "#fee2e2",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#991b1b" }}>
                  <Text style={{ fontWeight: "700" }}>Atenção:</Text> não vendemos ingressos e
                  não pedimos seus dados pessoais.
                </Text>
              </View>

              {/* Banner de encerrado pelo admin (por inatividade) */}
              {convStatus === "closed" ? (
                <View
                  style={{
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: "#fff8f8",
                    borderBottomWidth: 1,
                    borderBottomColor: "#f3dada",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#b45309",
                    }}
                  >
                    Atendimento encerrado por inatividade. Envie uma nova mensagem para retomar.
                  </Text>
                </View>
              ) : null}

              {/* Lista */}
              <View style={{ flex: 1 }}>
                {loading ? (
                  <View
                    style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                  >
                    <ActivityIndicator />
                  </View>
                ) : (
                  <FlatList
                    ref={listRef}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                    data={chat}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    onContentSizeChange={() =>
                      stick && listRef.current?.scrollToEnd({ animated: true })
                    }
                    onScroll={(e) => {
                      const {
                        layoutMeasurement,
                        contentOffset,
                        contentSize,
                      } = e.nativeEvent;
                      const distanceFromBottom =
                        contentSize.height -
                        (layoutMeasurement.height + contentOffset.y);
                      setStick(distanceFromBottom < 120);
                    }}
                    ListFooterComponent={outOfHoursFooter}
                    maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                    windowSize={7}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                  />
                )}
              </View>

              {/* Input */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: "#e5e7eb",
                  padding: 8,
                  paddingBottom: 8 + insets.bottom,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  {convStatus === "closed"
                    ? "Envie uma nova mensagem para retomar o atendimento."
                    : isWithinBusinessHoursNow()
                    ? "Estamos online de 07:30 às 18:00."
                    : "Fora do horário — responderemos no próximo período."}
                </Text>

                <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    editable={!sending}
                    style={{
                      flex: 1,
                      minHeight: 44,
                      borderWidth: 1,
                      borderColor: "#d1d5db",
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      fontSize: 14,
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={sending || !message.trim()}
                    style={{
                      height: 44,
                      paddingHorizontal: 18,
                      borderRadius: 999,
                      backgroundColor: BRAND_ORANGE,
                      opacity: sending || !message.trim() ? 0.6 : 1,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      {sending ? "Enviando..." : "Enviar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/* ===========================
   Tela /contato
=========================== */
export default function ContatoScreen() {
  const insets = useSafeAreaInsets();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={[]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_ORANGE} />

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
      >
        <Header2 />

        {/* HERO */}
        <View style={{ width: "100%", backgroundColor: BRAND_ORANGE }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
            <Text
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: 28,
                textAlign: "center",
              }}
            >
              Central de Ajuda
            </Text>
            <Text
              style={{
                color: "#fff",
                opacity: 0.95,
                textAlign: "center",
                marginTop: 8,
                fontSize: 16,
              }}
            >
              Atendimento pelo chat, rápido e humano. Tire dúvidas sobre o app e a
              publicação/edição de eventos.
            </Text>
          </View>
        </View>

        {/* Separador + chamada */}
        <View
          style={{
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: 20,
          }}
        >
          <View style={{ height: 1, backgroundColor: "#e5e7eb", marginTop: 16 }} />
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                marginTop: -30,
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            >
              <Text style={{ color: BRAND_ORANGE, fontSize: 24 }}>💬</Text>
            </View>
          </View>

          <View style={{ paddingTop: 24, paddingBottom: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
              Envie uma mensagem
            </Text>
            <Text style={{ marginTop: 8, textAlign: "center", color: "#4b5563" }}>
              Não encontrou o que precisava? Nossa equipe responde rápido pelo chat.{" "}
              <Text
                onPress={() => setChatOpen(true)}
                style={{
                  color: BRAND_ORANGE,
                  fontWeight: "600",
                  textDecorationLine: "underline",
                }}
              >
                Fale com a gente
              </Text>
              .
            </Text>
          </View>
        </View>

        {/* Cards */}
        <View
          style={{
            maxWidth: 1200,
            alignSelf: "center",
            width: "100%",
            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <View style={{ gap: 12 }}>
            <InfoCard title="Horário">
              <Text style={{ color: "#374151", lineHeight: 20 }}>
                <Text style={{ fontWeight: "700" }}>07:30 às 18:00</Text> (horário de Brasília).
                Mensagens fora do horário entram na fila e são respondidas no próximo expediente.
              </Text>
            </InfoCard>

            <InfoCard title="Como falar">
              <Text style={{ color: "#374151", lineHeight: 20 }}>
                • Clique no balão no canto inferior direito.
              </Text>
              <Text style={{ color: "#374151", lineHeight: 20 }}>
                • Se a conversa tiver sido encerrada, reabrimos automaticamente.
              </Text>
              <Text style={{ color: "#374151", lineHeight: 20 }}>
                • Você acompanha tudo por aqui mesmo.
              </Text>
            </InfoCard>

            <InfoCard title="Importante">
              <Text style={{ color: "#374151", lineHeight: 20 }}>
                • <Text style={{ fontWeight: "700" }}>Não vendemos ingressos</Text> pelo chat.
              </Text>
              <Text style={{ color: "#374151", lineHeight: 20 }}>
                • <Text style={{ fontWeight: "700" }}>Não pedimos dados sensíveis</Text> (senha, cartão etc.).
              </Text>
              <Text style={{ color: "#374151", lineHeight: 20 }}>
                • Suspeitou de algo? Fale conosco no chat.
              </Text>
            </InfoCard>
          </View>
        </View>

        {/* FAQ */}
        <View style={{ maxWidth: 1200, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingBottom: 24 }}>
          <Text style={{ textAlign: "center", fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 16 }}>
            Dúvidas frequentes
          </Text>

          <View style={{ gap: 12 }}>
            {FAQ.map((item, idx) => (
              <AccordionRow key={idx} title={item.q}>
                {item.a}
              </AccordionRow>
            ))}
          </View>
        </View>

        <Footer />
      </ScrollView>

      {/* FAB do chat */}
      <TouchableOpacity
        onPress={() => setChatOpen(true)}
        activeOpacity={0.9}
        accessibilityLabel="Abrir chat de suporte"
        style={{
          position: "absolute",
          right: 16,
          bottom: 16 + insets.bottom,
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: BRAND_ORANGE,
          borderWidth: 2,
          borderColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 26 }}>💬</Text>
      </TouchableOpacity>

      {/* Chat em tela cheia */}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
    </SafeAreaView>
  );
}

/* ===========================
   InfoCard
=========================== */
function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 12,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "700", color: "#111827" }}>
        {title}
      </Text>
      <View style={{ marginTop: 8, gap: 6 }}>{children}</View>
    </View>
  );
}
