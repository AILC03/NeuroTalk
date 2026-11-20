import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, createHttpClient } from "../src/lib/http";
import { parseRoute, serializeRoute } from "../src/navigation/location";
import { validateCredentials, utf8Length } from "../src/features/auth/validation";

test("rutas web preservan pantalla e identificador sin datos personales", () => {
  const id = "12345678-1234-4234-8234-123456789abc";
  for (const name of ["home", "library", "progress", "profile"] as const) assert.deepEqual(parseRoute(serializeRoute({ name })), { name });
  for (const name of ["detail", "configure"] as const) assert.deepEqual(parseRoute(serializeRoute({ name, scenarioId: id })), { name, scenarioId: id });
  for (const name of ["chat", "result"] as const) assert.deepEqual(parseRoute(serializeRoute({ name, id })), { name, id });
});
test("rutas desconocidas y entradas inválidas vuelven a inicio", () => {
  for (const hash of ["", "#/desconocido", "#/practicas/no-es-uuid", "#/escenarios/%3Cscript%3E", "#https://untrusted.test"]) assert.deepEqual(parseRoute(hash), { name: "home" });
});
test("formulario identifica cada campo inválido y cuenta bytes sin registrar la contraseña", () => {
  const invalid = validateCredentials({ name: " ", email: "incorrecto", password: "corta" }, true);
  assert.deepEqual(Object.keys(invalid).sort(), ["email", "name", "password"]);
  assert.equal(utf8Length("á😀"), 6);
  assert.ok(validateCredentials({ name: "Prueba", email: "prueba@example.test", password: "á".repeat(37) }, true).password);
  assert.deepEqual(validateCredentials({ name: "Prueba", email: " prueba@example.test ", password: "Solo-Prueba-2026" }, true), {});
});
test("HTTP web envía cookie/CSRF y Bearer solo si se proporciona", async () => {
  const client = createHttpClient({ baseUrl: "http://localhost:3018/api/v1", web: true, fetchImpl: async (_url, init) => {
    assert.equal(init?.credentials, "include");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("X-CSRF-Token"), "1"); assert.equal(headers.get("Authorization"), "Bearer token-ficticio");
    assert.equal(init?.body, JSON.stringify({ name: "Prueba" }));
    return Response.json({ ok: true });
  } });
  assert.deepEqual(await client("/resource", "POST", { name: "Prueba" }, "token-ficticio"), { ok: true });
});
test("HTTP distingue respuesta vacía válida, HTML inesperado y error público", async () => {
  const noContent = createHttpClient({ baseUrl: "http://localhost:3018", web: true, fetchImpl: async () => new Response(null, { status: 204 }) });
  assert.equal(await noContent("/delete"), undefined);
  const invalid = createHttpClient({ baseUrl: "http://localhost:3018", web: true, fetchImpl: async () => new Response("<html>internal-details</html>") });
  await assert.rejects(invalid("/resource"), (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE" && !error.message.includes("internal-details"));
  const rejected = createHttpClient({ baseUrl: "http://localhost:3018", web: true, fetchImpl: async () => Response.json({ error: { message: "Práctica pausada.", code: "PRACTICE_PAUSED" } }, { status: 409, headers: { "X-Request-Id": "test-id" } }) });
  await assert.rejects(rejected("/resource"), { status: 409, code: "PRACTICE_PAUSED", requestId: "test-id" });
});
test("HTTP informa conexión/configuración inválida sin revelar URL ni credenciales", async () => {
  const offline = createHttpClient({ baseUrl: "http://localhost:3018", web: true, fetchImpl: async () => { throw new TypeError("private-details"); } });
  await assert.rejects(offline("/resource"), (error: unknown) => error instanceof ApiError && error.code === "NETWORK_ERROR" && !error.message.includes("private-details"));
  const invalid = createHttpClient({ baseUrl: "https://user:secret@example.test", web: true, fetchImpl: async () => { throw new Error("No debe llamarse"); } });
  await assert.rejects(invalid("/resource"), { code: "INVALID_API_URL" });
});
test("HTTP detecta timeout y conserva un error recuperable para idempotencia", async () => {
  const client = createHttpClient({ baseUrl: "http://localhost:3018", web: true, timeoutMs: 5, fetchImpl: async (_url, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  }) });
  await assert.rejects(client("/resource"), { code: "REQUEST_TIMEOUT", status: 0 });
});
