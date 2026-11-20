import type { Category, Practice } from "../../lib/types";

function dayKey(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (type: string) => parts.find((entry) => entry.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function activity(practices: Practice[], timeZone: string, now = new Date()) {
  const eligible = practices.filter((item) => item.provider === "SIMULATED" && item.status === "COMPLETED" && item.userMessageCount > 0 && item.finishedAt);
  const today = new Date(`${dayKey(now, timeZone)}T12:00:00Z`);
  today.setUTCDate(today.getUTCDate() - (today.getUTCDay() + 6) % 7);
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today); day.setUTCDate(today.getUTCDate() + index);
    const key = day.toISOString().slice(0, 10);
    const matches = eligible.filter((item) => dayKey(new Date(item.finishedAt!), timeZone) === key);
    return { key, label: ["L", "M", "M", "J", "V", "S", "D"][index]!, count: matches.length, seconds: matches.reduce((sum, item) => sum + item.practiceDurationSeconds, 0) };
  });
  const categories = (["WORK", "ACADEMIC", "DAILY"] as Category[]).map((category) => {
    const count = eligible.filter((item) => item.category === category).length;
    return { category, count, percentage: eligible.length ? Math.round(count / eligible.length * 100) : 0 };
  });
  const counts = new Map<string, { title: string; count: number }>();
  for (const item of eligible) { const current = counts.get(item.scenarioId); counts.set(item.scenarioId, { title: item.scenarioTitle, count: (current?.count ?? 0) + 1 }); }
  const sorted = [...counts.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "es"));
  return { total: eligible.length, seconds: eligible.reduce((sum, item) => sum + item.practiceDurationSeconds, 0), week, categories, mostPracticed: sorted[0] ?? null,
    tied: sorted.length > 1 && sorted[0]!.count === sorted[1]!.count };
}
