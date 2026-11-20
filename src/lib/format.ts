import type { Category, Difficulty, PracticeStatus } from "./types";

export const categoryLabel: Record<Category, string> = { WORK: "Laboral", ACADEMIC: "Académica", DAILY: "Cotidiana" };
export const difficultyLabel: Record<Difficulty, string> = { EASY: "Fácil", MEDIUM: "Medio", HARD: "Difícil" };
export const statusLabel: Record<PracticeStatus, string> = { ACTIVE: "En curso", PAUSED: "Pausada", CLOSING: "Finalizando", COMPLETED: "Finalizada" };
export function duration(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  return minutes === 0 ? "Menos de 1 min" : `${minutes} min`;
}
export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(new Date(value));
}
export function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0] ?? "").join("").toUpperCase() || "NT";
}
export function messageLength(value: string) { return Array.from(value.trim()).length; }
