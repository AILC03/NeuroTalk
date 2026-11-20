import { useId, type ReactNode } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, GraduationCap, House, Sparkles } from "./icons";
import { colors, categoryColors } from "../theme/tokens";
import type { Category } from "../lib/types";
import { categoryLabel } from "../lib/format";

export const ui = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, paddingBottom: 32, gap: 22, width: "100%", maxWidth: 820, alignSelf: "center" },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "800", color: colors.ink, letterSpacing: -0.8 },
  heading: { fontSize: 21, lineHeight: 28, fontWeight: "700", color: colors.ink, letterSpacing: -0.4 },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink }, muted: { fontSize: 14, lineHeight: 21, color: colors.muted },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: "700", letterSpacing: 1, color: colors.green, textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 }, between: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 24, padding: 22, gap: 12 },
  label: { fontSize: 13, lineHeight: 20, fontWeight: "700", color: colors.muted },
  input: { backgroundColor: colors.input, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 15, minHeight: 52, fontSize: 16, color: colors.ink },
  flex: { flex: 1 }, gap: { gap: 16 }, divider: { height: 1, backgroundColor: colors.border },
});

export function Page({ children }: { children: ReactNode }) { return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}>{children}</ScrollView>; }
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) { return <View style={[ui.card, style]}>{children}</View>; }
export function Brand() { return <View style={ui.row}><View style={{ backgroundColor: colors.green, borderRadius: 12, padding: 9 }}><Sparkles size={22} color="white" /></View><Text style={[ui.heading, { fontSize: 21 }]}>NeuroTalk</Text></View>; }
export function CategoryIcon({ category, large = false }: { category: Category; large?: boolean }) {
  const Icon = category === "WORK" ? BriefcaseBusiness : category === "ACADEMIC" ? GraduationCap : House;
  return <View style={{ backgroundColor: categoryColors[category].background, padding: large ? 22 : 12, borderRadius: large ? 28 : 16, alignSelf: "flex-start" }}><Icon size={large ? 42 : 24} color={categoryColors[category].foreground} strokeWidth={1.7} /></View>;
}
export function CategoryTag({ category }: { category: Category }) { return <Text style={[ui.eyebrow, { color: categoryColors[category].foreground }]}>{categoryLabel[category]}</Text>; }
export function Badge({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return <View style={{ backgroundColor: warning ? colors.warningSoft : colors.mint, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 5, alignSelf: "flex-start" }}><Text style={{ fontSize: 12, fontWeight: "700", color: warning ? colors.warning : colors.green }}>{children}</Text></View>;
}
export function Button({ title, onPress, disabled = false, loading = false, secondary = false, danger = false, arrow = false }: { title: string; onPress: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean; danger?: boolean; arrow?: boolean }) {
  const foreground = danger ? colors.danger : secondary ? colors.green : "#fff";
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: disabled || loading, busy: loading }} disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 54, paddingVertical: 15, paddingHorizontal: 18, borderRadius: 16, backgroundColor: danger ? colors.dangerSoft : secondary ? colors.mint : colors.green,
      opacity: disabled || loading ? 0.55 : pressed ? 0.8 : 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 })}>
    {loading ? <ActivityIndicator color={foreground} /> : null}<Text style={{ color: foreground, fontSize: 16, fontWeight: "700", textAlign: "center" }}>{title}</Text>{arrow ? <ArrowRight size={19} color={foreground} /> : null}
  </Pressable>;
}
export function BackHeader({ title, onBack, disabled = false }: { title: string; onBack: () => void; disabled?: boolean }) {
  return <View style={ui.row}><Pressable accessibilityRole="button" accessibilityLabel="Volver" disabled={disabled} onPress={onBack} style={{ padding: 10, borderRadius: 50, backgroundColor: "white", opacity: disabled ? 0.5 : 1 }}><ArrowLeft size={23} color={colors.ink} /></Pressable><Text style={[ui.heading, ui.flex]}>{title}</Text></View>;
}
export function Field({ label, hint, error, ...props }: TextInputProps & { label: string; hint?: string; error?: string }) {
  const id = useId();
  return <View style={{ gap: 8 }}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} placeholderTextColor="#7c8a81" {...props} style={[ui.input, error ? { borderColor: colors.danger } : null, props.style]} />{error ? <Text nativeID={`${id}-error`} accessibilityLiveRegion="polite" style={{ color: colors.danger, lineHeight: 20, fontSize: 13 }}>{error}</Text> : hint ? <Text nativeID={`${id}-hint`} style={ui.muted}>{hint}</Text> : null}</View>;
}
export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <View accessibilityRole={error ? "alert" : undefined} accessibilityLiveRegion="polite" style={{ padding: 15, borderRadius: 16, backgroundColor: error ? colors.dangerSoft : colors.mint }}><Text style={{ color: error ? colors.danger : colors.greenDark, fontSize: 14, lineHeight: 21 }}>{children}</Text></View>;
}
export function Loading({ label = "Cargando…" }: { label?: string }) { return <View style={{ padding: 32, alignItems: "center", gap: 12 }}><ActivityIndicator accessibilityLabel={label} color={colors.green} /><Text style={ui.muted}>{label}</Text></View>; }
export function Empty({ title, description }: { title: string; description: string }) { return <Card><Text style={ui.heading}>{title}</Text><Text style={ui.muted}>{description}</Text></Card>; }
export function ConfirmDialog({ visible, title, description, loading, onConfirm, onCancel }: { visible: boolean; title: string; description: string; loading: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (!loading) onCancel(); }}><View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(20,40,30,0.35)", padding: 24 }}><View accessibilityViewIsModal style={[ui.card, { maxWidth: 440, width: "100%", alignSelf: "center", gap: 20 }]}><Text accessibilityRole="header" style={ui.heading}>{title}</Text><Text style={ui.body}>{description}</Text><Button title="Confirmar eliminación" danger loading={loading} onPress={onConfirm} /><Button title="Cancelar" secondary disabled={loading} onPress={onCancel} /></View></View></Modal>;
}
