import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { api } from "../lib/api";
import { parseRoute, serializeRoute } from "./location";
import type { Route } from "./types";

const browser = Platform.OS === "web" && typeof window !== "undefined";
export function useWebRoute() {
  const [route, setRoute] = useState<Route>(() => browser ? parseRoute(window.location.hash) : { name: "home" });
  const current = useRef(route);
  const commit = useCallback((target: Route) => {
    const previous = current.current;
    if (previous.name === "chat" && serializeRoute(previous) !== serializeRoute(target)) {
      // Atrás/Adelante del navegador: pausa de mejor esfuerzo; inactividad sigue siendo el respaldo.
      void api.practice(previous.id).then((practice) => practice.status === "ACTIVE" ? api.pause(previous.id, "LEFT_CHAT") : undefined).catch(() => {});
    }
    current.current = target; setRoute(target);
  }, []);
  const navigate = useCallback((target: Route) => {
    if (browser && window.location.hash !== serializeRoute(target)) window.location.hash = serializeRoute(target);
    else commit(target);
  }, [commit]);
  useEffect(() => {
    if (!browser) return;
    const change = () => {
      const target = parseRoute(window.location.hash);
      const canonical = serializeRoute(target);
      if (window.location.hash !== canonical) window.history.replaceState(null, "", canonical);
      commit(target);
    };
    if (!window.location.hash || window.location.hash !== serializeRoute(current.current)) window.history.replaceState(null, "", serializeRoute(current.current));
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, [commit]);
  useEffect(() => {
    if (!browser) return;
    const title = { home: "Inicio", library: "Escenarios", detail: "Detalle del escenario", configure: "Configurar práctica", chat: "Conversación", result: "Resultado", progress: "Progreso", profile: "Perfil" }[route.name];
    document.title = `${title} · NeuroTalk`;
  }, [route]);
  return { route, navigate };
}
