import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ArrowRight, MessageSquareText } from "../../components/icons";
import { api } from "../../lib/api";
import type { Practice, Scenario } from "../../lib/types";
import { initials } from "../../lib/format";
import { useRemote } from "../../hooks/useRemote";
import { Badge, Button, Card, CategoryTag, ConfirmDialog, Empty, Loading, Notice, Page, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";
import { useAuth } from "../auth/AuthProvider";
import { PracticeCard } from "../practices/PracticeCard";

export function HomeScreen({ onLibrary, onScenario, onPractice, onProfile }: { onLibrary: () => void; onScenario: (scenario: Scenario) => void; onPractice: (id: string) => void; onProfile: () => void }) {
  const { user } = useAuth();
  const remote = useRemote(async () => {
    const [scenarios, pending, recent] = await Promise.all([api.scenarios(), api.practices({ scope: "unfinished" }), api.practices({ status: "COMPLETED" })]);
    return { scenarios: scenarios.items, pending: pending.items, recent: recent.items.slice(0, 3) };
  }, []);
  const [opening, setOpening] = useState(false); const [error, setError] = useState("");
  const [selected, setSelected] = useState<Practice | null>(null);
  async function remove() {
    if (!selected) return;
    setOpening(true); setError("");
    try { await api.deletePractice(selected.id); setSelected(null); await remote.reload(); }
    catch (failure) { setSelected(null); setError(failure instanceof Error ? failure.message : "No se pudo eliminar la práctica."); }
    finally { setOpening(false); }
  }
  async function open(practice: Practice) {
    setOpening(true); setError("");
    try { if (practice.status === "PAUSED") await api.resume(practice.id); onPractice(practice.id); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo retomar la práctica."); }
    finally { setOpening(false); }
  }
  const today = new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  return <Page>
    <View style={ui.between}><View style={{ gap: 7, flex: 1 }}><Text style={ui.eyebrow}>{today}</Text><Text accessibilityRole="header" style={ui.title}>Hola, {user?.displayName.split(" ")[0]}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Abrir mi perfil" onPress={onProfile} style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", backgroundColor: colors.mint }}><Text style={{ color: colors.green, fontWeight: "800" }}>{initials(user?.displayName ?? "")}</Text></Pressable></View>
    <Card style={{ padding: 27, gap: 22, borderRadius: 30 }}><View style={ui.row}><MessageSquareText size={26} color={colors.green} /><Text style={[ui.heading, { color: colors.green }]}>Nueva práctica</Text></View><Text style={ui.body}>Elige un escenario para practicar y ganar confianza a tu ritmo.</Text><Button title="Comenzar práctica" arrow onPress={onLibrary} disabled={opening} /></Card>
    {error || remote.error ? <><Notice error>{error || remote.error}</Notice><Button title="Volver a cargar" secondary onPress={() => void remote.reload()} /></> : null}
    {remote.loading && !remote.data ? <Loading /> : null}
    {remote.data ? <>
      <View style={ui.between}><Text style={ui.heading}>Explora escenarios</Text><Badge>A tu ritmo</Badge></View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>{remote.data.scenarios.filter((item) => item.category !== "DAILY").slice(0, 2).map((scenario) => <Pressable key={scenario.id} accessibilityRole="button" accessibilityLabel={`Ver ${scenario.title}`} onPress={() => onScenario(scenario)} style={[ui.card, { flex: 1, minWidth: 190, padding: 18, gap: 10 }]}><CategoryTag category={scenario.category} /><Text style={[ui.body, { fontWeight: "700" }]}>{scenario.title}</Text><View style={ui.row}><Text style={[ui.muted, { color: colors.green }]}>Practicar</Text><ArrowRight size={16} color={colors.green} /></View></Pressable>)}</View>
      <View style={ui.between}><Text style={ui.heading}>Continúa a tu ritmo</Text><Badge>{remote.data.pending.length} / 5 pendientes</Badge></View>
      {remote.data.pending.length ? remote.data.pending.map((practice) => <PracticeCard key={practice.id} practice={practice} disabled={opening} onOpen={() => void open(practice)} onDelete={() => setSelected(practice)} />) : <Empty title="Tu próxima conversación te espera" description="Puedes iniciar una práctica y pausarla cuando lo necesites." />}
      {remote.data.recent.length ? <><Text style={ui.heading}>Prácticas recientes</Text>{remote.data.recent.map((practice) => <PracticeCard key={practice.id} practice={practice} onOpen={() => onPractice(practice.id)} />)}</> : null}
    </> : null}
    <Text style={[ui.muted, { textAlign: "center", fontSize: 12 }]}>Modo de demostración · Respuestas simuladas, sin IA real.</Text>
    <ConfirmDialog visible={Boolean(selected)} title="¿Eliminar esta práctica pendiente?" description="Se eliminarán sus mensajes y se liberará un lugar para comenzar otra práctica." loading={opening} onConfirm={() => void remove()} onCancel={() => setSelected(null)} />
  </Page>;
}
