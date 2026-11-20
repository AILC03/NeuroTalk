import { useState } from "react";
import { Text, View } from "react-native";
import { initials } from "../../lib/format";
import { Badge, Button, Card, Field, Notice, Page, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";
import { useAuth } from "../auth/AuthProvider";

export function ProfileScreen() {
  const auth = useAuth(); const [name, setName] = useState(auth.user?.displayName ?? "");
  const [password, setPassword] = useState(""); const [deleting, setDeleting] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(""); const [message, setMessage] = useState("");
  async function run(task: () => Promise<void>, success = "") {
    setBusy(true); setError(""); setMessage("");
    try { await task(); setMessage(success); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo completar la operación."); }
    finally { setBusy(false); setPassword(""); }
  }
  return <Page><Text accessibilityRole="header" style={ui.title}>Mi perfil</Text>
    <View style={{ alignItems: "center", gap: 13 }}><View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.green, fontSize: 27, fontWeight: "700" }}>{initials(auth.user?.displayName ?? "")}</Text></View><Text style={ui.heading}>{auth.user?.displayName}</Text><Text style={ui.muted}>{auth.user?.email}</Text><Badge>Versión escolar · Prácticas simuladas</Badge></View>
    {error ? <Notice error>{error}</Notice> : null}{message ? <Notice>{message}</Notice> : null}
    <Card><Text style={ui.heading}>Tus datos</Text><Field label="Nombre para mostrar" value={name} onChangeText={setName} maxLength={80} editable={!busy} /><Button title="Guardar cambios" loading={busy} disabled={!name.trim()} onPress={() => void run(() => auth.update(name), "Tu perfil se actualizó correctamente.")} /><Text style={ui.muted}>Solo recopilamos lo necesario para tu cuenta. No necesitas compartir diagnósticos ni información sensible.</Text></Card>
    <Button title="Cerrar sesión" secondary loading={busy} onPress={() => void run(() => auth.logout())} />
    {!deleting ? <Button title="Eliminar mi cuenta" danger disabled={busy} onPress={() => { setDeleting(true); setError(""); setMessage(""); }} /> : <Card><Text style={ui.heading}>Eliminar cuenta definitivamente</Text><Notice error>Se eliminarán tu cuenta y todas tus conversaciones. Esta acción no se puede deshacer.</Notice><Field label="Contraseña para confirmar eliminación" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="current-password" editable={!busy} /><Button title="Confirmar eliminación de mi cuenta" danger disabled={!password} loading={busy} onPress={() => void run(() => auth.remove(password))} /><Button title="Cancelar" secondary disabled={busy} onPress={() => { setDeleting(false); setPassword(""); }} /></Card>}
    <Text style={[ui.muted, { fontSize: 12 }]}>Verificación de correo y recuperación de contraseña previstas para la Beta final. NeuroTalk no realiza diagnósticos.</Text>
  </Page>;
}
