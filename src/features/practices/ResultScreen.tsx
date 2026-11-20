import { Text, View } from "react-native";
import { Check } from "../../components/icons";
import { api } from "../../lib/api";
import { difficultyLabel, duration } from "../../lib/format";
import { useRemote } from "../../hooks/useRemote";
import { BackHeader, Badge, Button, Card, Loading, Notice, Page, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";

export function ResultScreen({ id, onHome, onRepeat, onConversation }: { id: string; onHome: () => void; onRepeat: (scenarioId: string) => void; onConversation: () => void }) {
  const remote = useRemote(() => api.result(id), [id]);
  return <Page><BackHeader title="Resultado de la práctica" onBack={onHome} />
    {remote.loading && !remote.data ? <Loading /> : null}
    {remote.error ? <><Notice error>{remote.error}</Notice><Button title="Volver a cargar" secondary onPress={() => void remote.reload()} /></> : null}
    {remote.data ? <>
      <View style={{ alignItems: "center", gap: 18, paddingVertical: 8 }}><View style={{ width: 88, height: 88, backgroundColor: colors.mint, borderRadius: 44, alignItems: "center", justifyContent: "center" }}><Check color={colors.green} size={46} strokeWidth={1.7} /></View><Text accessibilityRole="header" style={[ui.title, { textAlign: "center", fontSize: 28 }]}>{remote.data.practice.status === "COMPLETED" ? "¡Terminaste tu práctica!" : "Tu práctica está guardada"}</Text></View>
      <View style={{ gap: 8 }}><Text style={ui.heading}>{remote.data.practice.scenarioTitle}</Text><Text style={ui.muted}>{difficultyLabel[remote.data.practice.difficulty]} · {duration(remote.data.practice.practiceDurationSeconds)} · {remote.data.practice.messageCount} mensajes</Text><Badge>Práctica simulada</Badge></View>
      <Card><Text style={ui.heading}>Tu sesión, en un vistazo</Text><Text style={ui.body}>Participaste con {remote.data.practice.userMessageCount} {remote.data.practice.userMessageCount === 1 ? "mensaje" : "mensajes"} en este escenario.</Text><Text style={ui.muted}>El tiempo corresponde a intervalos de práctica y excluye las pausas registradas.</Text></Card>
      <Notice>{remote.data.notice}</Notice>
      <Card><Text style={[ui.heading, { color: colors.green }]}>Para tu próxima práctica</Text><Text style={ui.body}>Puedes repetir este escenario o explorar otra situación a tu ritmo.</Text><Text style={ui.muted}>Este es un recordatorio general, no una evaluación de tu conversación.</Text></Card>
      <Button title="Volver a practicar" arrow onPress={() => onRepeat(remote.data!.practice.scenarioId)} />
      <Button title="Ver conversación guardada" secondary onPress={onConversation} /><Button title="Ir al inicio" secondary onPress={onHome} />
    </> : null}
  </Page>;
}
