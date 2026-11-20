import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ArrowRight, Search } from "../../components/icons";
import { api } from "../../lib/api";
import type { Category, Scenario } from "../../lib/types";
import { categoryLabel } from "../../lib/format";
import { useRemote } from "../../hooks/useRemote";
import { Button, CategoryIcon, CategoryTag, Empty, Loading, Notice, Page, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";

const groups: { category: Category; description: string; examples: string }[] = [
  { category: "DAILY", description: "Comunícate en tu día a día.", examples: "Iniciar una conversación · Aclarar un malentendido" },
  { category: "ACADEMIC", description: "Participa y expresa tus ideas.", examples: "Hablar con un profesor · Trabajo en equipo" },
  { category: "WORK", description: "Practica conversaciones de trabajo.", examples: "Entrevista de trabajo · Atención a clientes" },
];
export function LibraryScreen({ onScenario }: { onScenario: (scenario: Scenario) => void }) {
  const remote = useRemote(() => api.scenarios(), []);
  const [search, setSearch] = useState(""); const [category, setCategory] = useState<Category | null>(null);
  const filtered = remote.data?.items.filter((item) => (!category || item.category === category) && item.title.toLocaleLowerCase("es").includes(search.trim().toLocaleLowerCase("es"))) ?? [];
  return <Page>
    <View style={{ gap: 9 }}><Text style={ui.eyebrow}>Practicar</Text><Text accessibilityRole="header" style={ui.title}>Biblioteca de escenarios</Text><Text style={ui.muted}>Elige una situación y practica a tu ritmo.</Text></View>
    <View style={[ui.input, ui.row, { paddingVertical: 0 }]}><Search size={21} color={colors.muted} /><TextInput accessibilityLabel="Buscar escenarios" placeholder="Buscar escenarios" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} style={{ flex: 1, minHeight: 52, fontSize: 16, color: colors.ink }} /></View>
    {remote.error ? <><Notice error>{remote.error}</Notice><Button secondary title="Reintentar" onPress={() => void remote.reload()} /></> : null}
    {remote.loading ? <Loading label="Cargando escenarios…" /> : null}
    {remote.data ? <>
      <View style={ui.between}><Text style={ui.heading}>{category ? categoryLabel[category] : search.trim() ? "Resultados" : "¿Qué quieres practicar?"}</Text><Text style={ui.muted}>{category || search.trim() ? `${filtered.length} escenarios` : "3 categorías"}</Text></View>
      {category || search.trim() ? <>
        <Button title="Ver todas las categorías" secondary onPress={() => { setCategory(null); setSearch(""); }} />
        {filtered.length ? filtered.map((scenario) => <Pressable key={scenario.id} accessibilityRole="button" accessibilityLabel={`Ver escenario ${scenario.title}`} onPress={() => onScenario(scenario)} style={[ui.card, { gap: 15 }]}><View style={ui.row}><CategoryIcon category={scenario.category} /><View style={ui.flex}><CategoryTag category={scenario.category} /><Text style={ui.heading}>{scenario.title}</Text></View><ArrowRight size={22} color={colors.green} /></View><Text style={ui.muted}>{scenario.objective}</Text></Pressable>) : <Empty title="No encontramos ese escenario" description="Prueba con otro nombre o explora las categorías." />}
      </> : groups.map((group) => <Pressable key={group.category} accessibilityRole="button" accessibilityLabel={`Ver escenarios de categoría ${categoryLabel[group.category]}`} onPress={() => setCategory(group.category)} style={[ui.card, { gap: 18 }]}>
        <View style={ui.row}><CategoryIcon category={group.category} /><View style={[ui.flex, { gap: 3 }]}><Text style={ui.heading}>{categoryLabel[group.category]}</Text><Text style={ui.muted}>{group.description}</Text></View></View><Text style={ui.muted}>{group.examples}</Text><View style={ui.between}><Text style={{ fontSize: 15, fontWeight: "700", color: colors.green }}>Ver escenarios</Text><ArrowRight size={23} color={colors.green} /></View>
      </Pressable>)}
    </> : null}
    <Text style={[ui.muted, { textAlign: "center", fontSize: 13 }]}>Un espacio seguro, sin juicios y a tu ritmo.</Text>
  </Page>;
}
