export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly code: string, public readonly requestId?: string) { super(message); }
}

export function createHttpClient(options: { baseUrl: string; web: boolean; fetchImpl?: typeof fetch; timeoutMs?: number }) {
  const base = options.baseUrl.replace(/\/$/, "");
  let valid = false;
  try { const url = new URL(base); valid = ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && !url.search && !url.hash; } catch { /* Error público sin revelar configuración. */ }
  const transport = options.fetchImpl ?? fetch;
  return async function request<T>(path: string, method = "GET", body?: unknown, accessToken?: string): Promise<T> {
    if (!valid) throw new ApiError("La dirección del servicio no está configurada correctamente. Solicita ayuda al responsable.", 503, "INVALID_API_URL");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 30_000);
    try {
      const response = await transport(`${base}${path}`, {
        method, credentials: options.web ? "include" : "omit", signal: controller.signal,
        headers: { "Content-Type": "application/json", ...(options.web ? { "X-CSRF-Token": "1" } : {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (response.status === 204) return undefined as T;
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload?.error?.message === "string" ? payload.error.message : "No se pudo completar la solicitud. Intenta nuevamente.";
        const code = typeof payload?.error?.code === "string" ? payload.error.code : "REQUEST_FAILED";
        throw new ApiError(message, response.status, code, response.headers.get("X-Request-Id") ?? undefined);
      }
      if (payload === null || typeof payload !== "object") throw new ApiError("El servicio devolvió una respuesta no válida. Intenta nuevamente.", 502, "INVALID_RESPONSE");
      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (controller.signal.aborted) throw new ApiError("El servidor tardó demasiado en responder. Revisa la conexión e intenta nuevamente.", 0, "REQUEST_TIMEOUT");
      throw new ApiError("No se pudo conectar con NeuroTalk. Revisa la red y que el servicio esté encendido.", 0, "NETWORK_ERROR");
    } finally { clearTimeout(timeout); }
  };
}
