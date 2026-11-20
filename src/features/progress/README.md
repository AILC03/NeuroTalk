# progress — historial y actividad descriptiva

- `ProgressScreen.tsx`: carga **todas las páginas** de prácticas finalizadas y alterna progreso/historial. Permite consultar y eliminar, con confirmación.
- `activity.ts`: función pura que deriva conteos, duración, semana lunes–domingo, distribución de categorías y escenario frecuente.

Solo sesiones SIMULATED, COMPLETED y con al menos un mensaje USER alimentan indicadores. Se utiliza la zona horaria IANA del perfil; el tiempo de cada sesión se atribuye a su fecha de cierre. Un empate del escenario más usado se informa como tal. Porcentajes redondeados; cero datos produce ceros, no cifras ilustrativas.

No son calificaciones ni evidencia de mejora comunicativa. Esta agregación inicial se hace en cliente, sin endpoint estadístico nuevo; con historiales grandes debe migrarse al backend. Los registros borrados se excluyen al recargar. El historial también permite consultar prácticas finalizadas sin participación aunque no sumen a indicadores.

Pruebas puras en `tests/activity.test.ts`: vacíos, elegibilidad, zona horaria/semana, empates/borrado y formato Unicode.
