# hooks — carga de recursos

`useRemote.ts` carga un recurso asíncrono y expone data/error/loading/reload. Sus dependencias identifican el recurso. Un contador de generación evita que una respuesta vieja sobrescriba la nueva; al desmontar se ignoran resultados pendientes.

No inventa datos cuando falla la red. Cada pantalla decide cómo mostrar reintento y mantener los datos previamente confirmados. La autenticación y renovación están en `features/auth` y `lib/api`, no en este hook.

El chat hace polling controlado mientras está activo/finalizando o espera una respuesta. La carga no reinicia la inactividad conversacional del backend.
