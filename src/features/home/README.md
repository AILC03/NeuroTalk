# home — inicio

`HomeScreen.tsx` consulta catálogo, hasta cinco prácticas pendientes y las tres finalizadas más recientes. Muestra saludo/fecha, acceso a perfil, escenarios y acciones para retomar o borrar (con confirmación).

No usa el +18% ni las 12 sesiones ilustrativas de Figma. El contador pendiente proviene del backend. Una práctica pausada se reanuda antes de abrir; una finalizada muestra resultado. El padre vuelve a comprobar el estado para evitar confiar en datos viejos.

El borrado es real y libera un cupo; no se hace automáticamente al alcanzar cinco. Errores y estados vacíos son explícitos. Los accesos recomendados son ejemplos del catálogo, no recomendaciones personalizadas de IA.
