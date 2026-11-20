# lib — API y sesión del cliente

`api.ts` concentra fetch, errores públicos y autenticación contra EXPO_PUBLIC_API_URL. Timeout HTTP de 30 segundos; no imprime cuerpos o credenciales.

Access token solo en memoria. Web usa refresh en cookie HttpOnly del backend y marcador CSRF; Android usa SecureStore. La renovación coordina solicitudes concurrentes y reintenta una llamada autenticada tras un 401. No guardar credenciales en localStorage/AsyncStorage.

Exporta health, autenticación/perfil, escenarios, creación/lista/detalle de prácticas, mensajes/operaciones, pausa/reanudación/cierre, resultado y borrado. `messages()` recorre todas las páginas para no truncar una conversación. El backend verifica permisos; validación visual no sustituye autorización.

`types.ts` refleja los DTO reales, sin instrucciones internas. `format.ts` centraliza nombres en español, conteo Unicode y formato de tiempo/fechas. Una expiración definitiva de sesión notifica al AuthProvider; una solicitud autenticada solo se renueva/reintenta una vez. No reintentar envíos con un UUID diferente.

`pending.ts` conserva solo en memoria los identificadores/contenidos de envíos inciertos para reintentos. Se limpian al borrar la práctica o cerrar/eliminar/expirar sesión; no se persisten en almacenamiento del navegador.

`http.ts` es transporte puro e inyectable: distingue timeout, desconexión, respuesta inválida y error público del servidor. Rechaza direcciones con credenciales embebidas y nunca muestra HTML/stack recibido. ApiError conserva requestId cuando existe; status 0 o 5xx sigue siendo resultado ambiguo para los reintentos idempotentes. Pruebas en `tests/web.test.ts` sin depender de React Native.

Web local: localhost:3000/api/v1; emulador Android: 10.0.2.2:3000/api/v1. Teléfono físico requiere IP LAN. Ninguna variable EXPO_PUBLIC puede contener secretos de PostgreSQL/JWT/OpenAI.
