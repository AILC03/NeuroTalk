# Avance 2 — preparación de la versión web

## Alcance vigente

Por decisión de Ángel del 18 de octubre de 2026, la demostración del Avance 2 se concentra en **web**. Android Studio/emulador congelaron el equipo: el desarrollo y la validación móviles quedan pendientes y no deben reiniciarse sin autorización nueva.

Se conserva Expo/React Native para no descartar la base compartida. Una ventana web estrecha no se presenta como una aplicación móvil probada ni como una APK lista.

## Mejoras de esta revisión

- Rutas hash por pantalla, con títulos de pestaña, Atrás/Adelante y recarga sobre la pantalla actual con sesión válida.
- Escenarios resueltos por ID consultando la API; errores/reintentos si el recurso dejó de estar disponible.
- Formularios con mensajes por campo, validación de correo/contraseña y asociaciones accesibles de error/ayuda.
- Mismo flujo de validación al pulsar el botón o Enter; protección frente a envíos repetidos.
- Transporte HTTP probado por separado: red caída, timeout, dirección inválida, errores del servidor y respuestas no JSON. Nunca mostrar HTML interno o credenciales.
- Suite E2E con navegador Edge headless instalado, un solo worker y dos tamaños web: 1366×900 y 390×844. Sin procesos Android.

## Cómo ejecutar la demostración normal

Mantén PostgreSQL en ejecución y conserva la configuración local existente. En dos terminales distintas:

```powershell
# Terminal 1
Set-Location "C:\Users\angel\OneDrive\Documentos\NeuroTalk\neurotalk-api"
npm run dev
```

```powershell
# Terminal 2
Set-Location "C:\Users\angel\OneDrive\Documentos\NeuroTalk\neurotalk-app"
npm run web -- --port 8081
```

Frontend: http://localhost:8081. API: http://localhost:3000/api/v1. Si cambiaste variables, verifica EXPO_PUBLIC_API_URL y CLIENT_ORIGINS sin publicar `.env`. No necesitas Expo Go, Android Studio, cámara, micrófono ni clave OpenAI.

## Validación antes de la entrega

Desde frontend:

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run build:web
npm audit
```

Desde backend:

```powershell
npm run typecheck
npm test
npm run build
```

E2E requiere dependencias/cliente Prisma y migraciones ya preparadas en TEST_DATABASE_URL **local y separada**. Inicia automáticamente una API de prueba en 3018 y Expo web en 8088, con secreto JWT temporal, y detiene solo sus propios servidores al terminar. Si un puerto está ocupado, falla sin detener procesos ajenos. No cambia `.env`, no resetea bases ni aplica migraciones. Limpia únicamente sus cuentas ficticias vía API.

## Qué comprueban los casos E2E

| Caso | Comprobaciones |
| --- | --- |
| Escritorio | Registro/login, detalle/configuración, Atrás/Adelante, dificultad/contexto, chat, pausa, recarga, cierre, resultado, historial, cancelar/confirmar borrado y eliminación de cuenta |
| Navegador estrecho | Error por campo, Enter para acceso, recuperación de desconexión simulada, búsqueda vacía, chat/compositor sin desbordamiento horizontal, pausa al salir, perfil, logout y rechazo de pantalla privada sin sesión |

Las capturas de prueba usan datos ficticios. Traces y video están desactivados para no guardar headers/cookies. Resultados y capturas temporales están excluidos de Git.

### Resultado de la revisión del 18 de octubre

- Frontend: 14 pruebas unitarias y dos E2E aprobadas, sin fallos.
- Backend: 33 pruebas aprobadas sobre PostgreSQL local de pruebas.
- Typecheck de ambos repositorios y compilaciones backend/web correctos; dependencias compatibles con Expo según su comprobador.
- README presente en todas las carpetas de código propio de src y enlaces locales de documentación comprobados.
- Los puertos temporales E2E quedan libres al terminar. No se inició Android Studio ni emulador en esta revisión.
- Auditoría frontend aún con 15 alertas altas; no confundir éxito de pruebas con seguridad de publicación aprobada.

## Guion sugerido para el profesor

1. Crear una cuenta ficticia e iniciar sesión.
2. Mostrar biblioteca y buscar Entrevista de trabajo.
3. Elegir dificultad y personalizar el contexto con información inventada.
4. Enviar tres mensajes y mostrar que son respuestas simuladas.
5. Pausar, recargar y reanudar conservando mensajes.
6. Finalizar y mostrar métricas, sin feedback inventado.
7. Abrir historial/progreso y explicar que describen actividad, no capacidad comunicativa.
8. Cambiar el nombre y cerrar sesión. Dejar borrados para el final si deseas conservar evidencias.

Guía detallada: [manual de usuario](manual-usuario.md).

## Bloqueos para una publicación pública

Las **15 alertas altas** pendientes de braces/node-forge no están corregidas ni se ocultan. Pasar pruebas funcionales o exportar web no equivale a tener autorización de publicación. Ver [seguridad de dependencias](seguridad-dependencias.md).

También quedan despliegue y cookies entre dominios, textos legales/consentimientos, correo de verificación/recuperación, endpoint estadístico escalable y futura IA con presupuesto explícito. Para el Avance 2 se demuestra localmente con datos ficticios y sin consumo OpenAI.
