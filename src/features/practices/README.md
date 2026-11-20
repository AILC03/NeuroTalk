# practices — chat, tarjetas y resultado

- `PracticeCard.tsx`: tarjeta accesible para retomar/consultar y eliminar con confirmación en la pantalla padre.
- `ChatScreen.tsx`: mensajes persistidos por secuencia, envío, recuperación/reintento, pausa/reanudación/cierre y consulta de operación.
- `ResultScreen.tsx`: duración/conteos reales y aviso de feedback futuro. No reproduce las fortalezas ilustrativas del mockup como análisis real.

## Integridad

Cada envío usa UUID generado una vez con expo-crypto. Si hay timeout/error ambiguo, el reintento reutiliza el UUID y contenido. Mientras esté incierto, no se edita el mensaje. Al recargar mensajes, si el servidor ya lo confirmó se elimina la incertidumbre local. No se reenvía automáticamente tras recargar el navegador.

Se consulta cada cuatro segundos solo cuando hace falta. El backend controla límites, inactividad y tiempos; los GET no cuentan como actividad conversacional. Contador de 2,000 puntos Unicode y aviso desde el mensaje 25. El mensaje 30 cierra en servidor.

Atrás/pausar notifica al backend; cambio de visibilidad/AppState intenta pausar. No se promete notificación garantizada al cerrar inesperadamente: el servidor aplica el umbral de 15 minutos. Al finalizar se ofrece resultado, y al consultar conversación finalizada no se permite escribir.

No WebSockets, streaming, audio ni IA real. Los estados de envío se reflejan en controles deshabilitados y errores/reintentos. Validación Android en dispositivo y escenarios de red móvil siguen pendientes.
