import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";

const api = "http://localhost:3018/api/v1";
const password = "Solo-E2E-Web-2026"; // Cuenta ficticia, nunca usar esta contraseña fuera de pruebas.
async function registerAndLogin(page: Page, email: string, enter = false) {
  await page.goto("/");
  await page.getByRole("button", { name: "¿No tienes cuenta? Regístrate", exact: true }).click();
  await page.getByRole("textbox", { name: "Nombre para mostrar", exact: true }).fill("Usuario Web");
  await page.getByRole("textbox", { name: "Correo electrónico", exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await expect(page.getByText(/Cuenta creada/)).toBeVisible();
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  if (enter) await page.getByLabel("Contraseña", { exact: true }).press("Enter");
  else await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Hola, Usuario" })).toBeVisible();
}
async function cleanup(request: APIRequestContext, email: string) {
  const response = await request.post(`${api}/auth/login`, { headers: { Origin: "http://localhost:8088", "X-CSRF-Token": "1" }, data: { email, password, platform: "web" } });
  if (response.status() === 401) return; // Cuenta eliminada desde la propia interfaz o registro que no llegó a completarse.
  expect(response.ok()).toBeTruthy();
  const credentials = await response.json();
  const removed = await request.delete(`${api}/users/me`, { headers: { Authorization: `Bearer ${credentials.accessToken}` }, data: { password } });
  expect(removed.status()).toBe(204);
}

test("escritorio: recorrido completo, Atrás/Adelante, recarga, borrado y cuenta", async ({ page, request }, testInfo) => {
  const email = `web-e2e-${randomUUID()}@example.test`;
  try {
    await registerAndLogin(page, email);
    await expect(page.getByRole("button", { name: "Ver Entrevista de trabajo", exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("inicio-escritorio.png") });
    await page.getByRole("button", { name: "Ver Entrevista de trabajo", exact: true }).click();
    await page.getByRole("button", { name: "Configurar práctica", exact: true }).click();
    await expect(page).toHaveURL(/\/configurar$/);
    await page.goBack();
    await expect(page.getByRole("button", { name: "Configurar práctica", exact: true })).toBeVisible();
    await page.goForward();
    await page.getByRole("radio", { name: "Dificultad Fácil", exact: true }).click();
    await expect(page.getByRole("radio", { name: "Dificultad Fácil", exact: true })).toBeChecked();
    await page.getByRole("button", { name: "Personalizar contexto (opcional)", exact: true }).click();
    await page.getByRole("textbox", { name: "Puesto al que aspiras", exact: true }).fill("Desarrollador de prueba");
    await page.getByRole("button", { name: "Iniciar práctica", exact: true }).click();
    await expect(page.getByText(/Contexto de la práctica:.*Desarrollador de prueba/)).toBeVisible();
    const text = "Este es un ejemplo ficticio de colaboración escolar para la prueba web.";
    await page.getByRole("textbox", { name: "Escribe tu respuesta", exact: true }).fill(text);
    await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
    await expect(page.getByText(text, { exact: true })).toBeVisible();
    await expect(page.getByText(/Qué te interesa de este puesto/)).toBeVisible();
    await page.getByRole("button", { name: "Pausar práctica", exact: true }).click();
    await expect(page.getByRole("button", { name: "Reanudar práctica", exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(text, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reanudar práctica", exact: true }).click();
    await page.getByRole("button", { name: "Finalizar práctica", exact: true }).click();
    await page.getByRole("button", { name: "Ver resultado de la práctica", exact: true }).click();
    await expect(page.getByRole("heading", { name: "¡Terminaste tu práctica!" })).toBeVisible();
    await expect(page.getByText(/La retroalimentación con inteligencia artificial estará disponible/)).toBeVisible();
    await page.getByRole("tab", { name: "Progreso", exact: true }).click();
    await page.getByRole("tab", { name: "Ver historial", exact: true }).click();
    await page.getByRole("button", { name: "Eliminar práctica Entrevista de trabajo", exact: true }).click();
    await page.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Ver resultado de Entrevista de trabajo", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Eliminar práctica Entrevista de trabajo", exact: true }).click();
    await page.getByRole("button", { name: "Confirmar eliminación", exact: true }).click();
    await expect(page.getByText("Aún no tienes prácticas finalizadas")).toBeVisible();
    await page.getByRole("tab", { name: "Ver progreso", exact: true }).click();
    await expect(page.getByText("Cada práctica es un comienzo")).toBeVisible();
    await page.getByRole("tab", { name: "Perfil", exact: true }).click();
    await page.getByRole("button", { name: "Eliminar mi cuenta", exact: true }).click();
    await page.getByLabel("Contraseña para confirmar eliminación", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Confirmar eliminación de mi cuenta", exact: true }).click();
    await expect(page.getByRole("button", { name: "Iniciar sesión", exact: true })).toBeVisible();
  } finally { await cleanup(request, email); }
});

test("web estrecha: formulario, teclado, búsqueda, desconexión y perfil sin desbordamiento", async ({ page, request }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 }); // Navegador estrecho, NO prueba Android.
  const email = `web-e2e-${randomUUID()}@example.test`;
  try {
    await page.goto("/");
    await page.getByRole("textbox", { name: "Correo electrónico", exact: true }).fill("correo-invalido");
    await page.getByLabel("Contraseña", { exact: true }).fill("prueba");
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await expect(page.getByText(/Escribe un correo válido/)).toBeVisible();
    await registerAndLogin(page, email, true);
    const fits = () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(await fits()).toBeTruthy();
    await page.route("**/api/v1/scenarios", (route) => route.abort());
    await page.getByRole("tab", { name: "Practicar", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("No se pudo conectar");
    await page.unroute("**/api/v1/scenarios");
    await page.getByRole("button", { name: "Reintentar", exact: true }).click();
    await page.getByRole("textbox", { name: "Buscar escenarios", exact: true }).fill("no-existe-escenario");
    await expect(page.getByText("No encontramos ese escenario")).toBeVisible();
    expect(await fits()).toBeTruthy();
    await page.getByRole("button", { name: "Ver todas las categorías", exact: true }).click();
    await page.getByRole("button", { name: "Ver escenarios de categoría Laboral", exact: true }).click();
    await page.getByRole("button", { name: "Ver escenario Entrevista de trabajo", exact: true }).click();
    await page.getByRole("button", { name: "Configurar práctica", exact: true }).click();
    await page.getByRole("button", { name: "Iniciar práctica", exact: true }).click();
    await page.getByRole("textbox", { name: "Escribe tu respuesta", exact: true }).fill("Mensaje ficticio para revisar el chat en una ventana estrecha.");
    await page.getByRole("button", { name: "Enviar mensaje", exact: true }).click();
    await expect(page.getByText(/Qué te interesa de este puesto/)).toBeVisible();
    expect(await fits()).toBeTruthy();
    const composer = await page.getByRole("textbox", { name: "Escribe tu respuesta", exact: true }).boundingBox();
    expect(composer).not.toBeNull();
    expect(composer!.y + composer!.height).toBeLessThanOrEqual(844);
    await expect.poll(() => page.getByTestId("chat-messages").evaluate((element) => Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 3)).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath("chat-web-390.png") });
    await page.getByRole("button", { name: "Pausar y volver al inicio", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retomar Entrevista de trabajo", exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Perfil", exact: true }).click();
    await page.getByRole("textbox", { name: "Nombre para mostrar", exact: true }).fill("Nombre actualizado");
    await page.getByRole("button", { name: "Guardar cambios", exact: true }).click();
    await expect(page.getByText("Tu perfil se actualizó correctamente.")).toBeVisible();
    await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
    await expect(page.getByRole("button", { name: "Iniciar sesión", exact: true })).toBeVisible();
    await page.goto("/#/perfil");
    await expect(page.getByRole("button", { name: "Iniciar sesión", exact: true })).toBeVisible();
  } finally { await cleanup(request, email); }
});
