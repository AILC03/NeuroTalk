import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { randomUUID } from "expo-crypto";
import { Circle, CircleDot } from "../../components/icons";
import { api, ApiError } from "../../lib/api";
import type { CreatePractice, Difficulty, Practice, Scenario } from "../../lib/types";
import { difficultyLabel } from "../../lib/format";
import { BackHeader, Badge, Button, Card, CategoryIcon, CategoryTag, Field, Notice, Page, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";

const levels: { value: Difficulty; description: string }[] = [
  { value: "EASY", description: "Preguntas directas y más orientación." },
  { value: "MEDIUM", description: "Conversación natural con preguntas de seguimiento." },
  { value: "HARD", description: "Preguntas exigentes y menos apoyo, siempre con respeto." },
];
export function ConfigureScreen({ scenario, onBack, onCreated, onPending }: { scenario: Scenario; onBack: () => void; onCreated: (practice: Practice) => void; onPending: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM"); const [customize, setCustomize] = useState(false);
  const [context, setContext] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [uncertain, setUncertain] = useState(false); const [atLimit, setAtLimit] = useState(false);
  const attempt = useRef<CreatePractice | null>(null); const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function create() {
    setBusy(true); setError(""); setAtLimit(false);
    attempt.current ??= { clientRequestId: randomUUID(), scenarioId: scenario.id, difficulty, customContext: Object.fromEntries(Object.entries(context).filter(([, value]) => value.trim()).map(([key, value]) => [key, value.trim()])) };
    try { const practice = await api.createPractice(attempt.current); if (mounted.current) onCreated(practice); }
    catch (failure) {
      if (!mounted.current) return;
      setError(failure instanceof Error ? failure.message : "No se pudo crear la práctica.");
      const ambiguous = failure instanceof ApiError && (failure.status === 0 || failure.status >= 500);
      setUncertain(ambiguous); setAtLimit(failure instanceof ApiError && failure.code === "PRACTICE_LIMIT_REACHED");
      if (!ambiguous) attempt.current = null;
    } finally { if (mounted.current) setBusy(false); }
  }
  return <Page><BackHeader title="Configurar práctica" onBack={onBack} disabled={busy} /><Text style={ui.muted}>Prepara tu conversación a tu ritmo.</Text>
    <Card><View style={ui.row}><CategoryIcon category={scenario.category} /><View style={[ui.flex, { gap: 4 }]}><CategoryTag category={scenario.category} /><Text style={ui.heading}>{scenario.title}</Text><Text style={ui.muted}>{scenario.aiRole} simulado · {scenario.estimatedMinMinutes ?? 10}–{scenario.estimatedMaxMinutes ?? 15} min</Text></View></View></Card>
    <View style={{ gap: 5 }}><Text style={ui.heading}>Elige la dificultad</Text><Text style={ui.muted}>Define cómo responderá tu interlocutor.</Text></View>
    <View accessibilityRole="radiogroup" style={{ gap: 12 }}>{levels.map((level) => {
      const selected = difficulty === level.value; const Icon = selected ? CircleDot : Circle;
      return <Pressable key={level.value} accessibilityRole="radio" accessibilityLabel={`Dificultad ${difficultyLabel[level.value]}`} accessibilityState={{ checked: selected, disabled: busy || uncertain }} aria-checked={selected} disabled={busy || uncertain} onPress={() => setDifficulty(level.value)}
        style={[ui.card, { flexDirection: "row", borderColor: selected ? colors.green : colors.border, borderWidth: selected ? 2 : 1, backgroundColor: selected ? colors.mint : "white", padding: 20 }]}>
        <Icon size={23} color={selected ? colors.green : colors.muted} /><View style={[ui.flex, { gap: 8 }]}><View style={ui.between}><Text style={ui.heading}>{difficultyLabel[level.value]}</Text>{selected ? <Badge>Seleccionado</Badge> : null}</View><Text style={ui.muted}>{level.description}</Text></View>
      </Pressable>;
    })}</View>
    <Button title={customize ? "Ocultar contexto opcional" : "Personalizar contexto (opcional)"} secondary disabled={busy || uncertain} onPress={() => setCustomize(!customize)} />
    {customize ? <Card><Text style={ui.muted}>Puedes inventar la situación. Si dejas un campo vacío, usaremos el contexto ficticio de ejemplo.</Text>{scenario.contextFields.map((field) => <Field key={field.key} label={field.label} placeholder={field.defaultValue} value={context[field.key] ?? ""} onChangeText={(value) => setContext((current) => ({ ...current, [field.key]: value }))} maxLength={500} editable={!busy && !uncertain} />)}</Card> : null}
    {error ? <Notice error>{error}</Notice> : null}
    {uncertain ? <Notice>No pudimos confirmar la creación. Reintenta con la misma configuración: no se creará una segunda práctica.</Notice> : null}
    {atLimit ? <Button title="Ver mis prácticas pendientes" secondary onPress={onPending} /> : null}
    <Button title={uncertain ? "Reintentar creación" : "Iniciar práctica"} arrow loading={busy} onPress={() => void create()} />
    <Text style={[ui.muted, { textAlign: "center", fontSize: 12 }]}>Modo de demostración: respuestas simuladas. Puedes pausar cuando lo necesites.</Text>
  </Page>;
}
