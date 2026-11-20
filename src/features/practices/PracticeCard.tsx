import { Pressable, Text, View } from "react-native";
import { ChevronRight, Trash2 } from "../../components/icons";
import type { Practice } from "../../lib/types";
import { categoryLabel, dateLabel, difficultyLabel, duration, statusLabel } from "../../lib/format";
import { CategoryIcon, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";

export function PracticeCard({ practice, onOpen, onDelete, disabled = false }: { practice: Practice; onOpen: () => void; onDelete?: () => void; disabled?: boolean }) {
  return <View style={[ui.card, { flexDirection: "row", alignItems: "center", padding: 17, gap: 13 }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${practice.status === "COMPLETED" ? "Ver resultado de" : "Retomar"} ${practice.scenarioTitle}`} disabled={disabled} onPress={onOpen} style={[ui.row, ui.flex]}>
      <CategoryIcon category={practice.category} /><View style={[ui.flex, { gap: 4 }]}><Text style={[ui.body, { fontWeight: "700" }]}>{practice.scenarioTitle}</Text><Text style={[ui.muted, { fontSize: 12 }]}>{dateLabel(practice.finishedAt ?? practice.startedAt)} · {categoryLabel[practice.category]} · {difficultyLabel[practice.difficulty]}</Text><Text style={[ui.muted, { fontSize: 12 }]}>{practice.status === "COMPLETED" ? duration(practice.practiceDurationSeconds) : statusLabel[practice.status]} · Simulada</Text></View><ChevronRight color={colors.green} size={19} />
    </Pressable>
    {onDelete ? <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar práctica ${practice.scenarioTitle}`} disabled={disabled} onPress={onDelete} style={{ padding: 9 }}><Trash2 size={18} color={colors.muted} /></Pressable> : null}
  </View>;
}
