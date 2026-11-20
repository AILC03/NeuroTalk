export type Tab = "home" | "library" | "progress" | "profile";
export type Route = { name: Tab } | { name: "detail" | "configure"; scenarioId: string } | { name: "chat" | "result"; id: string };
