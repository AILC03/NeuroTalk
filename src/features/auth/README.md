# auth — acceso y sesión

`AuthProvider.tsx` restaura la sesión, expone usuario/login/logout/edición/borrado y escucha expiración desde la API. `AuthScreen.tsx` implementa login y registro con la referencia visual Figma, errores reales y avisos de funciones futuras.

Access token en memoria; refresh web en cookie HttpOnly y Android en SecureStore. No registrar campos sensibles ni copiar credenciales del entorno backend. Un error de conexión no se convierte en un login de demostración.

Registro no inicia sesión automáticamente. Verificación y recuperación por correo aún no existen y la interfaz lo explica. Edad mínima informada, sin mecanismo documental de verificación implementado.

`validation.ts` comprueba nombre, correo y política de contraseña antes de enviar. Cuenta bytes UTF-8 y permite explicar el límite bcrypt sin truncamiento. El botón y Enter usan la misma validación y un bloqueo de envío repetido. Los mensajes por campo complementan, no reemplazan, las validaciones del backend. Pruebas puras en `tests/web.test.ts` y flujo real de navegador en `e2e/web.spec.ts`.
