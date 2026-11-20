import assert from "node:assert/strict";
import { test } from "node:test";
import { activity } from "../src/features/progress/activity";
import { duration, initials, messageLength } from "../src/lib/format";
import type { Practice } from "../src/lib/types";
import { clearPendingSends, uncertainSends } from "../src/lib/pending";

function practice(extra: Partial<Practice> = {}): Practice {
  return { id: "practice", scenarioId: "scenario", scenarioTitle: "Entrevista", category: "WORK", aiRole: "Reclutador", difficulty: "MEDIUM",
    provider: "SIMULATED", status: "COMPLETED", customContext: {}, userMessageCount: 1, messageCount: 3, remainingUserMessages: 29,
    limitWarning: false, practiceDurationSeconds: 120, feedbackStatus: "NOT_AVAILABLE", latestReply: null,
    startedAt: "2026-10-16T12:00:00Z", pausedAt: null, finishedAt: "2026-10-16T12:02:00Z", pauseReason: null, finishReason: "USER_REQUEST", ...extra };
}
test("indicadores vacíos no inventan actividad", () => {
  const result = activity([], "America/Tijuana", new Date("2026-10-16T12:00:00Z"));
  assert.equal(result.total, 0); assert.equal(result.seconds, 0); assert.equal(result.mostPracticed, null);
  assert.equal(result.week.length, 7); assert.equal(result.week[0]!.key, "2026-10-12");
  assert.ok(result.categories.every((item) => item.percentage === 0));
});
test("excluye sesiones sin participación, pausadas y de otro proveedor", () => {
  const result = activity([practice(), practice({ userMessageCount: 0 }), practice({ status: "PAUSED" }), practice({ provider: "OPENAI" })], "America/Tijuana");
  assert.equal(result.total, 1); assert.equal(result.seconds, 120); assert.equal(result.categories[0]!.percentage, 100);
});
test("semana y fecha respetan la zona horaria, no UTC del cierre", () => {
  const result = activity([practice({ finishedAt: "2026-10-12T01:00:00Z" })], "America/Tijuana", new Date("2026-10-12T01:05:00Z"));
  assert.equal(result.week[0]!.key, "2026-10-05"); assert.equal(result.week[6]!.count, 1);
});
test("empates de escenario son explícitos y borrar una práctica cambia indicadores", () => {
  const data = [practice(), practice({ id: "other", scenarioId: "other", scenarioTitle: "Ayuda", category: "ACADEMIC" })];
  const initial = activity(data, "America/Tijuana");
  assert.equal(initial.tied, true); assert.equal(initial.categories[0]!.percentage, 50);
  const afterDelete = activity(data.slice(0, 1), "America/Tijuana");
  assert.equal(afterDelete.total, 1); assert.equal(afterDelete.tied, false); assert.equal(afterDelete.seconds, 120);
});
test("formato y caracteres Unicode coinciden con el servidor", () => {
  assert.equal(messageLength("  😀Hola  "), 5); assert.equal(messageLength("😀".repeat(2000)), 2000);
  assert.equal(initials(" Maya Calvillo "), "MC"); assert.equal(initials(""), "NT");
  assert.equal(duration(0), "Menos de 1 min"); assert.equal(duration(125), "2 min");
});

test("la limpieza de sesión elimina envíos inciertos de la memoria", () => {
  uncertainSends.set("practice", { clientMessageId: "test-only", content: "Texto ficticio" });
  clearPendingSends(); assert.equal(uncertainSends.size, 0);
});
