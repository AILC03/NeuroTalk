import { Text, View } from "react-native";
import { BackHeader, Button, Card, CategoryIcon, CategoryTag, Page, ui } from "../../components/ui";
import type { Scenario } from "../../lib/types";
import { colors } from "../../theme/tokens";

export function DetailScreen({ scenario, onBack, onConfigure }: { scenario: Scenario; onBack: () => void; onConfigure: () => void }) {
  return <Page><BackHeader title="Detalle del escenario" onBack={onBack} />
    <View style={{ alignItems: "center", paddingVertical: 8 }}><CategoryIcon category={scenario.category} large /></View>
    <View style={{ gap: 10 }}><CategoryTag category={scenario.category} /><Text accessibilityRole="header" style={ui.title}>{scenario.title}</Text><Text style={ui.muted}>{scenario.description}</Text></View>
    <Card><Text style={[ui.label, { color: colors.green }]}>Tu interlocutor</Text><Text style={ui.heading}>{scenario.aiRole}</Text><Text style={ui.muted}>Un personaje simulado para explorar esta situación.</Text></Card>
    <Card><Text style={[ui.label, { color: colors.green }]}>Objetivo de la práctica</Text><Text style={ui.body}>{scenario.objective}</Text></Card>
    <Card><Text style={[ui.label, { color: colors.green }]}>Duración estimada</Text><Text style={ui.heading}>{scenario.estimatedMinMinutes ?? 10}–{scenario.estimatedMaxMinutes ?? 15} minutos</Text><Text style={ui.muted}>Es una referencia, no un límite. Puedes pausar cuando lo necesites.</Text></Card>
    <Button title="Configurar práctica" arrow onPress={onConfigure} /><Text style={[ui.muted, { textAlign: "center", fontSize: 13 }]}>Tú eliges la dificultad antes de comenzar.</Text>
  </Page>;
}
