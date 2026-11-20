import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { api } from "../../lib/api";
import type { Practice } from "../../lib/types";
import { categoryLabel, duration } from "../../lib/format";
import { useRemote } from "../../hooks/useRemote";
import { Badge, Button, Card, ConfirmDialog, Empty, Loading, Notice, Page, ui } from "../../components/ui";
import { colors, categoryColors } from "../../theme/tokens";
import { useAuth } from "../auth/AuthProvider";
import { PracticeCard } from "../practices/PracticeCard";
import { activity } from "./activity";

export function ProgressScreen({ onResult }: { onResult: (id: string) => void }) {
  const { user } = useAuth();
  const remote = useRemote(async () => {
    const items: Practice[] = []; let cursor: string | null = null;
    do { const page = await api.practices({ status: "COMPLETED", ...(cursor ? { cursor } : {}) }); items.push(...page.items); cursor = page.nextCursor; } while (cursor);
    return items;
  }, []);
  const [tab, setTab] = useState<"progress" | "history">("progress"); const [selected, setSelected] = useState<Practice | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const data = remote.data ? activity(remote.data, user?.timeZone ?? "America/Tijuana") : null;
  const weeklyCount = data?.week.reduce((sum, day) => sum + day.count, 0) ?? 0;
  async function remove() {
    if (!selected) return;
    setBusy(true); setError("");
    try { await api.deletePractice(selected.id); setSelected(null); await remote.reload(); }
    catch (failure) { setSelected(null); setError(failure instanceof Error ? failure.message : "No se pudo eliminar la práctica."); }
    finally { setBusy(false); }
  }
  const groups = remote.data?.reduce<Record<string, Practice[]>>((result, item) => {
    const month = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: user?.timeZone ?? "America/Tijuana" }).format(new Date(item.finishedAt ?? item.startedAt));
    (result[month] ??= []).push(item); return result;
  }, {});
  return <Page><View style={{ gap: 8 }}><Text accessibilityRole="header" style={ui.title}>{tab === "progress" ? "Mi progreso" : "Historial"}</Text><Text style={ui.muted}>{tab === "progress" ? "Cada conversación cuenta." : "Revisa las situaciones que has practicado."}</Text></View>
    <View accessibilityRole="tablist" style={{ flexDirection: "row", backgroundColor: "#e9ede5", padding: 5, borderRadius: 17 }}>{(["progress", "history"] as const).map((value) => <Pressable key={value} accessibilityRole="tab" accessibilityLabel={value === "progress" ? "Ver progreso" : "Ver historial"} accessibilityState={{ selected: tab === value }} aria-selected={tab === value} onPress={() => setTab(value)} style={{ flex: 1, padding: 13, borderRadius: 13, alignItems: "center", backgroundColor: tab === value ? "white" : "transparent" }}><Text style={{ color: colors.greenDark, fontWeight: "700" }}>{value === "progress" ? "Progreso" : "Historial"}</Text></Pressable>)}</View>
    {error || remote.error ? <><Notice error>{error || remote.error}</Notice><Button title="Reintentar carga" secondary onPress={() => void remote.reload()} /></> : null}
    {remote.loading ? <Loading label="Consultando prácticas guardadas…" /> : null}
    {data && !remote.loading && tab === "progress" ? <>
      <Badge>Actividad de prácticas simuladas</Badge>
      <View style={{ flexDirection: "row", gap: 14 }}><Card style={{ flex: 1 }}><Text style={[ui.title, { color: colors.green }]}>{data.total}</Text><Text style={ui.muted}>Sesiones realizadas</Text></Card><Card style={{ flex: 1 }}><Text style={[ui.title, { color: colors.green, fontSize: 27 }]}>{data.seconds ? duration(data.seconds) : "0 min"}</Text><Text style={ui.muted}>Tiempo de práctica</Text></Card></View>
      <Card><Text style={ui.heading}>Actividad esta semana</Text><Text style={ui.muted}>{weeklyCount} {weeklyCount === 1 ? "sesión" : "sesiones"} · {Math.floor(data.week.reduce((sum, day) => sum + day.seconds, 0) / 60)} minutos</Text>
        <View accessibilityLabel="Sesiones realizadas de lunes a domingo" style={{ flexDirection: "row", gap: 14, height: 105, alignItems: "flex-end" }}>{data.week.map((day) => <View key={day.key} style={{ flex: 1, alignItems: "center", gap: 7 }}><Text style={[ui.muted, { fontSize: 11 }]}>{day.count}</Text><View style={{ width: "80%", maxWidth: 34, height: day.count ? Math.max(8, day.count / Math.max(1, ...data.week.map((entry) => entry.count)) * 64) : 2, borderRadius: 5, backgroundColor: day.count ? colors.green : colors.border }} /><Text style={ui.muted}>{day.label}</Text></View>)}</View>
      </Card>
      <Card><Text style={ui.heading}>Categorías practicadas</Text>{data.categories.map((item) => <View key={item.category} style={{ gap: 6 }}><View style={ui.between}><Text style={ui.muted}>{categoryLabel[item.category]}</Text><Text style={{ color: categoryColors[item.category].foreground, fontWeight: "700" }}>{item.percentage}%</Text></View><View style={{ height: 7, backgroundColor: "#edf0ea", borderRadius: 5 }}><View style={{ height: 7, width: `${item.percentage}%`, borderRadius: 5, backgroundColor: item.category === "WORK" ? colors.green : item.category === "ACADEMIC" ? "#998bb7" : "#dda66b" }} /></View></View>)}</Card>
      {data.mostPracticed ? <Card style={{ backgroundColor: colors.mint }}><Text style={[ui.label, { color: colors.green }]}>{data.tied ? "Uno de tus escenarios más practicados" : "Tu escenario más practicado"}</Text><Text style={ui.heading}>{data.mostPracticed.title}</Text><Text style={ui.muted}>{data.mostPracticed.count} {data.mostPracticed.count === 1 ? "sesión" : "sesiones"} · Sigue practicando a tu ritmo.</Text></Card> : <Empty title="Cada práctica es un comienzo" description="Cuando finalices una conversación con participación, aparecerá en estos indicadores." />}
      <Text style={[ui.muted, { fontSize: 12 }]}>Actividad calculada a partir de todas tus prácticas simuladas finalizadas con al menos un mensaje tuyo. No es una calificación de comunicación. Zona: {user?.timeZone ?? "America/Tijuana"}. Porcentajes redondeados.</Text>
    </> : null}
    {groups && !remote.loading && tab === "history" ? Object.keys(groups).length ? Object.entries(groups).map(([month, items]) => <View key={month} style={{ gap: 14 }}><Text style={ui.eyebrow}>{month}</Text>{items.map((item) => <PracticeCard key={item.id} practice={item} disabled={busy} onOpen={() => onResult(item.id)} onDelete={() => setSelected(item)} />)}</View>) : <Empty title="Aún no tienes prácticas finalizadas" description="Las conversaciones que termines aparecerán aquí. Puedes retomar las pausadas desde Inicio." /> : null}
    <ConfirmDialog visible={Boolean(selected)} title="¿Eliminar esta práctica?" description="Se eliminarán sus mensajes y resultados. También dejará de aparecer en tus indicadores." loading={busy} onConfirm={() => void remove()} onCancel={() => setSelected(null)} />
  </Page>;
}
