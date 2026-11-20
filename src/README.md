# Código del cliente

Alcance actual: **web para Avance 2**. La base compartida móvil se conserva, pero su desarrollo/prueba está aplazado y no se inician emuladores.

El cliente Expo Android/web consume REST del backend; no accede directamente a PostgreSQL ni a proveedores de IA.

- `lib/`: contrato REST tipado, formato y sesión.
- `theme/`: paleta visual compartida.
- `components/`: controles y contenedor responsive.
- `hooks/`: carga y recarga asíncrona protegida contra respuestas antiguas.
- `navigation/`: rutas internas tipadas.
- `features/`: pantallas de autenticación, inicio, escenarios, prácticas, progreso y perfil.
- `../App.tsx`: composición de sesión y recorrido de pantallas.

Biblioteca, configuración, chat, pausa/reanudación, resultado, historial e indicadores descriptivos ya consumen el backend. No se presentan cifras o feedback ficticios como resultados reales. El feedback personalizado sigue reservado a la integración posterior de IA.

Mantener README por cada nueva carpeta de código propio. Validar con `npm run typecheck` y `npm run build:web`; Android requiere prueba en dispositivo/emulador compatible.
