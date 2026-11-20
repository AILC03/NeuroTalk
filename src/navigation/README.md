# navigation — rutas internas

`types.ts` define rutas tipadas de inicio, biblioteca, detalle, configuración, chat, resultado, progreso y perfil. `location.ts` convierte entre rutas y hash del navegador, y valida IDs/estructuras. `useWebRoute.ts` sincroniza React con Atrás/Adelante y asigna el título de la pestaña. `App.tsx` compone pantallas; `components/Shell.tsx` representa las pestañas.

La entrega actual es web. Se conservan las bases compartidas, pero no se ejecutan pruebas nativas. La navegación identifica escenario/práctica por ID real, no por índice. Con sesión válida, recargar restaura la ruta y consulta los datos al servidor; no restaura un texto aún no enviado.

Rutas: `#/inicio`, `#/practicar`, `#/escenarios/<uuid>`, `#/escenarios/<uuid>/configurar`, `#/practicas/<uuid>`, `#/practicas/<uuid>/resultado`, `#/progreso`, `#/perfil`. No se guardan nombres, correos, contexto, contraseñas o tokens en la URL. Rutas inválidas vuelven a Inicio; los recursos ajenos/inexistentes siguen rechazándose por el backend.

El botón de salida del chat espera su pausa; Atrás/Adelante del navegador intenta pausarlo en segundo plano. El umbral de inactividad respalda una notificación fallida. Logout/borrado de cuenta reemplaza la ruta por Inicio. `tests/web.test.ts` verifica serialización/entradas inválidas y E2E verifica Atrás/Adelante y recarga con datos reales de prueba.
