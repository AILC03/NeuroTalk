import type { ReactNode } from "react";
import type { Scenario } from "../../lib/types";
import { api } from "../../lib/api";
import { useRemote } from "../../hooks/useRemote";
import { BackHeader, Button, Loading, Notice, Page } from "../../components/ui";

export function ScenarioRoute({ id, onBack, children }: { id: string; onBack: () => void; children: (scenario: Scenario) => ReactNode }) {
  const remote = useRemote(() => api.scenario(id), [id]);
  if (remote.data) return <>{children(remote.data)}</>;
  return <Page><BackHeader title="Escenario" onBack={onBack} />{remote.error ? <><Notice error>{remote.error}</Notice><Button title="Reintentar carga" onPress={() => void remote.reload()} /><Button title="Volver a la biblioteca" secondary onPress={onBack} /></> : <Loading label="Cargando escenario…" />}</Page>;
}
