# NeuroTalk App

Cliente React Native + Expo SDK 58 + TypeScript. **Entrega del Avance 2: web; desarrollo y pruebas móviles pospuestos por decisión del responsable. No iniciar emuladores para esta etapa.** Recorrido: registro/login → inicio → biblioteca → detalle → configuración → chat simulado → resultado. Incluye prácticas pendientes, pausa/reanudación, historial, actividad descriptiva y perfil/borrado.

Este directorio ya es un repositorio Git local independiente (`main`), sin commits ni remoto. La documentación principal está en el repositorio hermano `neurotalk-api/docs`; al publicar repositorios separados, sustituir esta referencia por el enlace al remoto correspondiente.

Referencia visual: [mockups de Figma](https://www.figma.com/design/P7wjpTYJINhpmZRa1KscxP/Untitled?node-id=0-1), revisados en navegador. Se conservan verde/crema, tarjetas y jerarquía móvil; en escritorio se adapta a navegación lateral. No se afirma coincidencia pixel-perfect ni se copian cifras/feedback de ejemplo como datos reales.

- [Mapa de carpetas](src/README.md)
- [Registro de desarrollo y comprobaciones](docs/registro-desarrollo.md)
- [Manual de usuario y guía para probar el prototipo](docs/manual-usuario.md)
- [Revisión de seguridad de dependencias](docs/seguridad-dependencias.md)
- [Preparación y criterios del Avance 2 web](docs/avance-2-web.md)

## Ejecutar

```powershell
npm ci
# Revisar .env.example: EXPO_PUBLIC_API_URL apunta al backend, nunca a PostgreSQL.
npm run web
```

Web usa localhost y CLIENT_ORIGINS debe coincidir con el puerto de Expo. Ver `neurotalk-api/docs/desarrollo-local.md` para autenticación y cookies. El código compartido para móvil se conserva para una etapa futura, sin validación ni instalación nativa aprobada.

Comprobaciones: typecheck, pruebas unitarias y E2E web aisladas sobre PostgreSQL, y exportación web (ver registro). Las pruebas de navegador a 390 px **no son pruebas Android**. La auditoría bajó de 22 a **15 alertas altas**, pendientes antes de publicar: braces y node-forge aún no tienen parche npm publicado según la revisión. Ver el informe; no se aplicaron degradaciones forzadas del SDK.

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run build:web
```

## Pantallas del Avance 2

- Registro e inicio de sesión.
- Inicio y perfil básico, cerrar sesión/eliminar cuenta.
- Biblioteca y detalle de escenarios; búsqueda.
- Configuración de dificultad y contexto opcional.
- Lista mínima de hasta cinco prácticas pendientes.
- Chat con modo simulado visible, estado de envío/reintento y aviso desde el mensaje 25.
- Pausa, reanudación y resultado básico, sin retroalimentación inventada.
- Confirmaciones de borrado y estados vacíos/carga/error.

El historial y los indicadores iniciales usan datos guardados: se recorren todas las páginas de prácticas finalizadas, no se estiman totales desde una sola página. La agregación actual vive en cliente; un endpoint estadístico escalable, correo y feedback personalizado siguen pendientes. Nunca se muestran porcentajes de supuesta mejora comunicativa.

## Integración prevista

- API REST `/api/v1` de Express en Render.
- Web exportada desde Expo a Vercel; Android mediante Expo en desarrollo y distribución de prueba por definir.
- Access token en memoria; refresh seguro según plataforma (ver ADR de autenticación en backend).
- Solo URL pública de backend en configuración cliente. Nunca DATABASE_URL, JWT secrets ni OPENAI_API_KEY.
- IDs de idempotencia conservados al reintentar; servidor autoritativo para límites/tiempo/estado.
- No asumir que cerrar una app notifica al servidor ni que un fallo HTTP significa que el mensaje no fue guardado.

## Despliegue web en Vercel

Vercel debe construir el proyecto como sitio estático:

- Framework preset: **Other**
- Build command: `npm run build:web`
- Output directory: `dist`
- Install command: `npm ci`

La configuración `vercel.json` fija esas opciones y evita un despliegue como aplicación Node o archivo binario.

En **Environment Variables** define:

```text
EXPO_PUBLIC_API_URL=https://TU-BACKEND.onrender.com/api/v1
```

Redespliega después de cambiar la URL. Esta variable es pública y debe apuntar al backend; nunca contenga `DATABASE_URL`, `JWT_ACCESS_SECRET` ni otra credencial.

## Estructura actual

```text
App.tsx               composición y navegación interna
src/navigation/       rutas tipadas
src/features/         auth, home, scenarios, practices, progress, profile
src/components/       controles accesibles reutilizables
src/lib/              HTTP, autenticación y configuración
src/theme/            estilos derivados de Figma
src/hooks/            carga de recursos
tests/                lógica pura de actividad y formato
```

Cada carpeta de código propio en src tiene README. Las pantallas usan rutas hash (`#/inicio`, `#/practicar`, `#/practicas/<id>`); Atrás/Adelante y recarga conservan la ruta con sesión válida. No hay datos personales ni tokens en esas direcciones. Cerrar una pestaña no garantiza pausa inmediata; el backend aplica inactividad a 15 minutos. La interfaz identifica explícitamente respuestas simuladas y feedback no disponible.
