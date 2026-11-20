import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { api } from "../../lib/api";
import { Brand, Button, Card, Field, Notice, Page, ui } from "../../components/ui";
import { colors } from "../../theme/tokens";
import { useAuth } from "./AuthProvider";
import { validateCredentials, type CredentialErrors } from "./validation";

export function AuthScreen() {
  const auth = useAuth();
  const [register, setRegister] = useState(false);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const [fields, setFields] = useState<CredentialErrors>({}); const submitting = useRef(false);
  async function submit() {
    if (submitting.current) return;
    const invalid = validateCredentials({ name, email, password }, register);
    setFields(invalid); setError("");
    if (Object.keys(invalid).length) return;
    submitting.current = true;
    setBusy(true); setError(""); setMessage("");
    try {
      if (register) {
        await api.register(name, email, password); setRegister(false);
        setMessage("Cuenta creada. Ya puedes iniciar sesión. La verificación de correo estará disponible en la Beta final.");
      } else await auth.login(email, password);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo iniciar sesión."); }
    finally { submitting.current = false; setBusy(false); setPassword(""); }
  }
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><Page>
    <View style={{ width: "100%", maxWidth: 440, alignSelf: "center", flex: 1, gap: 28, paddingVertical: 14 }}>
      <Brand />
      <View style={{ flex: 1, minHeight: 48 }} />
      <Card style={{ padding: 28, borderRadius: 30, gap: 22 }}>
        <View style={{ gap: 10, alignItems: "center" }}><Text accessibilityRole="header" style={[ui.title, { color: colors.green, textAlign: "center", fontStyle: "italic" }]}>{register ? "Tu espacio para\npracticar comienza aquí." : "Bienvenido a\nNeuroTalk."}</Text><Text style={[ui.muted, { textAlign: "center" }]}>Practica tu comunicación con confianza.</Text></View>
        {auth.notice && !message ? <Notice>{auth.notice}</Notice> : null}
        {message ? <Notice>{message}</Notice> : null}{error ? <Notice error>{error}</Notice> : null}
        {register ? <Field label="Nombre para mostrar" placeholder="¿Cómo quieres que te llamemos?" value={name} onChangeText={setName} maxLength={80} editable={!busy} autoComplete="name" error={fields.name} /> : null}
        <Field label="Correo electrónico" placeholder="Ingresa tu correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" editable={!busy} error={fields.email} />
        <Field label="Contraseña" placeholder="Ingresa tu contraseña" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" editable={!busy} autoComplete={register ? "new-password" : "current-password"} onSubmitEditing={() => { if (!busy && email.trim() && password) void submit(); }}
          error={fields.password} hint={register ? "Mínimo 12 caracteres; máximo 72 bytes. Usa una contraseña exclusiva para las pruebas." : undefined} />
        <Button title={register ? "Crear cuenta" : "Iniciar sesión"} loading={busy} disabled={!email.trim() || !password || (register && !name.trim())} arrow onPress={() => void submit()} />
        <Button title={register ? "Ya tengo cuenta" : "¿No tienes cuenta? Regístrate"} secondary disabled={busy} onPress={() => { setRegister(!register); setPassword(""); setError(""); setMessage(""); setFields({}); }} />
      </Card>
      <View style={{ flex: 1, minHeight: 24 }} /><Text style={[ui.muted, { fontSize: 12, textAlign: "center" }]}>Un espacio de práctica, sin diagnósticos. Para mayores de 18 años.</Text>
    </View>
  </Page></KeyboardAvoidingView>;
}
