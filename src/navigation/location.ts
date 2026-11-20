import type { Route } from "./types";
const tabs = { home: "inicio", library: "practicar", progress: "progreso", profile: "perfil" } as const;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function serializeRoute(route: Route) {
  if (route.name === "detail" || route.name === "configure") return `#/escenarios/${route.scenarioId}${route.name === "configure" ? "/configurar" : ""}`;
  if (route.name === "chat" || route.name === "result") return `#/practicas/${route.id}${route.name === "result" ? "/resultado" : ""}`;
  return `#/${tabs[route.name]}`;
}
export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/");
  for (const [name, path] of Object.entries(tabs)) if (parts.length === 1 && parts[0] === path) return { name: name as keyof typeof tabs };
  if (parts[1] && uuid.test(parts[1])) {
    if (parts[0] === "escenarios" && (parts.length === 2 || (parts.length === 3 && parts[2] === "configurar"))) return { name: parts[2] ? "configure" : "detail", scenarioId: parts[1] };
    if (parts[0] === "practicas" && (parts.length === 2 || (parts.length === 3 && parts[2] === "resultado"))) return { name: parts[2] ? "result" : "chat", id: parts[1] };
  }
  return { name: "home" };
}
export function resetWebRoute() {
  if (typeof window !== "undefined" && window.history && window.location) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#/inicio`);
}
