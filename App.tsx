import { useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/features/auth/AuthProvider";
import { AuthScreen } from "./src/features/auth/AuthScreen";
import { HomeScreen } from "./src/features/home/HomeScreen";
import { LibraryScreen } from "./src/features/scenarios/LibraryScreen";
import { DetailScreen } from "./src/features/scenarios/DetailScreen";
import { ConfigureScreen } from "./src/features/scenarios/ConfigureScreen";
import { ChatScreen } from "./src/features/practices/ChatScreen";
import { ResultScreen } from "./src/features/practices/ResultScreen";
import { ProgressScreen } from "./src/features/progress/ProgressScreen";
import { ProfileScreen } from "./src/features/profile/ProfileScreen";
import { Shell } from "./src/components/Shell";
import { Loading, Notice } from "./src/components/ui";
import { api } from "./src/lib/api";
import { colors } from "./src/theme/tokens";
import type { Tab } from "./src/navigation/types";
import { useWebRoute } from "./src/navigation/useWebRoute";
import { ScenarioRoute } from "./src/features/scenarios/ScenarioRoute";

function PrivateApp() {
  const { route, navigate: setRoute } = useWebRoute(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const tab: Tab = route.name === "profile" ? "profile" : route.name === "progress" || route.name === "result" ? "progress" : route.name === "home" ? "home" : "library";
  function home() { setRoute({ name: "home" }); setError(""); }
  async function open(id: string) {
    setBusy(true); setError("");
    try {
      const practice = await api.practice(id);
      if (practice.status === "PAUSED") await api.resume(id);
      setRoute({ name: practice.status === "COMPLETED" ? "result" : "chat", id });
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo abrir la práctica."); }
    finally { setBusy(false); }
  }
  async function repeat(scenarioId: string) {
    setError(""); setRoute({ name: "configure", scenarioId });
  }
  useEffect(() => {
    if (route.name === "chat" || route.name === "home") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (route.name === "configure") setRoute({ name: "detail", scenarioId: route.scenarioId });
      else if (route.name === "detail") setRoute({ name: "library" }); else home();
      return true;
    });
    return () => subscription.remove();
  }, [route]);
  const key = route.name + ("id" in route ? route.id : "scenarioId" in route ? route.scenarioId : "");
  return <Shell tab={tab} chat={route.name === "chat"} navigate={(name) => { if (!busy) { setError(""); setRoute({ name }); } }}>
    {error ? <View style={{ padding: 16 }}><Notice error>{error}</Notice></View> : null}
    {busy ? <Loading label="Abriendo práctica…" /> : null}
    <View key={key} style={{ flex: 1, minHeight: 0 }}>
      {route.name === "home" ? <HomeScreen onLibrary={() => setRoute({ name: "library" })} onScenario={(scenario) => setRoute({ name: "detail", scenarioId: scenario.id })} onPractice={(id) => void open(id)} onProfile={() => setRoute({ name: "profile" })} /> : null}
      {route.name === "library" ? <LibraryScreen onScenario={(scenario) => setRoute({ name: "detail", scenarioId: scenario.id })} /> : null}
      {route.name === "detail" ? <ScenarioRoute id={route.scenarioId} onBack={() => setRoute({ name: "library" })}>{(scenario) => <DetailScreen scenario={scenario} onBack={() => setRoute({ name: "library" })} onConfigure={() => setRoute({ name: "configure", scenarioId: scenario.id })} />}</ScenarioRoute> : null}
      {route.name === "configure" ? <ScenarioRoute id={route.scenarioId} onBack={() => setRoute({ name: "library" })}>{(scenario) => <ConfigureScreen scenario={scenario} onBack={() => setRoute({ name: "detail", scenarioId: scenario.id })} onCreated={(practice) => setRoute({ name: practice.status === "COMPLETED" ? "result" : "chat", id: practice.id })} onPending={home} />}</ScenarioRoute> : null}
      {route.name === "chat" ? <ChatScreen id={route.id} onLeave={home} onResult={() => setRoute({ name: "result", id: route.id })} /> : null}
      {route.name === "result" ? <ResultScreen id={route.id} onHome={home} onRepeat={(scenarioId) => void repeat(scenarioId)} onConversation={() => setRoute({ name: "chat", id: route.id })} /> : null}
      {route.name === "progress" ? <ProgressScreen onResult={(id) => setRoute({ name: "result", id })} /> : null}
      {route.name === "profile" ? <ProfileScreen /> : null}
    </View>
  </Shell>;
}
function Root() { const auth = useAuth(); return auth.initializing ? <Loading label="Preparando NeuroTalk…" /> : auth.user ? <PrivateApp key={auth.user.id} /> : <AuthScreen />; }
export default function App() {
  return <SafeAreaProvider><SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><StatusBar style="dark" /><AuthProvider><Root /></AuthProvider></SafeAreaView></SafeAreaProvider>;
}
