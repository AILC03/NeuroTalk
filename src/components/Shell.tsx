import type { ReactNode } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { ChartColumn, House, MessageCircle, UserRound } from "./icons";
import { Brand, ui } from "./ui";
import { colors } from "../theme/tokens";
import type { Tab } from "../navigation/types";

const tabs = [{ name: "home", label: "Inicio", Icon: House }, { name: "library", label: "Practicar", Icon: MessageCircle },
  { name: "progress", label: "Progreso", Icon: ChartColumn }, { name: "profile", label: "Perfil", Icon: UserRound }] as const;

export function Shell({ children, tab, navigate, chat = false }: { children: ReactNode; tab: Tab; navigate: (tab: Tab) => void; chat?: boolean }) {
  const desktop = useWindowDimensions().width >= 1000;
  const navigation = <View accessibilityRole="tablist" style={{ flexDirection: desktop ? "column" : "row", gap: desktop ? 12 : 0, padding: desktop ? 0 : 12, justifyContent: "space-around" }}>
    {tabs.map(({ name, label, Icon }) => <Pressable key={name} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: tab === name }} aria-selected={tab === name} onPress={() => navigate(name)}
      style={{ flex: desktop ? undefined : 1, minHeight: 52, padding: desktop ? 14 : 6, borderRadius: 16, gap: 5, backgroundColor: tab === name ? colors.mint : "transparent", flexDirection: desktop ? "row" : "column", alignItems: "center" }}>
      <Icon size={23} strokeWidth={1.7} color={tab === name ? colors.green : colors.muted} /><Text style={{ fontSize: desktop ? 15 : 11, fontWeight: tab === name ? "700" : "500", color: tab === name ? colors.green : colors.muted }}>{label}</Text>
    </Pressable>)}
  </View>;
  return <View style={{ flex: 1, width: "100%", maxWidth: 1240, alignSelf: "center", flexDirection: desktop && !chat ? "row" : "column" }}>
    {desktop && !chat ? <View style={{ width: 240, padding: 26, borderRightWidth: 1, borderColor: colors.border, gap: 42 }}><Brand />{navigation}<Text style={[ui.muted, { marginTop: "auto", fontSize: 12 }]}>A tu ritmo, una conversación a la vez.</Text></View> : null}
    <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
    {!desktop && !chat ? <View style={{ borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>{navigation}</View> : null}
  </View>;
}
