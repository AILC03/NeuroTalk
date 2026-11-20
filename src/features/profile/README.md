# profile — cuenta

`ProfileScreen.tsx` muestra nombre/correo reales, edita el nombre mediante AuthProvider, cierra sesión y elimina cuenta con confirmación explícita y contraseña.

No permite cambiar el correo ni presenta verificación/reset como implementados. El borrado lo autoriza el backend y aplica cascadas; la UI no manipula tablas. No guardar ni imprimir la contraseña, y limpiar el campo tras intentar una acción.

La aplicación vuelve al acceso cuando la cuenta se elimina o la sesión deja de ser válida. No añadir perfiles clínicos, diagnósticos o información personal innecesaria.
