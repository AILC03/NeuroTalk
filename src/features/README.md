# features — pantallas por funcionalidad

- `auth`: sesión compartida, login y registro.
- `home`: saludo, accesos a escenarios y prácticas pendientes/recientes reales.
- `scenarios`: biblioteca, detalle y configuración opcional/dificultad.
- `practices`: conversación, tarjetas y resultado básico.
- `progress`: historial e indicadores descriptivos calculados sobre todas las páginas de prácticas finalizadas.
- `profile`: edición de nombre, logout y eliminación confirmada de cuenta.

Cada carpeta explica su contrato y límites. Ninguna pantalla accede directamente a PostgreSQL ni al proveedor de IA. La API verifica propietario, límites y estados; la UI no sustituye esas comprobaciones.
