# scenarios — selección y configuración

- `LibraryScreen.tsx`: categorías y búsqueda local sobre los nueve escenarios públicos consultados. Nunca usa guiones internos.
- `DetailScreen.tsx`: personaje, objetivo y duración estimada (no temporizador obligatorio).
- `ConfigureScreen.tsx`: dificultades fácil/medio/difícil, contexto opcional y creación real.
- `ScenarioRoute.tsx`: resuelve el ID de la URL web contra el backend; muestra carga, error y reintento sin confiar en datos guardados en la dirección.

Los campos opcionales vienen del backend; omitirlos conserva el contexto ficticio. Si una creación tiene resultado HTTP ambiguo, se conserva UUID/configuración y se bloquea su edición hasta reintentar, evitando sesiones duplicadas.

Al alcanzar cinco pendientes se ofrece volver a Inicio, sin borrar prácticas de forma silenciosa. Crear otra desde una nueva visita es una nueva acción; no hay borrador persistente de configuración entre recargas.
