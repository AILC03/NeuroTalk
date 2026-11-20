import { useEffect, useRef, useState, type ComponentRef } from "react";
import { AppState, BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ArrowLeft, Check, LockKeyhole, Pause, SendHorizontal } from "../../components/icons";
import { randomUUID } from "expo-crypto";
import { api, ApiError } from "../../lib/api";
import { difficultyLabel, messageLength } from "../../lib/format";
import { useRemote } from "../../hooks/useRemote";
import { Badge, Button, Loading, Notice, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";
import { uncertainSends } from "../../lib/pending";

export function ChatScreen({ id, onLeave, onResult }: { id: string; onLeave: () => void; onResult: () => void }) {
  const remote = useRemote(async () => {
    let practice = await api.practice(id);
    if (practice.latestReply && ["PENDING", "PROCESSING"].includes(practice.latestReply.status)) {
      await api.reply(id, practice.latestReply.id);
      practice = await api.practice(id);
    }
    return { practice, messages: await api.messages(id) };
  }, [id]);
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(() => uncertainSends.get(id) ?? null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const status = remote.data?.practice.status;
  const pending = remote.data?.practice.latestReply && ["PENDING", "PROCESSING"].includes(remote.data.practice.latestReply.status);
  const latest = useRef(remote.data?.practice); latest.current = remote.data?.practice;

  useEffect(() => {
    if (uncertain && remote.data?.messages.some((message) => message.clientMessageId === uncertain.clientMessageId)) {
      uncertainSends.delete(id); setUncertain(null); setText("");
    }
  }, [remote.data?.messages, uncertain, id]);
  useEffect(() => {
    if (busy || !(status === "ACTIVE" || status === "CLOSING" || pending)) return;
    const timer = setInterval(() => { void remote.reload(); }, 4000);
    return () => clearInterval(timer);
  }, [status, pending, busy, remote.reload]);

  async function action(task: () => Promise<unknown>) {
    setBusy(true); setError("");
    try { await task(); await remote.reload(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo completar la operación."); await remote.reload(); }
    finally { setBusy(false); }
  }
  async function leave() {
    if (busy) return;
    setBusy(true); setError("");
    try { if (latest.current?.status === "ACTIVE") await api.pause(id, "LEFT_CHAT"); onLeave(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo pausar la práctica."); setBusy(false); }
  }
  const leaveRef = useRef(leave); leaveRef.current = leave;
  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => { void leaveRef.current(); return true; });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    const pause = () => { if (latest.current?.status === "ACTIVE") void api.pause(id, "LEFT_CHAT").then(() => remote.reload()).catch(() => {}); };
    const subscription = AppState.addEventListener("change", (state) => { if (state !== "active") pause(); else void remote.reload(); });
    const visibility = () => { if (document.visibilityState === "hidden") pause(); else void remote.reload(); };
    if (Platform.OS === "web" && typeof document !== "undefined") document.addEventListener("visibilitychange", visibility);
    return () => { subscription.remove(); if (Platform.OS === "web" && typeof document !== "undefined") document.removeEventListener("visibilitychange", visibility); };
  }, [id, remote.reload]);

  async function send() {
    if (busy || (!uncertain && (!text.trim() || messageLength(text) > 2000))) return;
    const attempt = uncertain ?? uncertainSends.get(id) ?? { clientMessageId: randomUUID(), content: text.trim() };
    uncertainSends.set(id, attempt);
    setBusy(true); setError("");
    try {
      await api.sendMessage(id, attempt); uncertainSends.delete(id); setUncertain(null); setText("");
      await remote.reload();
    } catch (failure) {
      const ambiguous = failure instanceof ApiError && (failure.status === 0 || failure.status >= 500);
      if (ambiguous) setUncertain(attempt); else { uncertainSends.delete(id); setUncertain(null); }
      setError(failure instanceof Error ? failure.message : "No se pudo enviar el mensaje.");
      await remote.reload();
    } finally { setBusy(false); }
  }

  if (!remote.data) return <View style={[ui.page, { justifyContent: "center" }]}>{remote.error ? <><Notice error>{remote.error}</Notice><Button title="Reintentar carga" onPress={() => void remote.reload()} /><Button title="Volver al inicio" secondary onPress={onLeave} /></> : <Loading label="Preparando tu conversación…" />}</View>;
  const { practice, messages } = remote.data;
  const completed = practice.status === "COMPLETED";
  const paused = practice.status === "PAUSED";
  return <KeyboardAvoidingView style={{ flex: 1, width: "100%", maxWidth: 820, alignSelf: "center" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <View style={{ borderBottomWidth: 1, borderColor: colors.border, padding: 20, gap: 14 }}>
      <View style={ui.row}><Pressable accessibilityRole="button" accessibilityLabel="Pausar y volver al inicio" onPress={() => void leave()} disabled={busy} style={{ padding: 9, backgroundColor: "white", borderRadius: 50 }}><ArrowLeft size={23} color={colors.ink} /></Pressable>
        <View style={{ backgroundColor: colors.mint, height: 42, width: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" }}><Text style={{ color: colors.green, fontWeight: "700" }}>NT</Text></View>
        <View style={ui.flex}><Text style={ui.heading}>{practice.aiRole}</Text><Text style={[ui.muted, { fontSize: 12 }]}>{practice.scenarioTitle} · {difficultyLabel[practice.difficulty]}</Text></View>
      </View><View style={ui.between}><View style={ui.row}><LockKeyhole size={14} color={colors.muted} /><Text style={[ui.muted, { fontSize: 12 }]}>Simulación de práctica, a tu ritmo.</Text></View><Badge>Simulada</Badge></View>
    </View>
    <ScrollView testID="chat-messages" ref={scroll} contentContainerStyle={{ padding: 22, gap: 20 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
      {messages.length === 0 ? <Notice>Tu interlocutor te escucha. Puedes escribir el primer mensaje para comenzar.</Notice> : null}
      {messages.map((message) => <View key={message.id} style={{ alignSelf: message.role === "USER" ? "flex-end" : "flex-start", maxWidth: "88%", gap: 7 }}>
        <Text style={[ui.label, { textAlign: message.role === "USER" ? "right" : "left", fontSize: 12 }]}>{message.role === "USER" ? "Tú" : practice.aiRole}</Text>
        <View style={{ backgroundColor: message.role === "USER" ? colors.mint : "white", borderColor: colors.border, borderWidth: message.role === "USER" ? 0 : 1, borderRadius: 22, padding: 18, gap: 10 }}>
          <Text selectable style={[ui.body, { lineHeight: 25 }]}>{message.content}</Text><View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 4 }}><Text style={[ui.muted, { fontSize: 11 }]}>{new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}</Text>{message.role === "USER" ? <Check size={12} color={colors.muted} /> : null}</View>
        </View>
      </View>)}
      {pending ? <Notice>Tu interlocutor está preparando una respuesta…</Notice> : null}
    </ScrollView>
    <View style={{ padding: 18, gap: 12, borderTopWidth: 1, borderColor: colors.border, backgroundColor: "white" }}>
      {error || remote.error ? <Notice error>{error || remote.error}</Notice> : null}
      {uncertain ? <><Notice>No pudimos confirmar el envío. Se conservará su identificador para reintentar sin duplicarlo.</Notice><Button title="Reintentar envío" loading={busy} onPress={() => void send()} /></> : null}
      {practice.limitWarning && !completed ? <Notice>Has enviado {practice.userMessageCount} de 30 mensajes. La práctica se cerrará al llegar a 30.</Notice> : null}
      {paused ? <><Notice>{practice.pauseReason === "INACTIVITY" ? "La práctica se pausó después de 15 minutos sin actividad." : "Tu práctica está pausada. Puedes continuar cuando lo necesites."}</Notice><Button title="Reanudar práctica" loading={busy} onPress={() => void action(() => api.resume(id))} /></> : null}
      {practice.latestReply?.status === "FAILED" && !completed && practice.status !== "CLOSING" ? <><Notice error>No se pudo completar la respuesta del personaje.</Notice><Button title="Reintentar respuesta" loading={busy} secondary onPress={() => void action(() => api.retryReply(id, practice.latestReply!.id))} /></> : null}
      {completed ? <><Notice>Terminaste esta práctica. Tus mensajes ya están guardados.</Notice><Button title="Ver resultado de la práctica" arrow onPress={onResult} /></> : practice.status === "CLOSING" ? <Notice>Finalizando práctica. No se aceptarán más mensajes.</Notice> : <>
        {!paused ? <View style={[ui.row, { alignItems: "flex-end" }]}><TextInput accessibilityLabel="Escribe tu respuesta" placeholder="Escribe tu respuesta…" placeholderTextColor={colors.muted} multiline value={text} onChangeText={(value) => setText(Array.from(value).slice(0, 2000).join(""))} editable={!busy && !pending && !uncertain} maxLength={4000} style={[ui.input, ui.flex, { minHeight: 52, maxHeight: 130, paddingTop: 15 }]} />
          <Pressable accessibilityRole="button" accessibilityLabel="Enviar mensaje" accessibilityState={{ disabled: busy || Boolean(pending) || Boolean(uncertain) || !text.trim() }} disabled={busy || Boolean(pending) || Boolean(uncertain) || !text.trim()} onPress={() => void send()} style={{ padding: 15, borderRadius: 18, backgroundColor: colors.green, opacity: busy || pending || uncertain || !text.trim() ? 0.5 : 1 }}><SendHorizontal size={23} color="white" /></Pressable></View> : null}
        {!paused ? <View style={ui.between}><Text style={[ui.muted, { fontSize: 11 }]}>{messageLength(text)} / 2,000 caracteres</Text><Pressable accessibilityRole="button" accessibilityLabel="Pausar práctica" disabled={busy} onPress={() => void action(() => api.pause(id))} style={ui.row}><Pause size={14} color={colors.green} /><Text style={{ color: colors.green, fontSize: 13, fontWeight: "600" }}>Pausar</Text></Pressable></View> : null}
        <Button title="Finalizar práctica" danger loading={busy} onPress={() => void action(() => api.finish(id))} />
      </>}
    </View>
  </KeyboardAvoidingView>;
}
