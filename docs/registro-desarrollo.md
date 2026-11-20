# Registro de desarrollo del cliente

## 2026-10-18 — Avance 2 exclusivamente web

Ángel pospuso desarrollo/pruebas móviles por el congelamiento del equipo con Android Studio. No se vuelve a iniciar emulador ni herramientas nativas; se conserva la base compartida para después. Esta decisión reemplaza el objetivo de continuar la revisión Android descrito más abajo.

Se pulió navegación web con hash, Atrás/Adelante, recarga y título de pestaña; consulta de escenarios desde URL; formularios con error por campo y validación consistente con Enter; transporte HTTP inyectable y mensajes seguros para conexión, timeout y respuesta inválida.

**Comprobaciones ejecutadas:** typecheck de ambos repositorios, 14 pruebas unitarias frontend y dos E2E web sobre PostgreSQL aislado aprobadas. Las E2E usan Edge headless con un solo worker, a 1366×900 y 390×844, y no ejecutan Android. Incluyen conversación, pausa/recarga/cierre, historial/borrado, formulario/teclado, recuperación de desconexión y comprobación de desbordamiento/compositor en web estrecha. Los servidores 8088/3018 y cuentas ficticias se administran solo durante la prueba; no se aplican migraciones ni se modifica `.env`.

Ver `avance-2-web.md` para arranque, criterios y guion de presentación. La publicación pública sigue bloqueada por las 15 alertas altas documentadas; la validación funcional no las resuelve.

## Revisión posterior — seguridad y Android

Expo actualizado a 58.0.14; TypeScript alineado con la recomendación SDK (~6.0.3) y override acotado xcode/uuid 11.1.1 con prueba de regresión. La auditoría disminuyó de 22 a 15 alertas (cero moderadas); las restantes no están resueltas ni se autoriza publicación. Detalles y fuentes en `seguridad-dependencias.md`. Esta entrada actualiza el estado de auditoría de las notas históricas siguientes.

Se inició un emulador Pixel_10a (Android 17/API 37) con Expo Go 58.0.4. Metro inicialmente escuchaba solo en ::1 y Expo Go intentaba IPv4; el arranque con `--dns-result-order=ipv4first` permite cargar la interfaz por adb reverse. El recorrido de autenticación/chat aún debe completarse y registrarse antes de afirmar que Android está validado.

## 2026-10-16 — Interfaz basada en Figma y conexión con backend

### Referencia

Archivo compartido por el responsable: `P7wjpTYJINhpmZRa1KscxP`, página raíz `0-1`. La descarga HTTP directa respondió 403, pero el archivo sí pudo revisarse visualmente en el navegador. No se editaron los mockups ni se importaron datos de su cuenta.

La implementación conserva fondo crema, superficies blancas, verde, tarjetas redondeadas, iconos de trazo y colores por categoría. Se añade una adaptación de escritorio con barra lateral; no se inserta una imagen de teléfono ni una barra de hora ficticia.

### Desarrollo

- App separada por features, navegación tipada, componentes, tema, hooks y contrato REST.
- Inicio con nombre y prácticas reales; biblioteca por categoría y buscador; detalle y contexto opcional.
- Configuración de dificultad y creación con UUID idempotente. Errores ambiguos conservan configuración/UUID para reintentar.
- Chat conectado: mensajes ordenados, carga de todas las páginas, envío de hasta 2,000 puntos Unicode, aviso desde 25, pausa/reanudación, cierre y recuperación de respuestas fallidas.
- Polling controlado, pausa al salir cuando es notificable e intento de pausa al cambiar visibilidad/AppState. Se mantiene el fallback de inactividad del servidor.
- Resultado con duración/conteos y aviso de feedback futuro. No se inventan fortalezas.
- Historial de prácticas finalizadas y actividad descriptiva: se cargan todas las páginas, se separa el proveedor simulado, se excluyen sesiones sin participación y se usa zona horaria del perfil.
- Borrado confirmado de prácticas/cuenta y edición de nombre. Una sesión expirada vuelve al acceso.
- Envios inciertos solo en memoria; se limpian al borrar su práctica o cerrar/eliminar sesión.
- README en cada carpeta propia de src y convenciones persistidas en AGENTS.md.

### Comprobaciones

- `npm run typecheck`: comprobación de tipos del cliente y tests.
- `npm test`: seis pruebas puras para vacíos, elegibilidad, semana/zona, empates/borrado, Unicode y limpieza de memoria de sesión.
- `npm run build:web`: exportación estática para el despliegue futuro, sin publicar nada.
- Navegador de escritorio con cuenta/conversación ficticias, API aislada en puerto 3014 sobre TEST_DATABASE_URL y web en 8084: registro, login, creación, envío/respuesta, pausa/reanudación, cierre y consulta de resultado comprobados. Los campos secretos reales de `.env` nunca se mostraron.
- La API normal para el usuario sigue configurada por EXPO_PUBLIC_API_URL o localhost:3000; no se reescribió `.env` para apuntarla a los puertos de revisión.
- También se comprobó en navegador: indicadores sobre la sesión terminada, historial, confirmación de borrado de esa práctica y estado vacío posterior; recuperación de sesión al recargar; eliminación confirmada de la cuenta ficticia al terminar la revisión.
- Evidencias de acceso/chat/progreso en `evidencias/`. Los números de esas capturas corresponden a la prueba prolongada, no a un conjunto de estadísticas inventadas.
- Imports de iconos limitados a rutas públicas individuales de Lucide: la exportación pasó de unos 2.8 MB a unos 578 KB de JavaScript sin incorporar su catálogo completo.

No confundir estas pruebas manuales de navegador con una suite E2E automatizada ni con ejecución nativa Android. Los seis tests puros no verifican por sí solos componentes React o almacenamiento SecureStore.

### Pendientes y límites

- Probar instalación y recorrido en Android compatible con SDK 58, teclado, lector de pantalla y tamaños pequeños reales.
- Navegación web por URL/deep links; actualmente la recarga vuelve a Inicio y las prácticas se retoman desde allí.
- Endpoint estadístico en backend si crece el historial: la agregación provisional carga todas las páginas en cliente y no es adecuada para historiales masivos.
- Verificación/reset de correo, textos/consentimientos definitivos y OpenAI solo al final con presupuesto aprobado.
- Cookies entre dominios Render/Vercel y despliegue todavía no probados.
- Auditoría Expo/Metro: 22 alertas (15 altas, siete moderadas), sin ocultarlas ni degradar el SDK a una versión mayor incompatible. Resolver/revisar correcciones antes de publicar.

Actualizar este registro con resultados realmente ejecutados y el README de la carpeta al completar cada funcionalidad.

## Manual de usuario para la revisión local

Se añadió `manual-usuario.md`: acceso, datos ficticios, recorrido de pantallas, resultados esperados, límites, recuperación, borrado con advertencias, lista de comprobación y anexo de arranque. Distingue el entorno habitual 8081/3000 de la revisión aislada 8084/3014 y no incluye credenciales reales. Las casillas de la guía son para que las complete quien la use, no evidencias de nuevas pruebas ejecutadas.
